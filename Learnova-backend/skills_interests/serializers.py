
from rest_framework import serializers

from .models import (
    Skill,
    StudentSkill,
    Interest,
    StudentInterest,
)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "description"]


class StudentSkillSerializer(serializers.ModelSerializer):
    skill = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.filter(is_active=True)
    )
    skill_details = SkillSerializer(source="skill", read_only=True)

    class Meta:
        model = StudentSkill
        fields = [
            "id",
            "skill",
            "skill_details",
            "proficiency",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        student = self.context.get("student")
        skill = attrs.get("skill")

        if student and skill:
            existing = StudentSkill.objects.filter(
                student=student,
                skill=skill
            )

            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)

            if existing.exists():
                raise serializers.ValidationError({
                    "skill": "You have already added this skill."
                })

        return attrs


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ["id", "name", "description"]


class StudentInterestSerializer(serializers.ModelSerializer):
    interest = serializers.PrimaryKeyRelatedField(
        queryset=Interest.objects.filter(is_active=True)
    )
    interest_details = InterestSerializer(
        source="interest",
        read_only=True
    )

    class Meta:
        model = StudentInterest
        fields = [
            "id",
            "interest",
            "interest_details",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        student = self.context.get("student")
        interest = attrs.get("interest")

        if student and interest:
            existing = StudentInterest.objects.filter(
                student=student,
                interest=interest
            )

            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)

            if existing.exists():
                raise serializers.ValidationError({
                    "interest": "You have already added this interest."
                })

        return attrs
