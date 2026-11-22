from rest_framework import serializers

from .models import (
    AssessmentCategory,
    AssessmentQuestion,
    AssessmentAttempt,
    CourseAssessment,
    CourseAssessmentQuestion,
    CourseAssessmentAttempt,
)


class AssessmentCategorySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="slug", read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = AssessmentCategory
        fields = [
            "id",
            "name",
            "description",
            "level",
            "duration",
            "question_count",
        ]

    def get_question_count(self, obj):
        return obj.questions.filter(is_active=True).count()


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = [
            "id",
            "question",
            "options",
            "order",
        ]


class AssessmentAttemptSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    category_id = serializers.CharField(
        source="category.slug",
        read_only=True
    )
    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = AssessmentAttempt
        fields = [
            "id",
            "category_id",
            "category_name",
            "score",
            "correct_answers",
            "total_questions",
            "level",
            "answers",
            "completed_at",
        ]


class AssessmentSubmitSerializer(serializers.Serializer):
    category_id = serializers.SlugField()
    answers = serializers.DictField(
        child=serializers.IntegerField(min_value=0)
    )

    def validate(self, attrs):
        try:
            category = AssessmentCategory.objects.get(
                slug=attrs["category_id"],
                is_active=True
            )
        except AssessmentCategory.DoesNotExist:
            raise serializers.ValidationError({
                "category_id": "Invalid assessment category."
            })

        questions = list(
            category.questions.filter(is_active=True)
        )

        if not questions:
            raise serializers.ValidationError({
                "category_id": "No questions available."
            })

        submitted_answers = attrs["answers"]
        expected_ids = {str(q.id) for q in questions}

        if set(submitted_answers.keys()) != expected_ids:
            raise serializers.ValidationError({
                "answers": (
                    "Submit exactly one answer for every question."
                )
            })

        for question in questions:
            selected = submitted_answers[str(question.id)]

            if selected >= len(question.options):
                raise serializers.ValidationError({
                    "answers": (
                        f"Invalid option for question {question.id}."
                    )
                })

        attrs["category"] = category
        attrs["questions"] = questions
        return attrs


# ==========================================
# COURSE FINAL ASSESSMENT SERIALIZERS
# ==========================================

class CourseAssessmentQuestionSerializer(serializers.ModelSerializer):
    """
    Sends questions and options to the frontend.
    Correct answers and explanations are never exposed.
    """

    class Meta:
        model = CourseAssessmentQuestion
        fields = [
            "id",
            "question",
            "options",
            "order",
        ]
        read_only_fields = fields


class CourseAssessmentSubmitSerializer(serializers.Serializer):
    """
    Accepts student answers for Course Final Assessment.
    Example:
    {
        "answers": {
            "101": 0,
            "102": 2
        }
    }
    """

    answers = serializers.DictField(
        child=serializers.IntegerField(min_value=0),
        allow_empty=False,
    )

    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError(
                "At least one answer is required."
            )

        return value


class CourseAssessmentAttemptSerializer(serializers.ModelSerializer):
    """
    Returns a student's saved Course Final Assessment result.
    """

    assessment_title = serializers.CharField(
        source="assessment.title",
        read_only=True,
    )

    class Meta:
        model = CourseAssessmentAttempt
        fields = [
            "id",
            "assessment_title",
            "score",
            "correct_answers",
            "total_questions",
            "result",
            "answers",
            "completed_at",
        ]
        read_only_fields = fields
