from django.urls import path
from .views import (
    LearningProgressView,
    CourseProgressUpdateView,
    AddLearningSessionView,
    CourseCompletionView,
)

urlpatterns = [
    path("", LearningProgressView.as_view(), name="learning-progress"),

    path(
        "courses/<int:course_id>/",
        CourseProgressUpdateView.as_view(),
        name="course-progress-update"
    ),

    path(
        "courses/<int:course_id>/complete/",
        CourseCompletionView.as_view(),
        name="course-progress-complete"
    ),

    path(
        "sessions/",
        AddLearningSessionView.as_view(),
        name="add-learning-session"
    ),
]