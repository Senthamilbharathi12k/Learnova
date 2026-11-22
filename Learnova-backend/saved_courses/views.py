
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, transaction

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import StudentProfile
from courses.models import Course

from .models import SavedCourse
from .serializers import SavedCourseSerializer


class SavedCourseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_student(self, user):
        return get_object_or_404(
            StudentProfile,
            user=user
        )

    def get(self, request):
        student = self.get_student(request.user)

        saved_courses = (
            SavedCourse.objects
            .filter(
                student=student,
                course__is_active=True
            )
            .select_related("student", "course")
            .prefetch_related("course__resources")
        )

        serializer = SavedCourseSerializer(
            saved_courses,
            many=True
        )

        return Response({
            "message": "Saved courses retrieved successfully.",
            "total_saved_courses": saved_courses.count(),
            "saved_courses": serializer.data
        })

    def post(self, request):
        student = self.get_student(request.user)

        course_id = request.data.get("course_id")

        if course_id is None:
            return Response({
                "error": "course_id is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        course = get_object_or_404(
            Course,
            id=course_id,
            is_active=True
        )

        saved_course, created = SavedCourse.objects.get_or_create(
            student=student,
            course=course
        )

        serializer = SavedCourseSerializer(saved_course)

        return Response({
            "message": (
                "Course saved successfully."
                if created
                else "Course is already saved."
            ),
            "is_saved": True,
            "created": created,
            "saved_course": serializer.data
        }, status=(
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        ))


class SavedCourseDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, course_id):
        student = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        saved_course = get_object_or_404(
            SavedCourse,
            student=student,
            course_id=course_id
        )

        saved_course.delete()

        return Response({
            "message": "Course removed from saved courses.",
            "course_id": course_id,
            "is_saved": False
        }, status=status.HTTP_200_OK)


class SavedCourseStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        student = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        is_saved = SavedCourse.objects.filter(
            student=student,
            course_id=course_id
        ).exists()

        return Response({
            "course_id": course_id,
            "is_saved": is_saved
        })
