
from django.db import models


class ResumeResource(models.Model):

    CATEGORY_CHOICES = [
        ("RESUME_BUILDER", "Resume Builder"),
        ("ATS_CHECKER", "ATS Resume Checker"),
        ("RESUME_GUIDANCE", "Resume Guidance"),
    ]

    PRICING_CHOICES = [
        ("FREE", "Free"),
        ("PAID", "Paid"),
    ]

    title = models.CharField(max_length=150, unique=True)

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES
    )

    description = models.TextField()

    url = models.URLField(max_length=500)

    pricing_type = models.CharField(
        max_length=10,
        choices=PRICING_CHOICES,
        default="FREE"
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "title"]
        verbose_name = "Resume Resource"
        verbose_name_plural = "Resume Resources"

    def __str__(self):
        return self.title
