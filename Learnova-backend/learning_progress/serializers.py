
from decimal import Decimal
from rest_framework import serializers
from .models import CourseProgress, LearningSession


class CourseProgressSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="course.id", read_only=True)
    title = serializers.CharField(source="course.name", read_only=True)
    category = serializers.CharField(source="course.category", read_only=True)

    class Meta:
        model = CourseProgress
        fields = [
            "id",
            "title",
            "category",
            "total_lessons",
            "completed_lessons",
            "learning_hours",
            "completion_status",
            "completed_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "title",
            "category",
            "total_lessons",
            "learning_hours",
            "completion_status",
            "completed_at",
            "updated_at",
        ]

    def validate(self, attrs):
        total = attrs.get(
            "total_lessons",
            self.instance.total_lessons if self.instance else 20
        )
        completed = attrs.get(
            "completed_lessons",
            self.instance.completed_lessons if self.instance else 0
        )

        if total < 1:
            raise serializers.ValidationError({
                "total_lessons": "Total lessons must be at least 1."
            })

        if completed > total:
            raise serializers.ValidationError({
                "completed_lessons": "Completed lessons cannot exceed total lessons."
            })

        return attrs


class LearningSessionSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(read_only=True)
    course_name = serializers.CharField(source="course.name", read_only=True)

    class Meta:
        model = LearningSession
        fields = ["id", "course_id", "course_name", "hours", "date"]
        read_only_fields = [
            "id", "course_id", "course_name", "date"
        ]


class AddLearningSessionSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    hours = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=Decimal("0.01"),
        max_value=Decimal("24.00")
    )
