
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import StudentProfile
from skills_interests.models import StudentSkill, StudentInterest

from .models import Course, CourseResource
from .serializers import (
    CourseRecommendationSerializer,
    CourseDiscoverySerializer,
)


def get_matching_courses(student, courses=None):
    """
    Shared rule-based matching logic for Recommendations
    and Course Discovery.
    """

    student_skill_ids = set(
        StudentSkill.objects.filter(
            student=student,
            skill__is_active=True
        ).values_list("skill_id", flat=True)
    )

    student_interest_ids = set(
        StudentInterest.objects.filter(
            student=student,
            interest__is_active=True
        ).values_list("interest_id", flat=True)
    )

    if not student_skill_ids and not student_interest_ids:
        return []

    if courses is None:
        courses = Course.objects.filter(is_active=True)

    courses = courses.prefetch_related(
        "course_skills__skill",
        "course_interests__interest"
    )

    matching_courses = []

    for course in courses:

        course_skill_mappings = [
            mapping
            for mapping in course.course_skills.all()
            if mapping.skill.is_active
        ]

        course_interest_mappings = [
            mapping
            for mapping in course.course_interests.all()
            if mapping.interest.is_active
        ]

        matched_skills = [
            mapping.skill.name
            for mapping in course_skill_mappings
            if mapping.skill_id in student_skill_ids
        ]

        matched_interests = [
            mapping.interest.name
            for mapping in course_interest_mappings
            if mapping.interest_id in student_interest_ids
        ]

        skill_percentage = (
            len(matched_skills) / len(course_skill_mappings) * 100
            if course_skill_mappings else 0
        )

        interest_percentage = (
            len(matched_interests) / len(course_interest_mappings) * 100
            if course_interest_mappings else 0
        )

        if student_skill_ids and student_interest_ids:
            score = (
                skill_percentage * 0.70
                + interest_percentage * 0.30
            )
        elif student_skill_ids:
            score = skill_percentage
        else:
            score = interest_percentage

        if score <= 0:
            continue

        course.match_percentage = round(score)
        course.matched_skills = matched_skills
        course.matched_interests = matched_interests

        matching_courses.append(course)

    matching_courses.sort(
        key=lambda course: (
            -course.match_percentage,
            course.name
        )
    )

    return matching_courses


class CourseRecommendationView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        student = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        recommended_courses = get_matching_courses(student)

        if not recommended_courses:
            return Response({
                "message": (
                    "Please add your skills and interests "
                    "to get course recommendations."
                ),
                "total_recommendations": 0,
                "recommendations": []
            })

        serializer = CourseRecommendationSerializer(
            recommended_courses,
            many=True
        )

        return Response({
            "message": "Course recommendations generated successfully.",
            "total_recommendations": len(recommended_courses),
            "recommendations": serializer.data
        })


class CourseDiscoveryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        student = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        search = request.query_params.get(
            "search", ""
        ).strip()

        category = request.query_params.get(
            "category", ""
        ).strip()

        learning_mode = request.query_params.get(
            "learning_mode", ""
        ).strip().upper()

        pricing_type = request.query_params.get(
            "pricing_type", ""
        ).strip().upper()

        # Validate learning mode.
        valid_learning_modes = dict(
            Course.LEARNING_MODE_CHOICES
        )

        if learning_mode and learning_mode not in valid_learning_modes:
            return Response({
                "error": "Invalid learning_mode. Use ONLINE or OFFLINE."
            }, status=400)

        # Validate resource pricing type.
        valid_pricing_types = dict(
            CourseResource.PRICING_TYPE_CHOICES
        )

        if pricing_type and pricing_type not in valid_pricing_types:
            return Response({
                "error": "Invalid pricing_type. Use FREE or PAID."
            }, status=400)

        # Start with active courses.
        courses = Course.objects.filter(is_active=True)

        # Apply course-level filters.
        if search:
            courses = courses.filter(
                name__icontains=search
            )

        if category:
            courses = courses.filter(
                category__iexact=category
            )

        if learning_mode:
            courses = courses.filter(
                learning_mode=learning_mode
            )

        # Fetch only active resources.
        courses = courses.prefetch_related(
            Prefetch(
                "resources",
                queryset=CourseResource.objects.filter(
                    is_active=True
                ).order_by("pricing_type", "title"),
                to_attr="active_resources"
            )
        )

        # Only courses matching student skills/interests.
        matching_courses = get_matching_courses(
            student,
            courses
        )

        filtered_courses = []

        for course in matching_courses:

            resources = getattr(
                course,
                "active_resources",
                []
            )

            # Filter resources by FREE or PAID.
            if pricing_type:
                resources = [
                    resource
                    for resource in resources
                    if resource.pricing_type == pricing_type
                ]

            # Serializer reads this attribute.
            course.filtered_resources = resources

            # Exclude courses without the requested resource type.
            if pricing_type and not resources:
                continue

            filtered_courses.append(course)

        if not filtered_courses:
            return Response({
                "message": (
                    "No matching courses or resources found. "
                    "Try changing your filters or updating "
                    "your skills and interests."
                ),
                "total_courses": 0,
                "courses": []
            })

        serializer = CourseDiscoverySerializer(
            filtered_courses,
            many=True
        )

        return Response({
            "message": "Matching courses retrieved successfully.",
            "total_courses": len(filtered_courses),
            "courses": serializer.data
        })
