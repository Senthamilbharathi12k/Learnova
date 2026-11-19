
from django.contrib import admin
from .models import Course, CourseSkill, CourseInterest


class CourseSkillInline(admin.TabularInline):
    model = CourseSkill
    extra = 1


class CourseInterestInline(admin.TabularInline):
    model = CourseInterest
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "difficulty_level",
        "duration_weeks",
        "is_active",
    )

    list_filter = (
        "category",
        "difficulty_level",
        "is_active",
    )

    search_fields = ("name", "description")

    inlines = [CourseSkillInline, CourseInterestInline]


@admin.register(CourseSkill)
class CourseSkillAdmin(admin.ModelAdmin):
    list_display = ("course", "skill")
    search_fields = ("course__name", "skill__name")


@admin.register(CourseInterest)
class CourseInterestAdmin(admin.ModelAdmin):
    list_display = ("course", "interest")
    search_fields = ("course__name", "interest__name")
