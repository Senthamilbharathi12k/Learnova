from django.db import models
from accounts.models import StudentProfile
from courses.models import Course

class AssessmentCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    skill = models.ForeignKey(
    "skills_interests.Skill",
    on_delete=models.PROTECT,
    related_name="assessment_categories",
    null=True,
    blank=True
)
    description = models.TextField(blank=True)
    level = models.CharField(max_length=100, blank=True)
    duration = models.CharField(max_length=50, default="10-15 minutes")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Assessment Categories"

    def __str__(self):
        return self.name




class AssessmentQuestion(models.Model):
    category = models.ForeignKey(
        AssessmentCategory,
        on_delete=models.CASCADE,
        related_name="questions"
    )
    question = models.TextField()
    options = models.JSONField()
    correct_answer = models.PositiveSmallIntegerField()
    explanation = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["category", "order"],
                name="unique_assessment_question_order"
            )
        ]

    def __str__(self):
        return f"{self.category.name} - Question {self.order}"


class AssessmentAttempt(models.Model):

    LEVEL_CHOICES = [
        ("BEGINNER", "Beginner"),
        ("INTERMEDIATE", "Intermediate"),
        ("ADVANCED", "Advanced"),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="assessment_attempts"
    )
    category = models.ForeignKey(
        AssessmentCategory,
        on_delete=models.PROTECT,
        related_name="attempts"
    )
    score = models.PositiveSmallIntegerField()
    correct_answers = models.PositiveSmallIntegerField()
    total_questions = models.PositiveSmallIntegerField()
    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES
    )
    answers = models.JSONField(default=dict)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.category.name} - {self.score}%"
        )
# ==========================================
# COURSE FINAL ASSESSMENT
# ==========================================

class CourseAssessment(models.Model):
    course = models.OneToOneField(
        Course,
        on_delete=models.CASCADE,
        related_name="final_assessment"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    pass_percentage = models.PositiveSmallIntegerField(default=70)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["course__name"]

    def __str__(self):
        return f"{self.course.name} - Final Assessment"


class CourseAssessmentQuestion(models.Model):
    assessment = models.ForeignKey(
        CourseAssessment,
        on_delete=models.CASCADE,
        related_name="questions"
    )
    question = models.TextField()
    options = models.JSONField()
    correct_answer = models.PositiveSmallIntegerField()
    explanation = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["assessment", "order"],
                name="unique_course_assessment_question_order"
            )
        ]

    def __str__(self):
        return (
            f"{self.assessment.course.name} "
            f"- Question {self.order}"
        )


class CourseAssessmentAttempt(models.Model):

    RESULT_CHOICES = [
        ("PASS", "Pass"),
        ("FAIL", "Fail"),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="course_assessment_attempts"
    )
    assessment = models.ForeignKey(
        CourseAssessment,
        on_delete=models.PROTECT,
        related_name="attempts"
    )
    score = models.PositiveSmallIntegerField()
    correct_answers = models.PositiveSmallIntegerField()
    total_questions = models.PositiveSmallIntegerField()
    result = models.CharField(
        max_length=10,
        choices=RESULT_CHOICES
    )
    answers = models.JSONField(default=dict)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.assessment.course.name} - "
            f"{self.score}% ({self.result})"
        )
