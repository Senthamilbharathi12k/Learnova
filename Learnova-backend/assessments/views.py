
from django.shortcuts import get_object_or_404
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from saved_courses.models import SavedCourse
from learning_progress.models import CourseProgress

from accounts.models import StudentProfile

from .models import (
    AssessmentCategory,
    AssessmentAttempt,
    CourseAssessment,
    CourseAssessmentAttempt,
)
from .serializers import (
    AssessmentCategorySerializer,
    AssessmentQuestionSerializer,
    AssessmentAttemptSerializer,
    AssessmentSubmitSerializer,
    CourseAssessmentQuestionSerializer,
    CourseAssessmentSubmitSerializer,
    CourseAssessmentAttemptSerializer,
)


class AssessmentCategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        categories = AssessmentCategory.objects.filter(
            is_active=True,
            skill__is_active=True,
            skill__student_skills__student=profile
        ).distinct().select_related("skill")

        serializer = AssessmentCategorySerializer(
            categories,
            many=True
        )

        return Response({
            "categories": serializer.data
        })


class AssessmentQuestionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category_slug):
        profile = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        category = get_object_or_404(
            AssessmentCategory.objects.filter(
                is_active=True,
                skill__is_active=True,
                skill__student_skills__student=profile
            ).distinct(),
            slug=category_slug
        )

        questions = category.questions.filter(
            is_active=True
        ).order_by("order")

        serializer = AssessmentQuestionSerializer(
            questions,
            many=True
        )

        return Response({
            "category": {
                "id": category.slug,
                "name": category.name,
            },
            "questions": serializer.data
        })


class AssessmentSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AssessmentSubmitSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        category = serializer.validated_data["category"]
        questions = serializer.validated_data["questions"]
        answers = serializer.validated_data["answers"]

        profile = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        # Verify that this category belongs to a skill
        # selected by the current student.
        is_selected_skill = (
            category.is_active
            and category.skill is not None
            and category.skill.is_active
            and category.skill.student_skills.filter(
                student=profile
            ).exists()
        )

        if not is_selected_skill:
            return Response({
                "message": "You can only submit assessments for your selected skills."
            }, status=status.HTTP_403_FORBIDDEN)

        correct_answers = sum(
            1
            for question in questions
            if answers[str(question.id)] == question.correct_answer
        )

        total_questions = len(questions)

        score = round(
            correct_answers / total_questions * 100
        )

        if score >= 80:
            level = "ADVANCED"
        elif score >= 60:
            level = "INTERMEDIATE"
        else:
            level = "BEGINNER"

        with transaction.atomic():
            attempt = AssessmentAttempt.objects.create(
                student=profile,
                category=category,
                score=score,
                correct_answers=correct_answers,
                total_questions=total_questions,
                level=level,
                answers=answers,
            )

        result = AssessmentAttemptSerializer(attempt).data

        # Correct answers are sent ONLY after submission.
        review_answers = []

        for question in questions:
            selected_answer = answers[str(question.id)]
            correct_answer = question.correct_answer

            review_answers.append({
                "question_id": question.id,
                "question": question.question,
                "options": question.options,
                "selected_answer": selected_answer,
                "correct_answer": correct_answer,
                "is_correct": selected_answer == correct_answer,
            })

        result["review_answers"] = review_answers

        return Response({
            "message": "Assessment submitted successfully.",
            "result": result,
        }, status=status.HTTP_201_CREATED)


class AssessmentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        attempts = AssessmentAttempt.objects.filter(
            student=profile
        ).select_related("category")

        serializer = AssessmentAttemptSerializer(
            attempts,
            many=True
        )

        return Response({
            "history": serializer.data,
            "total_attempts": attempts.count(),
        })

class AssessmentAttemptDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, attempt_id):
        profile = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        attempt = get_object_or_404(
            AssessmentAttempt,
            id=attempt_id,
            student=profile
        )

        attempt.delete()

        return Response(
            {
                "message": "Assessment result deleted successfully."
            },
            status=status.HTTP_200_OK
        )


# ==========================================
# COURSE FINAL ASSESSMENT API VIEWS
# ==========================================

def get_course_assessment_context(user, course_id):
    """
    Returns the current student's profile, saved course,
    active final assessment and course progress.
    """

    profile = get_object_or_404(
        StudentProfile,
        user=user
    )

    saved_course = get_object_or_404(
        SavedCourse,
        student=profile,
        course_id=course_id,
        course__is_active=True
    )

    assessment = get_object_or_404(
        CourseAssessment,
        course=saved_course.course,
        is_active=True
    )

    progress = CourseProgress.objects.filter(
        student=profile,
        course=saved_course.course
    ).first()

    return profile, assessment, progress


class CourseFinalAssessmentQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        profile, assessment, progress = (
            get_course_assessment_context(
                request.user,
                course_id
            )
        )

        # Assessment is locked until the student
        # confirms course completion.
        if (
            progress is None
            or progress.completion_status != "COMPLETED"
        ):
            return Response(
                {
                    "message": (
                        "Complete the course before "
                        "starting the final assessment."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        questions = assessment.questions.filter(
            is_active=True
        ).order_by("order")

        if not questions.exists():
            return Response(
                {"message": "No assessment questions available."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CourseAssessmentQuestionSerializer(
            questions,
            many=True
        )

        return Response({
            "course_id": course_id,
            "assessment": {
                "id": assessment.id,
                "title": assessment.title,
                "description": assessment.description,
                "pass_percentage": assessment.pass_percentage,
                "total_questions": questions.count(),
            },
            "questions": serializer.data,
        })


class CourseFinalAssessmentSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        profile, assessment, progress = (
            get_course_assessment_context(
                request.user,
                course_id
            )
        )

        if (
            progress is None
            or progress.completion_status != "COMPLETED"
        ):
            return Response(
                {
                    "message": (
                        "Complete the course before "
                        "submitting the final assessment."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CourseAssessmentSubmitSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        answers = serializer.validated_data["answers"]

        questions = list(
            assessment.questions.filter(
                is_active=True
            ).order_by("order")
        )

        if not questions:
            return Response(
                {"message": "No assessment questions available."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Require exactly one answer for every active question.
        expected_ids = {
            str(question.id) for question in questions
        }

        if set(answers.keys()) != expected_ids:
            return Response(
                {
                    "message": (
                        "Submit exactly one answer "
                        "for every assessment question."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate option indexes on the backend.
        for question in questions:
            selected_answer = answers[str(question.id)]

            if selected_answer >= len(question.options):
                return Response(
                    {
                        "message": (
                            f"Invalid option for question "
                            f"{question.id}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        correct_answers = sum(
            1
            for question in questions
            if answers[str(question.id)] == question.correct_answer
        )

        total_questions = len(questions)

        score = round(
            (correct_answers / total_questions) * 100
        )

        result = (
            "PASS"
            if score >= assessment.pass_percentage
            else "FAIL"
        )

        with transaction.atomic():
            attempt = CourseAssessmentAttempt.objects.create(
                student=profile,
                assessment=assessment,
                score=score,
                correct_answers=correct_answers,
                total_questions=total_questions,
                result=result,
                answers=answers,
            )

        attempt_data = CourseAssessmentAttemptSerializer(
            attempt
        ).data

        return Response(
            {
                "message": "Course final assessment submitted successfully.",
                "attempt": attempt_data,
                "pass_percentage": assessment.pass_percentage,
            },
            status=status.HTTP_201_CREATED
        )


class CourseFinalAssessmentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        profile, assessment, progress = (
            get_course_assessment_context(
                request.user,
                course_id
            )
        )

        attempts = CourseAssessmentAttempt.objects.filter(
            student=profile,
            assessment=assessment
        ).select_related(
            "assessment",
            "assessment__course"
        ).order_by("-completed_at")

        serializer = CourseAssessmentAttemptSerializer(
            attempts,
            many=True
        )

        return Response({
            "course_id": course_id,
            "history": serializer.data,
            "total_attempts": attempts.count(),
        })
