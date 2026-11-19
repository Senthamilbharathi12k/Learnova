
from django.db import models


class PortfolioResource(models.Model):

    CATEGORY_CHOICES = [
        ("DEVELOPER_PORTFOLIO", "Developer Portfolio"),
        ("DESIGN_PORTFOLIO", "Design Portfolio"),
        ("WEBSITE_BUILDER", "Website Builder"),
        ("PORTFOLIO_TEMPLATES", "Portfolio Templates"),
        ("LEARNING_INSPIRATION", "Learning & Inspiration"),
    ]

    title = models.CharField(max_length=150, unique=True)

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES
    )

    access = models.CharField(max_length=50)

    description = models.TextField()

    features = models.JSONField(default=list)

    url = models.URLField(max_length=500)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "title"]
        verbose_name = "Portfolio Resource"
        verbose_name_plural = "Portfolio Resources"

    def __str__(self):
        return self.title
