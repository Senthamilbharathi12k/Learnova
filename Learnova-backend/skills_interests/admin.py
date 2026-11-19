
from django.contrib import admin
from .models import Skill, StudentSkill, Interest, StudentInterest


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_active", "created_at")
    search_fields = ("name",)
    list_filter = ("is_active",)


@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "skill", "proficiency")
    search_fields = ("student__full_name", "skill__name")
    list_filter = ("proficiency",)


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_active", "created_at")
    search_fields = ("name",)
    list_filter = ("is_active",)


@admin.register(StudentInterest)
class StudentInterestAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "interest")
    search_fields = ("student__full_name", "interest__name")
