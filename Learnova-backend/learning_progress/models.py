
from decimal import Decimal

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from accounts.models import StudentProfile
from courses.models import Course


class CourseProgress(models.Model):

    COMPLETION_STATUS_CHOICES = [
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="learning_progress"
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="student_progress"
    )

    total_lessons = models.PositiveIntegerField(default=20)

    completed_lessons = models.PositiveIntegerField(default=0)

    learning_hours = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(Decimal("0.00"))
        ]
    )

    completion_status = models.CharField(
        max_length=20,
        choices=COMPLETION_STATUS_CHOICES,
        default="IN_PROGRESS"
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "course"],
                name="unique_student_course_progress"
            ),
            models.CheckConstraint(
                condition=models.Q(
                    completed_lessons__lte=models.F("total_lessons")
                ),
                name="completed_lessons_lte_total"
            ),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.course.name}"


class LearningSession(models.Model):

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="learning_sessions"
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="learning_sessions"
    )

    hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
            MaxValueValidator(Decimal("24.00"))
        ]
    )

    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.course.name} ({self.hours} hrs)"
        )
