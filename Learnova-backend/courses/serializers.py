
from rest_framework import serializers

from .models import Course, CourseResource


class CourseRecommendationSerializer(serializers.ModelSerializer):
    match_percentage = serializers.IntegerField(read_only=True)

    matched_skills = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )

    matched_interests = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "category",
            "description",
            "difficulty_level",
            "duration_weeks",
            "learning_mode",
            "match_percentage",
            "matched_skills",
            "matched_interests",
        ]


class CourseResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseResource
        fields = [
            "id",
            "title",
            "provider",
            "pricing_type",
            "external_url",
            "price",
            "currency",
            "description",
        ]

        read_only_fields = ["id"]

    def validate_price(self, value):
        pricing_type = self.initial_data.get(
            "pricing_type",
            getattr(self.instance, "pricing_type", None)
        )

        if pricing_type == "FREE" and value is not None:
            raise serializers.ValidationError(
                "Free resources cannot have a price."
            )

        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Price cannot be negative."
            )

        return value


class CourseDiscoverySerializer(serializers.ModelSerializer):

    match_percentage = serializers.IntegerField(read_only=True)

    matched_skills = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )

    matched_interests = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )

    resources = CourseResourceSerializer(
        source="filtered_resources",
        many=True,
        read_only=True
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "category",
            "description",
            "difficulty_level",
            "duration_weeks",
            "learning_mode",
            "match_percentage",
            "matched_skills",
            "matched_interests",
            "resources",
        ]
