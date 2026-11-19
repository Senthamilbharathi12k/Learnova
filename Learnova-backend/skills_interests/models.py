
from django.db import models
from accounts.models import StudentProfile


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Skill"
        verbose_name_plural = "Skills"

    def __str__(self):
        return self.name


class StudentSkill(models.Model):

    PROFICIENCY_CHOICES = [
        ("BEGINNER", "Beginner"),
        ("INTERMEDIATE", "Intermediate"),
        ("ADVANCED", "Advanced"),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="student_skills"
    )

    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="student_skills"
    )

    proficiency = models.CharField(
        max_length=20,
        choices=PROFICIENCY_CHOICES,
        default="BEGINNER"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["skill__name"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "skill"],
                name="unique_student_skill"
            )
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.skill.name}"


class Interest(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Interest"
        verbose_name_plural = "Interests"

    def __str__(self):
        return self.name


class StudentInterest(models.Model):

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="student_interests"
    )

    interest = models.ForeignKey(
        Interest,
        on_delete=models.CASCADE,
        related_name="student_interests"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["interest__name"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "interest"],
                name="unique_student_interest"
            )
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.interest.name}"
