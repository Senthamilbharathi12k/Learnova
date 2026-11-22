
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse

from .models import (
    ExperienceProgram,
    ExperienceTask,
    ExperienceEnrollment,
    ExperienceSubmission,
)


User = get_user_model()


class VirtualExperienceAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        # Create two separate students
        self.student = User.objects.create_user(
            username="student1",
            email="student1@test.com",
            password="TestPassword123!"
        )

        self.other_student = User.objects.create_user(
            username="student2",
            email="student2@test.com",
            password="TestPassword123!"
        )

        # Create Python program
        self.program = ExperienceProgram.objects.create(
            title="Python Developer Virtual Experience",
            slug="python-developer-test",
            role="Python Developer",
            description="Python developer practice program",
            duration_days=14,
            level="Beginner",
            is_active=True,
        )

        # Create another program
        self.other_program = ExperienceProgram.objects.create(
            title="Full Stack Developer Virtual Experience",
            slug="full-stack-test",
            role="Full Stack Developer",
            description="Full stack developer practice program",
            duration_days=14,
            level="Intermediate",
            is_active=True,
        )

        # Create 5 required tasks for Python program
        self.tasks = []

        for i in range(1, 6):
            task = ExperienceTask.objects.create(
                program=self.program,
                title=f"Python Task {i}",
                description=f"Complete Python task {i}",
                instructions=f"Instructions for task {i}",
                day_number=i,
                is_required=True,
            )
            self.tasks.append(task)

        # Create one task for Full Stack program
        self.other_task = ExperienceTask.objects.create(
            program=self.other_program,
            title="Full Stack Task",
            description="Complete full stack task",
            instructions="Build a sample application",
            day_number=1,
            is_required=True,
        )

        self.client.force_authenticate(user=self.student)

    def enroll_student(self):
        return ExperienceEnrollment.objects.create(
            student=self.student,
            program=self.program,
        )

    def test_program_list_api(self):
        response = self.client.get(
            reverse("experience-program-list")
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_program_detail_api(self):
        response = self.client.get(
            reverse(
                "experience-program-detail",
                kwargs={"pk": self.program.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], self.program.title)
        self.assertEqual(len(response.data["tasks"]), 5)

    def test_student_can_enroll(self):
        response = self.client.post(
            reverse("experience-enrollment-list"),
            {"program": self.program.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            ExperienceEnrollment.objects.filter(
                student=self.student,
                program=self.program,
            ).exists()
        )

    def test_duplicate_enrollment_is_rejected(self):
        self.enroll_student()

        response = self.client.post(
            reverse("experience-enrollment-list"),
            {"program": self.program.id},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_student_sees_only_own_enrollments(self):
        self.enroll_student()

        ExperienceEnrollment.objects.create(
            student=self.other_student,
            program=self.other_program,
        )

        response = self.client.get(
            reverse("experience-enrollment-list")
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_task_submission_updates_progress(self):
        enrollment = self.enroll_student()

        response = self.client.post(
            reverse(
                "experience-submission-list",
                kwargs={"enrollment_id": enrollment.id},
            ),
            {
                "task": self.tasks[0].id,
                "description": "Completed Python task 1",
                "github_url": "https://github.com/example/task1",
                "demo_url": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        enrollment.refresh_from_db()

        self.assertEqual(enrollment.completed_tasks, 1)
        self.assertEqual(enrollment.progress_percentage, 20)
        self.assertEqual(enrollment.status, "ACTIVE")

    def test_all_required_tasks_complete_enrollment(self):
        enrollment = self.enroll_student()

        for task in self.tasks:
            self.client.post(
                reverse(
                    "experience-submission-list",
                    kwargs={"enrollment_id": enrollment.id},
                ),
                {
                    "task": task.id,
                    "description": f"Completed {task.title}",
                    "github_url": "",
                    "demo_url": "",
                },
                format="json",
            )

        enrollment.refresh_from_db()

        self.assertEqual(enrollment.completed_tasks, 5)
        self.assertEqual(enrollment.progress_percentage, 100)
        self.assertEqual(enrollment.status, "COMPLETED")

    def test_wrong_program_task_is_rejected(self):
        enrollment = self.enroll_student()

        response = self.client.post(
            reverse(
                "experience-submission-list",
                kwargs={"enrollment_id": enrollment.id},
            ),
            {
                "task": self.other_task.id,
                "description": "Wrong program task",
                "github_url": "",
                "demo_url": "",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_student_cannot_access_other_student_enrollment(self):
        other_enrollment = ExperienceEnrollment.objects.create(
            student=self.other_student,
            program=self.other_program,
        )

        response = self.client.get(
            reverse(
                "experience-enrollment-detail",
                kwargs={"pk": other_enrollment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_student_cannot_access_other_student_submissions(self):
        other_enrollment = ExperienceEnrollment.objects.create(
            student=self.other_student,
            program=self.other_program,
        )

        response = self.client.get(
            reverse(
                "experience-submission-list",
                kwargs={"enrollment_id": other_enrollment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_delete_enrollment_deletes_submissions(self):
        enrollment = self.enroll_student()

        ExperienceSubmission.objects.create(
            enrollment=enrollment,
            task=self.tasks[0],
            description="Submitted Python task",
        )

        enrollment_id = enrollment.id

        response = self.client.delete(
            reverse(
                "experience-enrollment-detail",
                kwargs={"pk": enrollment_id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertFalse(
            ExperienceEnrollment.objects.filter(
                id=enrollment_id
            ).exists()
        )

        self.assertFalse(
            ExperienceSubmission.objects.filter(
                enrollment_id=enrollment_id
            ).exists()
        )

    def test_unauthenticated_user_cannot_access_programs(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(
            reverse("experience-program-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
