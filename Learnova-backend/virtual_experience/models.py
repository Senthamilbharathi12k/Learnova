
from django.conf import settings
from django.db import models


class ExperienceProgram(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    role = models.CharField(max_length=100)
    description = models.TextField()
    duration_days = models.PositiveIntegerField(default=14)
    level = models.CharField(
        max_length=20,
        choices=[
            ("Beginner", "Beginner"),
            ("Intermediate", "Intermediate"),
            ("Advanced", "Advanced"),
        ],
        default="Beginner",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title

    @property
    def total_tasks(self):
        return self.tasks.filter(is_required=True).count()


class ExperienceTask(models.Model):
    program = models.ForeignKey(
        ExperienceProgram,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructions = models.TextField(blank=True)
    day_number = models.PositiveIntegerField(default=1)
    is_required = models.BooleanField(default=True)

    class Meta:
        ordering = ["day_number", "id"]

    def __str__(self):
        return f"{self.program.title} - {self.title}"


class ExperienceEnrollment(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="experience_enrollments",
    )
    program = models.ForeignKey(
        ExperienceProgram,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE",
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "program"],
                name="unique_student_experience_program",
            )
        ]
        ordering = ["-enrolled_at"]

    def __str__(self):
        return f"{self.student} - {self.program}"

    @property
    def total_tasks(self):
        return self.program.tasks.filter(is_required=True).count()

    @property
    def completed_tasks(self):
        return self.submissions.filter(
            task__is_required=True
        ).values("task").distinct().count()

    @property
    def progress_percentage(self):
        total = self.total_tasks
        if total == 0:
            return 0
        return round((self.completed_tasks / total) * 100)

    def update_status(self):
        if (
            self.total_tasks > 0
            and self.completed_tasks >= self.total_tasks
        ):
            self.status = "COMPLETED"
        else:
            self.status = "ACTIVE"

        self.save(update_fields=["status"])


class ExperienceSubmission(models.Model):
    enrollment = models.ForeignKey(
        ExperienceEnrollment,
        on_delete=models.CASCADE,
        related_name="submissions",
    )
    task = models.ForeignKey(
        ExperienceTask,
        on_delete=models.CASCADE,
        related_name="submissions",
    )
    description = models.TextField()
    github_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    submitted_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["enrollment", "task"],
                name="unique_enrollment_task_submission",
            )
        ]
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.enrollment.student} - {self.task.title}"

    def save(self, *args, **kwargs):
        if self.task.program_id != self.enrollment.program_id:
            raise ValueError(
                "This task does not belong to the enrolled program."
            )

        super().save(*args, **kwargs)
        self.enrollment.update_status()

    def delete(self, *args, **kwargs):
        enrollment = self.enrollment
        super().delete(*args, **kwargs)
        enrollment.update_status()
