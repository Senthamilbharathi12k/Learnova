
from django.contrib import admin
from .models import LearningPlannerTask


@admin.register(LearningPlannerTask)
class LearningPlannerTaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student",
        "title",
        "course",
        "date",
        "category",
        "status",
    )

    list_filter = (
        "status",
        "category",
        "date",
    )

    search_fields = (
        "student__full_name",
        "title",
        "course",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )
