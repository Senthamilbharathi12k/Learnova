
from django.db import models
from accounts.models import StudentProfile


class LearningPlannerTask(models.Model):

    CATEGORY_CHOICES = [
        ("Study", "Study"),
        ("Practice", "Practice"),
        ("Revision", "Revision"),
        ("Assignment", "Assignment"),
        ("Project", "Project"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("COMPLETED", "Completed"),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="planner_tasks"
    )

    title = models.CharField(max_length=100)
    course = models.CharField(max_length=100, blank=True)

    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="Study"
    )

    notes = models.TextField(max_length=500, blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.student.full_name} - {self.title}"
