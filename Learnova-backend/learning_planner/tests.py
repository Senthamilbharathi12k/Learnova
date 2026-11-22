
from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import StudentProfile
from .models import LearningPlannerTask


User = get_user_model()


class LearningPlannerAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="planner_student",
            email="planner@test.com",
            password="TestPass123!"
        )
        self.student = StudentProfile.objects.create(
            user=self.user,
            full_name="Planner Student"
        )
        self.client.force_authenticate(user=self.user)

        self.task_data = {
            "title": "Learn Python",
            "course": "Python Programming",
            "date": (date.today() + timedelta(days=1)).isoformat(),
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "category": "Study",
            "notes": "Complete Python basics"
        }

    def test_get_planner_tasks(self):
        response = self.client.get("/api/learning-planner/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_planner_task(self):
        response = self.client.post(
            "/api/learning-planner/",
            self.task_data,
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            LearningPlannerTask.objects.filter(
                student=self.student,
                title="Learn Python"
            ).exists()
        )

    def test_invalid_time_range(self):
        invalid_data = {
            **self.task_data,
            "start_time": "12:00:00",
            "end_time": "11:00:00"
        }

        response = self.client.post(
            "/api/learning-planner/",
            invalid_data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_update_planner_task(self):
        task = LearningPlannerTask.objects.create(
            student=self.student,
            title="Old title",
            date=date.today() + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        response = self.client.patch(
            f"/api/learning-planner/{task.id}/",
            {"title": "Updated title"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        task.refresh_from_db()
        self.assertEqual(task.title, "Updated title")

    def test_change_task_status(self):
        task = LearningPlannerTask.objects.create(
            student=self.student,
            title="Practice Python",
            date=date.today() + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        response = self.client.patch(
            f"/api/learning-planner/{task.id}/status/",
            {"status": "COMPLETED"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        task.refresh_from_db()
        self.assertEqual(task.status, "COMPLETED")

    def test_invalid_task_status(self):
        task = LearningPlannerTask.objects.create(
            student=self.student,
            title="Revision",
            date=date.today() + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        response = self.client.patch(
            f"/api/learning-planner/{task.id}/status/",
            {"status": "INVALID"},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_delete_planner_task(self):
        task = LearningPlannerTask.objects.create(
            student=self.student,
            title="Delete task",
            date=date.today() + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        response = self.client.delete(
            f"/api/learning-planner/{task.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            LearningPlannerTask.objects.filter(id=task.id).exists()
        )

    def test_student_cannot_access_another_students_task(self):
        another_user = User.objects.create_user(
            username="another_planner",
            email="another_planner@test.com",
            password="TestPass123!"
        )
        another_student = StudentProfile.objects.create(
            user=another_user,
            full_name="Another Student"
        )

        task = LearningPlannerTask.objects.create(
            student=another_student,
            title="Private task",
            date=date.today() + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(11, 0)
        )

        response = self.client.get(
            f"/api/learning-planner/{task.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
