from django.urls import path
from .views import PortfolioResourceListView

urlpatterns = [
    path(
        "portfolio-resources/",
        PortfolioResourceListView.as_view(),
        name="portfolio-resource-list"
    ),
]
