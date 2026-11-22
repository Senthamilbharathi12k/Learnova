from django.urls import path

from .views import (
    CourseRecommendationView,
    CourseDiscoveryView,
    CourseEnrollmentListCreateView,
    CourseEnrollmentProgressView,
)

urlpatterns = [
    path(
        "recommendations/",
        CourseRecommendationView.as_view(),
        name="course-recommendations",
    ),
    path(
        "discovery/",
        CourseDiscoveryView.as_view(),
        name="course-discovery",
    ),
    path(
        "enrollments/",
        CourseEnrollmentListCreateView.as_view(),
        name="course-enrollments",
    ),
    path(
        "enrollments/<int:pk>/progress/",
        CourseEnrollmentProgressView.as_view(),
        name="course-enrollment-progress",
    ),
]
