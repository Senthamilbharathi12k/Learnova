from rest_framework import serializers
from .models import PortfolioResource


class PortfolioResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = PortfolioResource
        fields = [
            "id",
            "title",
            "category",
            "access",
            "description",
            "features",
            "url",
        ]
