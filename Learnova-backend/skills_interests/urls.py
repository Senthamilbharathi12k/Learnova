
from django.urls import path

from .views import (
    SkillListView,
    InterestListView,
    StudentSkillListCreateView,
    StudentSkillDetailView,
    StudentInterestListCreateView,
    StudentInterestDetailView,
)

urlpatterns = [
    path("skills/", SkillListView.as_view(), name="skill-list"),

    path(
        "interests/",
        InterestListView.as_view(),
        name="interest-list"
    ),

    path(
        "student/skills/",
        StudentSkillListCreateView.as_view(),
        name="student-skill-list-create"
    ),

    path(
        "student/skills/<int:pk>/",
        StudentSkillDetailView.as_view(),
        name="student-skill-detail"
    ),

    path(
        "student/interests/",
        StudentInterestListCreateView.as_view(),
        name="student-interest-list-create"
    ),

    path(
        "student/interests/<int:pk>/",
        StudentInterestDetailView.as_view(),
        name="student-interest-detail"
    ),
]
