
from django.urls import path
from .views import ResumeResourceListView

urlpatterns = [
    path(
        "resume-resources/",
        ResumeResourceListView.as_view(),
        name="resume-resource-list"
    ),
]
