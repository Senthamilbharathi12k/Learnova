
from rest_framework import serializers
from django.utils import timezone

from .models import (
    Course,
    CourseResource,
    CourseEnrollment,
)


class CourseRecommendationSerializer(serializers.ModelSerializer):

    match_percentage = serializers.IntegerField(read_only=True)
    skill_match_percentage = serializers.IntegerField(read_only=True)
    interest_match_percentage = serializers.IntegerField(read_only=True)

    matched_skills = serializers.ListField(
        child=serializers.CharField(),
        read_only=True,
    )

    matched_interests = serializers.ListField(
        child=serializers.CharField(),
        read_only=True,
    )

    assessment_performance = serializers.ListField(
        child=serializers.DictField(),
        read_only=True,
    )

    assessment_average_score = serializers.IntegerField(
        read_only=True,
        allow_null=True,
    )

    assessed_skills_count = serializers.IntegerField(
        read_only=True,
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
            "skill_match_percentage",
            "interest_match_percentage",
            "matched_skills",
            "matched_interests",
            "assessment_performance",
            "assessment_average_score",
            "assessed_skills_count",
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
            getattr(self.instance, "pricing_type", None),
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
    skill_match_percentage = serializers.IntegerField(read_only=True)
    interest_match_percentage = serializers.IntegerField(read_only=True)

    matched_skills = serializers.ListField(
        child=serializers.CharField(),
        read_only=True,
    )

    matched_interests = serializers.ListField(
        child=serializers.CharField(),
        read_only=True,
    )

    assessment_performance = serializers.ListField(
        child=serializers.DictField(),
        read_only=True,
    )

    assessment_average_score = serializers.IntegerField(
        read_only=True,
        allow_null=True,
    )

    assessed_skills_count = serializers.IntegerField(
        read_only=True,
    )

    resources = CourseResourceSerializer(
        source="filtered_resources",
        many=True,
        read_only=True,
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
            "skill_match_percentage",
            "interest_match_percentage",
            "matched_skills",
            "matched_interests",
            "assessment_performance",
            "assessment_average_score",
            "assessed_skills_count",
            "resources",
        ]


# ==========================================
# COURSE ENROLLMENT SERIALIZERS
# ==========================================

class EnrollmentCourseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "category",
            "provider",
            "external_url",
            "learning_mode",
            "pricing_type",
            "difficulty_level",
            "duration_weeks",
        ]


class CourseEnrollmentSerializer(serializers.ModelSerializer):

    course = EnrollmentCourseSerializer(read_only=True)

    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.filter(is_active=True),
        source="course",
        write_only=True,
    )

    class Meta:
        model = CourseEnrollment
        fields = [
            "id",
            "course",
            "course_id",
            "status",
            "progress",
            "enrolled_at",
            "completed_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "progress",
            "enrolled_at",
            "completed_at",
        ]

    def validate_course_id(self, course):

        request = self.context.get("request")

        if request is None or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        already_enrolled = CourseEnrollment.objects.filter(
            student=request.user,
            course=course,
        ).exists()

        if already_enrolled:
            raise serializers.ValidationError(
                "You are already enrolled in this course."
            )

        return course


class CourseEnrollmentProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseEnrollment
        fields = ["progress"]

    def update(self, instance, validated_data):

        progress = validated_data.get(
            "progress",
            instance.progress,
        )

        instance.progress = progress

        if progress == 100:

            instance.status = "COMPLETED"

            if instance.completed_at is None:
                instance.completed_at = timezone.now()

        else:

            instance.status = (
                "IN_PROGRESS" if progress > 0 else "ENROLLED"
            )

            instance.completed_at = None

        instance.save(
            update_fields=[
                "progress",
                "status",
                "completed_at",
            ]
        )

        return instance


# ==========================================
