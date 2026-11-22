
from django.contrib import admin
from .models import CourseProgress, LearningSession


@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = (
        "id", "student", "course",
        "completed_lessons", "total_lessons",
        "learning_hours", "updated_at"
    )
    search_fields = (
        "student__full_name",
        "course__name",
        "student__user__email"
    )
    list_filter = ("updated_at",)


@admin.register(LearningSession)
class LearningSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "course", "hours", "date")
    search_fields = (
        "student__full_name",
        "course__name",
        "student__user__email"
    )
    list_filter = ("date",)
