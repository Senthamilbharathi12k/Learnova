
from django.urls import path

from .views import (
    ExperienceProgramListView,
    ExperienceProgramDetailView,
    ExperienceEnrollmentListCreateView,
    ExperienceEnrollmentDetailView,
    ExperienceSubmissionListCreateView,
)

urlpatterns = [
    path(
        "programs/",
        ExperienceProgramListView.as_view(),
        name="experience-program-list",
    ),
    path(
        "programs/<int:pk>/",
        ExperienceProgramDetailView.as_view(),
        name="experience-program-detail",
    ),
    path(
        "enrollments/",
        ExperienceEnrollmentListCreateView.as_view(),
        name="experience-enrollment-list",
    ),
    path(
        "enrollments/<int:pk>/",
        ExperienceEnrollmentDetailView.as_view(),
        name="experience-enrollment-detail",
    ),
    path(
        "enrollments/<int:enrollment_id>/submissions/",
        ExperienceSubmissionListCreateView.as_view(),
        name="experience-submission-list",
    ),
]
