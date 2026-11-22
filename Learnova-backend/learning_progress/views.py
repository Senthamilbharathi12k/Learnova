
from decimal import Decimal
from django.utils import timezone

from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import StudentProfile
from saved_courses.models import SavedCourse

from .models import CourseProgress, LearningSession
from .serializers import (
    CourseProgressSerializer,
    LearningSessionSerializer,
    AddLearningSessionSerializer,
)


def get_student_profile(user):
    return get_object_or_404(StudentProfile, user=user)


class LearningProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = get_student_profile(request.user)

        saved_courses = SavedCourse.objects.filter(
            student=student,
            course__is_active=True
        ).select_related("course")

        with transaction.atomic():
            for saved in saved_courses:
                CourseProgress.objects.get_or_create(
                    student=student,
                    course=saved.course,
                    defaults={
                        "total_lessons": 20,
                        "completed_lessons": 0,
                        "learning_hours": Decimal("0.00"),
                    }
                )

        course_ids = saved_courses.values_list("course_id", flat=True)

        progress = CourseProgress.objects.filter(
            student=student,
            course_id__in=course_ids
        ).select_related("course")

        sessions = LearningSession.objects.filter(
            student=student,
            course_id__in=course_ids
        ).select_related("course")[:50]

        return Response({
            "courses": CourseProgressSerializer(progress, many=True).data,
            "sessions": LearningSessionSerializer(sessions, many=True).data,
        })


class CourseProgressUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, course_id):
        student = get_student_profile(request.user)

        saved = get_object_or_404(
            SavedCourse,
            student=student,
            course_id=course_id,
            course__is_active=True
        )

        progress, _ = CourseProgress.objects.get_or_create(
            student=student,
            course=saved.course,
            defaults={"total_lessons": 20}
        )

        serializer = CourseProgressSerializer(
            progress,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": "Course progress updated successfully.",
            "course": CourseProgressSerializer(progress).data,
        })


class AddLearningSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = get_student_profile(request.user)

        serializer = AddLearningSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course_id = serializer.validated_data["course_id"]
        hours = serializer.validated_data["hours"]

        saved = get_object_or_404(
            SavedCourse,
            student=student,
            course_id=course_id,
            course__is_active=True
        )

        with transaction.atomic():
            progress, _ = CourseProgress.objects.get_or_create(
                student=student,
                course=saved.course,
                defaults={"total_lessons": 20}
            )

            session = LearningSession.objects.create(
                student=student,
                course=saved.course,
                hours=hours
            )

            progress.learning_hours += hours
            progress.save(update_fields=["learning_hours", "updated_at"])

        return Response({
            "message": "Learning session added successfully.",
            "session": LearningSessionSerializer(session).data,
            "learning_hours": progress.learning_hours,
        }, status=status.HTTP_201_CREATED)

class CourseCompletionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        student = get_student_profile(request.user)

        # Confirmation must be the boolean value True.
        if request.data.get("confirm") is not True:
            return Response(
                {"message": "Please confirm course completion."},
                status=status.HTTP_400_BAD_REQUEST
            )

        saved = get_object_or_404(
            SavedCourse,
            student=student,
            course_id=course_id,
            course__is_active=True
        )

        with transaction.atomic():
            progress, _ = CourseProgress.objects.get_or_create(
                student=student,
                course=saved.course,
                defaults={
                    "total_lessons": 20,
                    "completed_lessons": 0,
                    "learning_hours": Decimal("0.00"),
                }
            )

            if progress.completion_status != "COMPLETED":
                progress.completion_status = "COMPLETED"
                progress.completed_at = timezone.now()
                progress.save(
                    update_fields=[
                        "completion_status",
                        "completed_at",
                        "updated_at",
                    ]
                )

        return Response({
            "message": "Course marked as completed successfully.",
            "course_id": saved.course_id,
            "course_name": saved.course.name,
            "completion_status": progress.completion_status,
            "completed_at": progress.completed_at,
        }, status=status.HTTP_200_OK)