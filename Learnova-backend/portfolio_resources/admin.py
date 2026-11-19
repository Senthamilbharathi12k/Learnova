from django.contrib import admin
from .models import PortfolioResource


@admin.register(PortfolioResource)
class PortfolioResourceAdmin(admin.ModelAdmin):

    list_display = ("title", "category", "access", "is_active")
    list_filter = ("category", "access", "is_active")
    search_fields = ("title", "description")
