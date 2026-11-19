
from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.models import StudentProfile

from .models import (
    Skill,
    StudentSkill,
    Interest,
    StudentInterest,
)

from .serializers import (
    SkillSerializer,
    StudentSkillSerializer,
    InterestSerializer,
    StudentInterestSerializer,
)


class StudentDataMixin:
    permission_classes = [IsAuthenticated]

    def get_student_profile(self):
        return get_object_or_404(
            StudentProfile,
            user=self.request.user
        )


# Available Skills
class SkillListView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(
            is_active=True
        ).order_by("name")


# Available Interests
class InterestListView(generics.ListAPIView):
    serializer_class = InterestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Interest.objects.filter(
            is_active=True
        ).order_by("name")


# Student Skills - GET and POST
class StudentSkillListCreateView(
    StudentDataMixin,
    generics.ListCreateAPIView
):
    serializer_class = StudentSkillSerializer

    def get_queryset(self):
        return StudentSkill.objects.filter(
            student=self.get_student_profile()
        ).select_related("skill")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["student"] = self.get_student_profile()
        return context

    def perform_create(self, serializer):
        serializer.save(student=self.get_student_profile())


# Individual Student Skill - GET, PUT, PATCH, DELETE
class StudentSkillDetailView(
    StudentDataMixin,
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = StudentSkillSerializer

    def get_queryset(self):
        return StudentSkill.objects.filter(
            student=self.get_student_profile()
        ).select_related("skill")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["student"] = self.get_student_profile()
        return context


# Student Interests - GET and POST
class StudentInterestListCreateView(
    StudentDataMixin,
    generics.ListCreateAPIView
):
    serializer_class = StudentInterestSerializer

    def get_queryset(self):
        return StudentInterest.objects.filter(
            student=self.get_student_profile()
        ).select_related("interest")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["student"] = self.get_student_profile()
        return context

    def perform_create(self, serializer):
        serializer.save(student=self.get_student_profile())


# Individual Student Interest - GET, PUT, PATCH, DELETE
class StudentInterestDetailView(
    StudentDataMixin,
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = StudentInterestSerializer

    def get_queryset(self):
        return StudentInterest.objects.filter(
            student=self.get_student_profile()
        ).select_related("interest")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["student"] = self.get_student_profile()
        return context
