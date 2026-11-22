
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import StudentProfile
from skills_interests.models import StudentSkill, StudentInterest
from assessments.models import AssessmentAttempt

from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status

from .models import (
    Course,
    CourseResource,
    CourseEnrollment,
)

from .serializers import (
    CourseRecommendationSerializer,
    CourseDiscoverySerializer,
    CourseEnrollmentSerializer,
    CourseEnrollmentProgressSerializer,
)


def get_latest_assessment_performance(student):
    """
    Return the latest assessment attempt for each skill
    belonging to the current student.
    """

    attempts = (
        AssessmentAttempt.objects
        .filter(
            student=student,
            category__skill__isnull=False,
            category__skill__is_active=True,
        )
        .select_related(
            "category",
            "category__skill",
        )
        .order_by(
            "category__skill_id",
            "-completed_at",
            "-id",
        )
    )

    latest_by_skill = {}

    for attempt in attempts:
        skill_id = attempt.category.skill_id

        if skill_id not in latest_by_skill:
            latest_by_skill[skill_id] = {
                "skill": attempt.category.skill.name,
                "score": attempt.score,
                "level": attempt.level,
                "completed_at": attempt.completed_at,
                "category_name": attempt.category.name,
                "attempt_id": attempt.id,
            }

    return latest_by_skill


def get_matching_courses(student, courses=None):
    """
    Shared rule-based matching logic for Recommendations
    and Course Discovery.

    Overall match:
    - Skills: 70%
    - Interests: 30%

    If only one profile category exists, use that category.
    Assessment performance is displayed separately and
    does not modify the existing match formula.
    """

    student_skill_ids = set(
        StudentSkill.objects.filter(
            student=student,
            skill__is_active=True,
        ).values_list("skill_id", flat=True)
    )

    student_interest_ids = set(
        StudentInterest.objects.filter(
            student=student,
            interest__is_active=True,
        ).values_list("interest_id", flat=True)
    )

    if not student_skill_ids and not student_interest_ids:
        return []

    if courses is None:
        courses = Course.objects.filter(is_active=True)

    courses = courses.prefetch_related(
        "course_skills__skill",
        "course_interests__interest",
    )

    latest_assessments = get_latest_assessment_performance(student)

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
            if course_skill_mappings
            else 0
        )

        interest_percentage = (
            len(matched_interests) / len(course_interest_mappings) * 100
            if course_interest_mappings
            else 0
        )

        # Preserve the existing 70:30 formula.
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

        # Assessment performance for skills related to this course.
        assessment_performance = []

        for mapping in course_skill_mappings:
            skill_id = mapping.skill_id
            latest_attempt = latest_assessments.get(skill_id)

            if latest_attempt:
                assessment_performance.append({
                    "skill": mapping.skill.name,
                    "score": latest_attempt["score"],
                    "level": latest_attempt["level"],
                    "completed_at": latest_attempt["completed_at"],
                    "category_name": latest_attempt["category_name"],
                    "attempt_id": latest_attempt["attempt_id"],
                    "status": "COMPLETED",
                    "matched_with_student": (
                        skill_id in student_skill_ids
                    ),
                })
            else:
                assessment_performance.append({
                    "skill": mapping.skill.name,
                    "score": None,
                    "level": None,
                    "completed_at": None,
                    "category_name": None,
                    "attempt_id": None,
                    "status": "NOT_ATTEMPTED",
                    "matched_with_student": (
                        skill_id in student_skill_ids
                    ),
                })

        completed_scores = [
            item["score"]
            for item in assessment_performance
            if item["score"] is not None
        ]

        assessment_average_score = (
            round(
                sum(completed_scores) / len(completed_scores)
            )
            if completed_scores
            else None
        )

        course.match_percentage = round(score)
        course.skill_match_percentage = round(skill_percentage)
        course.interest_match_percentage = round(interest_percentage)

        course.matched_skills = matched_skills
        course.matched_interests = matched_interests

        course.assessment_performance = assessment_performance
        course.assessment_average_score = assessment_average_score
        course.assessed_skills_count = len(completed_scores)

        matching_courses.append(course)

    matching_courses.sort(
        key=lambda course: (
            -course.match_percentage,
            course.name,
        )
    )

    return matching_courses


class CourseRecommendationView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        student = get_object_or_404(
            StudentProfile,
            user=request.user,
        )

        recommended_courses = get_matching_courses(student)

        if not recommended_courses:
            return Response({
                "message": (
                    "Please add your skills and interests "
                    "to get course recommendations."
                ),
                "total_recommendations": 0,
                "recommendations": [],
            })

        serializer = CourseRecommendationSerializer(
            recommended_courses,
            many=True,
        )

        return Response({
            "message": "Course recommendations generated successfully.",
            "total_recommendations": len(recommended_courses),
            "recommendations": serializer.data,
        })


class CourseDiscoveryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        student = get_object_or_404(
            StudentProfile,
            user=request.user,
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

        valid_learning_modes = dict(
            Course.LEARNING_MODE_CHOICES
        )

        if learning_mode and learning_mode not in valid_learning_modes:
            return Response({
                "error": "Invalid learning_mode. Use ONLINE or OFFLINE."
            }, status=400)

        valid_pricing_types = dict(
            CourseResource.PRICING_TYPE_CHOICES
        )

        if pricing_type and pricing_type not in valid_pricing_types:
            return Response({
                "error": "Invalid pricing_type. Use FREE or PAID."
            }, status=400)

        courses = Course.objects.filter(is_active=True)

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

        courses = courses.prefetch_related(
            Prefetch(
                "resources",
                queryset=CourseResource.objects.filter(
                    is_active=True
                ).order_by("pricing_type", "title"),
                to_attr="active_resources",
            )
        )

        matching_courses = get_matching_courses(
            student,
            courses,
        )

        filtered_courses = []

        for course in matching_courses:

            resources = getattr(
                course,
                "active_resources",
                [],
            )

            if pricing_type:
                resources = [
                    resource
                    for resource in resources
                    if resource.pricing_type == pricing_type
                ]

            course.filtered_resources = resources

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
                "courses": [],
            })

        serializer = CourseDiscoverySerializer(
            filtered_courses,
            many=True,
        )

        return Response({
            "message": "Matching courses retrieved successfully.",
            "total_courses": len(filtered_courses),
            "courses": serializer.data,
        })


# ==========================================
# COURSE ENROLLMENT API
# ==========================================

class CourseEnrollmentListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        enrollments = (
            CourseEnrollment.objects
            .filter(student=request.user)
            .select_related("course")
        )

        serializer = CourseEnrollmentSerializer(
            enrollments,
            many=True,
        )

        return Response({
            "total_enrollments": enrollments.count(),
            "enrollments": serializer.data,
        })

    def post(self, request):

        serializer = CourseEnrollmentSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        enrollment = serializer.save(
            student=request.user,
        )

        return Response({
            "message": "Course enrollment successful.",
            "enrollment": CourseEnrollmentSerializer(
                enrollment
            ).data,
        }, status=201)


class CourseEnrollmentProgressView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        enrollment = get_object_or_404(
            CourseEnrollment,
            pk=pk,
            student=request.user,
        )

        serializer = CourseEnrollmentProgressSerializer(
            enrollment,
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        enrollment = serializer.save()

        return Response({
            "message": "Course progress updated successfully.",
            "enrollment": CourseEnrollmentSerializer(
                enrollment
            ).data,
        })

# ==========================================
# COURSE LESSON MANAGEMENT API
# ==========================================
