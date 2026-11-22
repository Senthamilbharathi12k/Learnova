
from django.urls import path

from .views import (
    LearningPlannerListCreateView,
    LearningPlannerDetailView,
    LearningPlannerStatusView,
)

urlpatterns = [
    path(
        "",
        LearningPlannerListCreateView.as_view(),
        name="planner-list-create"
    ),
    path(
        "<int:task_id>/",
        LearningPlannerDetailView.as_view(),
        name="planner-detail"
    ),
    path(
        "<int:task_id>/status/",
        LearningPlannerStatusView.as_view(),
        name="planner-status"
    ),
]
