
from django.contrib.auth.models import User
from django.test import TestCase

from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import StudentProfile
from .models import Skill, StudentSkill, Interest, StudentInterest


class SkillsInterestsAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user1 = User.objects.create_user(
            username="student1@example.com",
            email="student1@example.com",
            password="TestPass123!",
        )
        self.profile1 = StudentProfile.objects.create(
            user=self.user1,
            full_name="Student One",
        )

        self.user2 = User.objects.create_user(
            username="student2@example.com",
            email="student2@example.com",
            password="TestPass123!",
        )
        self.profile2 = StudentProfile.objects.create(
            user=self.user2,
            full_name="Student Two",
        )

        self.skill1 = Skill.objects.create(
            name="Python",
            description="Python programming",
            is_active=True,
        )
        self.skill2 = Skill.objects.create(
            name="Java",
            description="Java programming",
            is_active=True,
        )
        self.inactive_skill = Skill.objects.create(
            name="Inactive Skill",
            is_active=False,
        )

        self.interest1 = Interest.objects.create(
            name="Web Development",
            description="Building websites",
            is_active=True,
        )
        self.interest2 = Interest.objects.create(
            name="Data Science",
            description="Data analysis",
            is_active=True,
        )
        self.inactive_interest = Interest.objects.create(
            name="Inactive Interest",
            is_active=False,
        )

        self.skills_url = "/api/skills/"
        self.interests_url = "/api/interests/"
        self.student_skills_url = "/api/student/skills/"
        self.student_interests_url = "/api/student/interests/"

    def authenticate(self, user=None):
        self.client.force_authenticate(
            user=user or self.user1
        )

    # AUTHENTICATION

    def test_skills_api_requires_authentication(self):
        response = self.client.get(self.skills_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_interests_api_requires_authentication(self):
        response = self.client.get(self.interests_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_skills_api_requires_authentication(self):
        response = self.client.get(self.student_skills_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_interests_api_requires_authentication(self):
        response = self.client.get(self.student_interests_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # MASTER SKILL AND INTEREST LISTS

    def test_active_skills_are_listed(self):
        self.authenticate()

        response = self.client.get(self.skills_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        skill_ids = [item["id"] for item in response.data]

        self.assertIn(self.skill1.id, skill_ids)
        self.assertIn(self.skill2.id, skill_ids)
        self.assertNotIn(self.inactive_skill.id, skill_ids)

    def test_active_interests_are_listed(self):
        self.authenticate()

        response = self.client.get(self.interests_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        interest_ids = [item["id"] for item in response.data]

        self.assertIn(self.interest1.id, interest_ids)
        self.assertIn(self.interest2.id, interest_ids)
        self.assertNotIn(self.inactive_interest.id, interest_ids)

    # STUDENT SKILLS

    def test_student_can_add_skill(self):
        self.authenticate()

        response = self.client.post(
            self.student_skills_url,
            {
                "skill": self.skill1.id,
                "proficiency": "BEGINNER",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            StudentSkill.objects.filter(
                student=self.profile1,
                skill=self.skill1,
            ).exists()
        )

    def test_student_skill_is_saved_for_logged_in_student(self):
        self.authenticate(self.user2)

        response = self.client.post(
            self.student_skills_url,
            {
                "skill": self.skill1.id,
                "proficiency": "INTERMEDIATE",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            StudentSkill.objects.filter(
                student=self.profile2,
                skill=self.skill1,
            ).exists()
        )

        self.assertFalse(
            StudentSkill.objects.filter(
                student=self.profile1,
                skill=self.skill1,
            ).exists()
        )

    def test_duplicate_student_skill_is_rejected(self):
        self.authenticate()

        StudentSkill.objects.create(
            student=self.profile1,
            skill=self.skill1,
            proficiency="BEGINNER",
        )

        response = self.client.post(
            self.student_skills_url,
            {
                "skill": self.skill1.id,
                "proficiency": "ADVANCED",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_skill_cannot_be_added(self):
        self.authenticate()

        response = self.client.post(
            self.student_skills_url,
            {
                "skill": self.inactive_skill.id,
                "proficiency": "BEGINNER",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_student_can_view_own_skills_only(self):
        StudentSkill.objects.create(
            student=self.profile1,
            skill=self.skill1,
            proficiency="BEGINNER",
        )
        StudentSkill.objects.create(
            student=self.profile2,
            skill=self.skill2,
            proficiency="ADVANCED",
        )

        self.authenticate(self.user1)

        response = self.client.get(self.student_skills_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["skill"],
            self.skill1.id,
        )

    def test_student_cannot_access_another_students_skill(self):
        other_skill = StudentSkill.objects.create(
            student=self.profile2,
            skill=self.skill2,
            proficiency="BEGINNER",
        )

        self.authenticate(self.user1)

        response = self.client.get(
            f"{self.student_skills_url}{other_skill.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_student_can_update_own_skill(self):
        student_skill = StudentSkill.objects.create(
            student=self.profile1,
            skill=self.skill1,
            proficiency="BEGINNER",
        )

        self.authenticate()

        response = self.client.patch(
            f"{self.student_skills_url}{student_skill.id}/",
            {"proficiency": "ADVANCED"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        student_skill.refresh_from_db()
        self.assertEqual(
            student_skill.proficiency,
            "ADVANCED",
        )

    def test_student_can_delete_own_skill(self):
        student_skill = StudentSkill.objects.create(
            student=self.profile1,
            skill=self.skill1,
            proficiency="BEGINNER",
        )

        self.authenticate()

        response = self.client.delete(
            f"{self.student_skills_url}{student_skill.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            StudentSkill.objects.filter(
                id=student_skill.id
            ).exists()
        )

    # STUDENT INTERESTS

    def test_student_can_add_interest(self):
        self.authenticate()

        response = self.client.post(
            self.student_interests_url,
            {"interest": self.interest1.id},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            StudentInterest.objects.filter(
                student=self.profile1,
                interest=self.interest1,
            ).exists()
        )

    def test_duplicate_student_interest_is_rejected(self):
        self.authenticate()

        StudentInterest.objects.create(
            student=self.profile1,
            interest=self.interest1,
        )

        response = self.client.post(
            self.student_interests_url,
            {"interest": self.interest1.id},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_interest_cannot_be_added(self):
        self.authenticate()

        response = self.client.post(
            self.student_interests_url,
            {"interest": self.inactive_interest.id},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_student_can_view_own_interests_only(self):
        StudentInterest.objects.create(
            student=self.profile1,
            interest=self.interest1,
        )
        StudentInterest.objects.create(
            student=self.profile2,
            interest=self.interest2,
        )

        self.authenticate(self.user1)

        response = self.client.get(self.student_interests_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["interest"],
            self.interest1.id,
        )

    def test_student_cannot_access_another_students_interest(self):
        other_interest = StudentInterest.objects.create(
            student=self.profile2,
            interest=self.interest2,
        )

        self.authenticate(self.user1)

        response = self.client.get(
            f"{self.student_interests_url}{other_interest.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_student_can_delete_own_interest(self):
        student_interest = StudentInterest.objects.create(
            student=self.profile1,
            interest=self.interest1,
        )

        self.authenticate()

        response = self.client.delete(
            f"{self.student_interests_url}{student_interest.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            StudentInterest.objects.filter(
                id=student_interest.id
            ).exists()
        )
