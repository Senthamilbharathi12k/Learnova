
from rest_framework import serializers

from .models import (
    ExperienceProgram,
    ExperienceTask,
    ExperienceEnrollment,
    ExperienceSubmission,
)


class ExperienceTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceTask
        fields = [
            "id",
            "title",
            "description",
            "instructions",
            "day_number",
            "is_required",
        ]


class ExperienceProgramListSerializer(serializers.ModelSerializer):
    total_tasks = serializers.IntegerField(read_only=True)

    class Meta:
        model = ExperienceProgram
        fields = [
            "id",
            "title",
            "slug",
            "role",
            "description",
            "duration_days",
            "level",
            "total_tasks",
        ]


class ExperienceProgramDetailSerializer(serializers.ModelSerializer):
    tasks = ExperienceTaskSerializer(many=True, read_only=True)
    total_tasks = serializers.IntegerField(read_only=True)

    class Meta:
        model = ExperienceProgram
        fields = [
            "id",
            "title",
            "slug",
            "role",
            "description",
            "duration_days",
            "level",
            "total_tasks",
            "tasks",
        ]


class ExperienceSubmissionSerializer(serializers.ModelSerializer):
    task = serializers.PrimaryKeyRelatedField(
        queryset=ExperienceTask.objects.all()
    )

    class Meta:
        model = ExperienceSubmission
        fields = [
            "id",
            "task",
            "description",
            "github_url",
            "demo_url",
            "submitted_at",
        ]
        read_only_fields = ["id", "submitted_at"]

    def validate_task(self, task):
        enrollment = self.context["enrollment"]

        if task.program_id != enrollment.program_id:
            raise serializers.ValidationError(
                "This task does not belong to your enrolled program."
            )

        return task

    def create(self, validated_data):
        enrollment = self.context["enrollment"]
        task = validated_data.pop("task")

        submission, created = ExperienceSubmission.objects.update_or_create(
            enrollment=enrollment,
            task=task,
            defaults=validated_data,
        )

        return submission


class ExperienceEnrollmentCreateSerializer(serializers.ModelSerializer):
    program = serializers.PrimaryKeyRelatedField(
        queryset=ExperienceProgram.objects.filter(is_active=True)
    )

    class Meta:
        model = ExperienceEnrollment
        fields = ["id", "program", "status", "enrolled_at"]
        read_only_fields = ["id", "status", "enrolled_at"]

    def validate_program(self, program):
        student = self.context["request"].user

        if ExperienceEnrollment.objects.filter(
            student=student,
            program=program,
        ).exists():
            raise serializers.ValidationError(
                "You are already enrolled in this program."
            )

        return program

    def create(self, validated_data):
        return ExperienceEnrollment.objects.create(
            student=self.context["request"].user,
            **validated_data,
        )


class ExperienceEnrollmentSerializer(serializers.ModelSerializer):
    program = ExperienceProgramListSerializer(read_only=True)
    total_tasks = serializers.IntegerField(read_only=True)
    completed_tasks = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = ExperienceEnrollment
        fields = [
            "id",
            "program",
            "status",
            "enrolled_at",
            "total_tasks",
            "completed_tasks",
            "progress_percentage",
        ]
