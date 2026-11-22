
from rest_framework import serializers

from .models import SavedCourse
from courses.models import CourseResource


class SavedCourseResourceSerializer(serializers.ModelSerializer):

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


class SavedCourseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="course.id", read_only=True)
    name = serializers.CharField(source="course.name", read_only=True)
    category = serializers.CharField(source="course.category", read_only=True)
    description = serializers.CharField(source="course.description", read_only=True)
    difficulty_level = serializers.CharField(
        source="course.difficulty_level",
        read_only=True
    )
    duration_weeks = serializers.IntegerField(
        source="course.duration_weeks",
        read_only=True
    )
    learning_mode = serializers.CharField(
        source="course.learning_mode",
        read_only=True
    )

    resources = serializers.SerializerMethodField()
    saved_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = SavedCourse
        fields = [
            "id",
            "name",
            "category",
            "description",
            "difficulty_level",
            "duration_weeks",
            "learning_mode",
            "resources",
            "saved_at",
        ]

    def get_resources(self, obj):
        resources = obj.course.resources.filter(
            is_active=True
        ).order_by("pricing_type", "title")

        return SavedCourseResourceSerializer(
            resources,
            many=True
        ).data
