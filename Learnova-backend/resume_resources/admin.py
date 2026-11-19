
from django.contrib import admin
from .models import ResumeResource


@admin.register(ResumeResource)
class ResumeResourceAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "category",
        "pricing_type",
        "is_active",
        "created_at",
    )

    list_filter = (
        "category",
        "pricing_type",
        "is_active",
    )

    search_fields = (
        "title",
        "description",
    )

    list_editable = (
        "pricing_type",
        "is_active",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("category", "title")
