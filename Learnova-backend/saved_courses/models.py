
from django.db import models
from accounts.models import StudentProfile
from courses.models import Course


class SavedCourse(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="saved_courses"
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="saved_by_students"
    )

    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-saved_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "course"],
                name="unique_student_saved_course"
            )
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.course.name}"
