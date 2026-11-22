
from django.urls import path

from .views import (
    SavedCourseListCreateView,
    SavedCourseDeleteView,
    SavedCourseStatusView,
)

urlpatterns = [
    path(
        "",
        SavedCourseListCreateView.as_view(),
        name="saved-course-list-create"
    ),
    path(
        "<int:course_id>/",
        SavedCourseDeleteView.as_view(),
        name="saved-course-delete"
    ),
    path(
        "<int:course_id>/status/",
        SavedCourseStatusView.as_view(),
        name="saved-course-status"
    ),
]
