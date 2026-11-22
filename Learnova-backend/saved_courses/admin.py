
from django.contrib import admin
from .models import SavedCourse


@admin.register(SavedCourse)
class SavedCourseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student",
        "course",
        "saved_at",
    )
    search_fields = (
        "student__full_name",
        "course__name",
    )
    list_filter = ("saved_at",)
    readonly_fields = ("saved_at",)
