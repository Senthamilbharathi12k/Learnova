
from django.contrib import admin

from .models import (
    AssessmentCategory,
    AssessmentQuestion,
    AssessmentAttempt,
)


class AssessmentQuestionInline(admin.TabularInline):
    model = AssessmentQuestion
    extra = 1


@admin.register(AssessmentCategory)
class AssessmentCategoryAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "skill",
        "slug",
        "level",
        "is_active",
    ]
    list_filter = ["skill", "is_active", "level"]
    search_fields = ["name", "slug", "skill__name"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [AssessmentQuestionInline]


@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    list_display = [
        "category",
        "order",
        "question",
        "is_active",
    ]
    list_filter = ["category", "is_active"]
    search_fields = ["question"]


@admin.register(AssessmentAttempt)
class AssessmentAttemptAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "category",
        "score",
        "level",
        "completed_at",
    ]
    list_filter = ["category", "level"]
    search_fields = [
        "student__full_name",
        "category__name",
    ]
    readonly_fields = [
        "student",
        "category",
        "score",
        "correct_answers",
        "total_questions",
        "level",
        "answers",
        "completed_at",
    ]
