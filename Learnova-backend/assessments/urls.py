from django.urls import path
from .views import AssessmentAttemptDeleteView

from .views import (
    AssessmentCategoryListView,
    AssessmentQuestionListView,
    AssessmentSubmitView,
    AssessmentHistoryView,
    CourseFinalAssessmentQuestionView,
    CourseFinalAssessmentSubmitView,
    CourseFinalAssessmentHistoryView,
)

urlpatterns = [
    path(
        "categories/",
        AssessmentCategoryListView.as_view(),
        name="assessment-categories"
    ),
    path(
        "categories/<slug:category_slug>/questions/",
        AssessmentQuestionListView.as_view(),
        name="assessment-questions"
    ),
    path(
        "submit/",
        AssessmentSubmitView.as_view(),
        name="assessment-submit"
    ),
    path(
        "history/",
        AssessmentHistoryView.as_view(),
        name="assessment-history"
    ),
    path(
    "history/<int:attempt_id>/",
    AssessmentAttemptDeleteView.as_view(),
    name="assessment-history-delete"
    ),
        # Course Final Assessment
    path(
        "courses/<int:course_id>/questions/",
        CourseFinalAssessmentQuestionView.as_view(),
        name="course-final-assessment-questions"
    ),
    path(
        "courses/<int:course_id>/submit/",
        CourseFinalAssessmentSubmitView.as_view(),
        name="course-final-assessment-submit"
    ),
    path(
        "courses/<int:course_id>/history/",
        CourseFinalAssessmentHistoryView.as_view(),
        name="course-final-assessment-history"
    ),
]