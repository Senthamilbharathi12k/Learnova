
from django.contrib.auth.models import User
from django.test import TestCase

from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import StudentProfile
from skills_interests.models import (
    Skill,
    Interest,
    StudentSkill,
    StudentInterest,
)

from .models import (
    Course,
    CourseSkill,
    CourseInterest,
    CourseResource,
)

from .serializers import CourseResourceSerializer


class CourseAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="course_student@example.com",
            email="course_student@example.com",
            password="TestPass123!",
        )

        self.profile = StudentProfile.objects.create(
            user=self.user,
            full_name="Course Test Student",
        )

        self.skill_python = Skill.objects.create(
            name="Python",
            is_active=True,
        )

        self.skill_sql = Skill.objects.create(
            name="SQL",
            is_active=True,
        )

        self.interest_web = Interest.objects.create(
            name="Web Development",
            is_active=True,
        )

        self.interest_data = Interest.objects.create(
            name="Data Science",
            is_active=True,
        )

        self.inactive_skill = Skill.objects.create(
            name="Inactive Skill",
            is_active=False,
        )

        self.inactive_interest = Interest.objects.create(
            name="Inactive Interest",
            is_active=False,
        )

        self.recommendations_url = "/api/courses/recommendations/"
        self.discovery_url = "/api/courses/discovery/"

        self.client.force_authenticate(user=self.user)

    # =====================================================
    # HELPER FUNCTIONS
    # =====================================================

    def create_course(
        self,
        name,
        skills=None,
        interests=None,
        category="Development",
        learning_mode="ONLINE",
        pricing_type="FREE",
        is_active=True,
    ):
        course = Course.objects.create(
            name=name,
            category=category,
            description=f"{name} course description",
            learning_mode=learning_mode,
            pricing_type=pricing_type,
            difficulty_level="BEGINNER",
            duration_weeks=4,
            is_active=is_active,
        )

        for skill in skills or []:
            CourseSkill.objects.create(
                course=course,
                skill=skill,
            )

        for interest in interests or []:
            CourseInterest.objects.create(
                course=course,
                interest=interest,
            )

        return course

    def create_resource(
        self,
        course,
        title,
        provider="Test Provider",
        pricing_type="FREE",
        external_url="https://example.com/course",
        price=None,
        is_active=True,
    ):
        return CourseResource.objects.create(
            course=course,
            title=title,
            provider=provider,
            pricing_type=pricing_type,
            external_url=external_url,
            price=price,
            is_active=is_active,
        )

    # =====================================================
    # AUTHENTICATION TESTS
    # =====================================================

    def test_recommendations_require_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.recommendations_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_discovery_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.discovery_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # =====================================================
    # RECOMMENDATION TESTS
    # =====================================================

    def test_empty_skills_and_interests_returns_empty_recommendations(self):
        response = self.client.get(self.recommendations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_recommendations"], 0)
        self.assertEqual(response.data["recommendations"], [])

    def test_course_recommendation_with_full_match_returns_100(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        StudentInterest.objects.create(
            student=self.profile,
            interest=self.interest_web,
        )

        self.create_course(
            "Python Web Development",
            skills=[self.skill_python],
            interests=[self.interest_web],
        )

        response = self.client.get(self.recommendations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_recommendations"], 1)

        course = response.data["recommendations"][0]

        self.assertEqual(course["match_percentage"], 100)
        self.assertEqual(course["matched_skills"], ["Python"])
        self.assertEqual(
            course["matched_interests"],
            ["Web Development"],
        )

    def test_recommendation_uses_70_30_weighted_score(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        StudentInterest.objects.create(
            student=self.profile,
            interest=self.interest_web,
        )

        self.create_course(
            "Weighted Match Course",
            skills=[self.skill_python, self.skill_sql],
            interests=[self.interest_web, self.interest_data],
        )

        response = self.client.get(self.recommendations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        course = response.data["recommendations"][0]

        # Skill match = 50%
        # Interest match = 50%
        # Final score = 50 * 0.70 + 50 * 0.30 = 50
        self.assertEqual(course["match_percentage"], 50)

    def test_skills_only_recommendation_uses_skill_percentage(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        self.create_course(
            "Python Course",
            skills=[self.skill_python, self.skill_sql],
        )

        response = self.client.get(self.recommendations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_recommendations"], 1)

        self.assertEqual(
            response.data["recommendations"][0]["match_percentage"],
            50,
        )

    def test_interests_only_recommendation_uses_interest_percentage(self):
        StudentInterest.objects.create(
            student=self.profile,
            interest=self.interest_web,
        )

        self.create_course(
            "Web Interest Course",
            interests=[self.interest_web, self.interest_data],
        )

        response = self.client.get(self.recommendations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_recommendations"], 1)

        self.assertEqual(
            response.data["recommendations"][0]["match_percentage"],
            50,
        )

    def test_courses_without_matching_skills_or_interests_are_excluded(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        self.create_course(
            "Unmatched Course",
            skills=[self.skill_sql],
        )

        response = self.client.get(self.recommendations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_recommendations"], 0)

    def test_inactive_courses_are_not_recommended(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        self.create_course(
            "Inactive Python Course",
            skills=[self.skill_python],
            is_active=False,
        )

        response = self.client.get(self.recommendations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_recommendations"], 0)

    def test_inactive_skill_is_not_counted_in_recommendation(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        self.create_course(
            "Active Python Course",
            skills=[self.skill_python, self.inactive_skill],
        )

        response = self.client.get(self.recommendations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            response.data["recommendations"][0]["match_percentage"],
            100,
        )

    def test_inactive_interest_is_not_counted_in_recommendation(self):
        StudentInterest.objects.create(
            student=self.profile,
            interest=self.interest_web,
        )

        self.create_course(
            "Active Web Course",
            interests=[self.interest_web, self.inactive_interest],
        )

        response = self.client.get(self.recommendations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            response.data["recommendations"][0]["match_percentage"],
            100,
        )

    def test_recommendations_are_sorted_by_match_percentage(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        self.create_course(
            "Partial Match",
            skills=[self.skill_python, self.skill_sql],
        )

        self.create_course(
            "Full Match",
            skills=[self.skill_python],
        )

        response = self.client.get(self.recommendations_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        recommendations = response.data["recommendations"]

        self.assertEqual(
            recommendations[0]["name"],
            "Full Match",
        )

        self.assertEqual(
            recommendations[0]["match_percentage"],
            100,
        )

    # =====================================================
    # COURSE DISCOVERY TESTS
    # =====================================================

    def test_discovery_returns_active_courses(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        self.create_course(
            "Active Course",
            skills=[self.skill_python],
        )

        self.create_course(
            "Inactive Course",
            skills=[self.skill_python],
            is_active=False,
        )

        response = self.client.get(self.discovery_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_courses"], 1)

        self.assertEqual(
            response.data["courses"][0]["name"],
            "Active Course",
        )

    def test_discovery_search_filters_course_name(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        self.create_course(
            "Python Programming",
            skills=[self.skill_python],
        )

        self.create_course(
            "Java Programming",
            skills=[self.skill_sql],
        )

        response = self.client.get(
            self.discovery_url,
            {"search": "Python"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_courses"], 1)

        self.assertEqual(
            response.data["courses"][0]["name"],
            "Python Programming",
        )

    def test_discovery_category_filter(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        self.create_course(
            "Python Development",
            skills=[self.skill_python],
            category="Development",
        )

        self.create_course(
            "Data Analytics",
            skills=[self.skill_sql],
            category="Analytics",
        )

        response = self.client.get(
            self.discovery_url,
            {"category": "Development"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_courses"], 1)

        self.assertEqual(
            response.data["courses"][0]["name"],
            "Python Development",
        )

    def test_discovery_online_filter(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        self.create_course(
            "Online Course",
            skills=[self.skill_python],
            learning_mode="ONLINE",
        )

        self.create_course(
            "Offline Course",
            skills=[self.skill_sql],
            learning_mode="OFFLINE",
        )

        response = self.client.get(
            self.discovery_url,
            {"learning_mode": "ONLINE"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_courses"], 1)

        self.assertEqual(
            response.data["courses"][0]["learning_mode"],
            "ONLINE",
        )

    def test_discovery_free_filter(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        free_course = self.create_course(
            "Free Course",
            skills=[self.skill_python],
        )

        paid_course = self.create_course(
            "Paid Course",
            skills=[self.skill_python],
        )

        self.create_resource(
            course=free_course,
            title="Free Python Tutorial",
            pricing_type="FREE",
        )

        self.create_resource(
            course=paid_course,
            title="Paid Python Course",
            pricing_type="PAID",
            price=999,
        )

        response = self.client.get(
            self.discovery_url,
            {"pricing_type": "FREE"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_courses"], 1)

        course = response.data["courses"][0]

        self.assertEqual(course["name"], "Free Course")
        self.assertEqual(len(course["resources"]), 1)

        self.assertEqual(
            course["resources"][0]["pricing_type"],
            "FREE",
        )

    def test_discovery_combined_filters(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        free_course = self.create_course(
            "Online Free Development",
            skills=[self.skill_python],
            category="Development",
            learning_mode="ONLINE",
        )

        paid_course = self.create_course(
            "Offline Paid Development",
            skills=[self.skill_python],
            category="Development",
            learning_mode="OFFLINE",
        )

        self.create_resource(
            course=free_course,
            title="Free Development Course",
            pricing_type="FREE",
        )

        self.create_resource(
            course=paid_course,
            title="Paid Development Course",
            pricing_type="PAID",
            price=1499,
        )

        response = self.client.get(
            self.discovery_url,
            {
                "category": "Development",
                "learning_mode": "ONLINE",
                "pricing_type": "FREE",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_courses"], 1)

        course = response.data["courses"][0]

        self.assertEqual(
            course["name"],
            "Online Free Development",
        )

        self.assertEqual(
            course["resources"][0]["pricing_type"],
            "FREE",
        )

    def test_invalid_learning_mode_returns_400(self):
        response = self.client.get(
            self.discovery_url,
            {"learning_mode": "HYBRID"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_pricing_type_returns_400(self):
        response = self.client.get(
            self.discovery_url,
            {"pricing_type": "PREMIUM"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =====================================================
    # COURSE RESOURCE TESTS
    # =====================================================

    def test_course_can_have_both_free_and_paid_resources(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        course = self.create_course(
            "Python Programming",
            skills=[self.skill_python],
        )

        self.create_resource(
            course=course,
            title="Free Python Tutorial",
            pricing_type="FREE",
        )

        self.create_resource(
            course=course,
            title="Advanced Python Course",
            pricing_type="PAID",
            price=1999,
        )

        response = self.client.get(self.discovery_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_courses"], 1)

        resources = response.data["courses"][0]["resources"]

        self.assertEqual(len(resources), 2)

        pricing_types = {
            resource["pricing_type"]
            for resource in resources
        }

        self.assertEqual(pricing_types, {"FREE", "PAID"})

    def test_paid_filter_returns_only_paid_resources(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        course = self.create_course(
            "Python Programming",
            skills=[self.skill_python],
        )

        self.create_resource(
            course=course,
            title="Free Python Tutorial",
            pricing_type="FREE",
        )

        self.create_resource(
            course=course,
            title="Paid Python Course",
            pricing_type="PAID",
            price=999,
        )

        response = self.client.get(
            self.discovery_url,
            {"pricing_type": "PAID"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_courses"], 1)

        resources = response.data["courses"][0]["resources"]

        self.assertEqual(len(resources), 1)
        self.assertEqual(resources[0]["pricing_type"], "PAID")

    def test_inactive_resources_are_excluded(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        course = self.create_course(
            "Python Programming",
            skills=[self.skill_python],
        )

        self.create_resource(
            course=course,
            title="Active Free Resource",
            pricing_type="FREE",
        )

        self.create_resource(
            course=course,
            title="Inactive Free Resource",
            pricing_type="FREE",
            is_active=False,
        )

        response = self.client.get(self.discovery_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        resources = response.data["courses"][0]["resources"]

        self.assertEqual(len(resources), 1)

        self.assertEqual(
            resources[0]["title"],
            "Active Free Resource",
        )

    def test_course_without_requested_resource_type_is_excluded(self):
        StudentSkill.objects.create(
            student=self.profile,
            skill=self.skill_python,
            proficiency="BEGINNER",
        )

        course = self.create_course(
            "Free Only Course",
            skills=[self.skill_python],
        )

        self.create_resource(
            course=course,
            title="Free Python Tutorial",
            pricing_type="FREE",
        )

        response = self.client.get(
            self.discovery_url,
            {"pricing_type": "PAID"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_courses"], 0)
        self.assertEqual(response.data["courses"], [])

    def test_free_resource_cannot_have_price(self):
        serializer = CourseResourceSerializer(
            data={
                "title": "Free Python Course",
                "provider": "Test Provider",
                "pricing_type": "FREE",
                "external_url": "https://example.com/free",
                "price": "499.00",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("price", serializer.errors)

    def test_paid_resource_rejects_negative_price(self):
        serializer = CourseResourceSerializer(
            data={
                "title": "Paid Python Course",
                "provider": "Test Provider",
                "pricing_type": "PAID",
                "external_url": "https://example.com/paid",
                "price": "-100.00",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("price", serializer.errors)
