
from rest_framework import serializers
from .models import ResumeResource


class ResumeResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = ResumeResource
        fields = [
            "id",
            "title",
            "category",
            "description",
            "url",
            "pricing_type",
        ]
