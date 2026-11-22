
from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import (
    ExperienceProgram,
    ExperienceEnrollment,
    ExperienceSubmission,
)

from .serializers import (
    ExperienceProgramListSerializer,
    ExperienceProgramDetailSerializer,
    ExperienceEnrollmentCreateSerializer,
    ExperienceEnrollmentSerializer,
    ExperienceSubmissionSerializer,
)


class ExperienceProgramListView(generics.ListAPIView):
    serializer_class = ExperienceProgramListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExperienceProgram.objects.filter(
            is_active=True
        ).order_by("title")


class ExperienceProgramDetailView(generics.RetrieveAPIView):
    queryset = ExperienceProgram.objects.filter(is_active=True)
    serializer_class = ExperienceProgramDetailSerializer
    permission_classes = [IsAuthenticated]


class ExperienceEnrollmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            ExperienceEnrollment.objects
            .filter(student=self.request.user)
            .select_related("program")
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ExperienceEnrollmentCreateSerializer

        return ExperienceEnrollmentSerializer


class ExperienceEnrollmentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ExperienceEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExperienceEnrollment.objects.filter(
            student=self.request.user
        ).select_related("program")


class ExperienceSubmissionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExperienceSubmissionSerializer

    def get_enrollment(self):
        enrollment = get_object_or_404(
            ExperienceEnrollment,
            pk=self.kwargs["enrollment_id"],
        )

        if enrollment.student_id != self.request.user.id:
            raise PermissionDenied(
                "You cannot access another student's enrollment."
            )

        return enrollment

    def get_queryset(self):
        enrollment = self.get_enrollment()

        return (
            ExperienceSubmission.objects
            .filter(enrollment=enrollment)
            .select_related("task")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["enrollment"] = self.get_enrollment()
        return context

    def perform_create(self, serializer):
        serializer.save()
