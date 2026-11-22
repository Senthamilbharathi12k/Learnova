
from django.db import models
from skills_interests.models import Skill, Interest
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Q


class Course(models.Model):

    DIFFICULTY_CHOICES = [
        ("BEGINNER", "Beginner"),
        ("INTERMEDIATE", "Intermediate"),
        ("ADVANCED", "Advanced"),
    ]

    name = models.CharField(max_length=150, unique=True)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    provider = models.CharField(max_length=150,blank=True)
    external_url = models.URLField(max_length=500,blank=True)

    LEARNING_MODE_CHOICES = [
        ("ONLINE", "Online"),
        ("OFFLINE", "Offline"),
    ]

    PRICING_TYPE_CHOICES = [
        ("FREE", "Free"),
        ("PAID", "Paid"),
    ]

    learning_mode = models.CharField(
        max_length=10,
        choices=LEARNING_MODE_CHOICES,
        default="ONLINE"
    )

    pricing_type = models.CharField(
        max_length=10,
        choices=PRICING_TYPE_CHOICES,
        default="FREE"
    )

    difficulty_level = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default="BEGINNER"
    )

    duration_weeks = models.PositiveSmallIntegerField(default=4)

    skills = models.ManyToManyField(
        Skill,
        through="CourseSkill",
        related_name="courses",
        blank=True
    )

    interests = models.ManyToManyField(
        Interest,
        through="CourseInterest",
        related_name="courses",
        blank=True
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Course"
        verbose_name_plural = "Courses"

    def __str__(self):
        return self.name


class CourseSkill(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="course_skills"
    )

    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="course_skills"
    )

    class Meta:
        ordering = ["skill__name"]
        constraints = [
            models.UniqueConstraint(
                fields=["course", "skill"],
                name="unique_course_skill"
            )
        ]

    def __str__(self):
        return f"{self.course.name} - {self.skill.name}"


class CourseInterest(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="course_interests"
    )

    interest = models.ForeignKey(
        Interest,
        on_delete=models.CASCADE,
        related_name="course_interests"
    )

    class Meta:
        ordering = ["interest__name"]
        constraints = [
            models.UniqueConstraint(
                fields=["course", "interest"],
                name="unique_course_interest"
            )
        ]

    def __str__(self):
        return f"{self.course.name} - {self.interest.name}"


class CourseResource(models.Model):

    PRICING_TYPE_CHOICES = [
        ("FREE", "Free"),
        ("PAID", "Paid"),
    ]

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="resources"
    )

    title = models.CharField(max_length=200)

    provider = models.CharField(max_length=150)

    pricing_type = models.CharField(
        max_length=10,
        choices=PRICING_TYPE_CHOICES
    )

    external_url = models.URLField(max_length=500)

    # Actual price is optional. Never invent a price.
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    currency = models.CharField(
        max_length=3,
        default="INR"
    )

    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["pricing_type", "title"]
        verbose_name = "Course Resource"
        verbose_name_plural = "Course Resources"

    def __str__(self):
        return f"{self.course.name} - {self.title} ({self.pricing_type})"


class CourseEnrollment(models.Model):

    STATUS_CHOICES = [
        ("ENROLLED", "Enrolled"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="course_enrollments"
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ENROLLED"
    )

    progress = models.PositiveSmallIntegerField(
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100)
        ]
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        ordering = ["-enrolled_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["student", "course"],
                name="unique_student_course_enrollment"
            ),
            models.CheckConstraint(
                condition=Q(progress__gte=0) & Q(progress__lte=100),
                name="valid_enrollment_progress"
            ),
        ]

        verbose_name = "Course Enrollment"
        verbose_name_plural = "Course Enrollments"

    def __str__(self):
        return f"{self.student.username} - {self.course.name}"
