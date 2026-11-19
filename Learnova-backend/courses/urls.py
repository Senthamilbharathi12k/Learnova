
from django.urls import path

from .views import (
    CourseRecommendationView,
    CourseDiscoveryView,
)

urlpatterns = [
    path("recommendations/", CourseRecommendationView.as_view(), name="course-recommendations"),
    path("discovery/", CourseDiscoveryView.as_view(), name="course-discovery"),

]
