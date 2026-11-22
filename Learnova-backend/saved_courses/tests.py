
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import StudentProfile
from courses.models import Course
from .models import SavedCourse


User = get_user_model()


class SavedCoursesAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="saved_student",
            email="saved@test.com",
            password="TestPass123!"
        )
        self.student = StudentProfile.objects.create(
            user=self.user,
            full_name="Saved Student"
        )
        self.client.force_authenticate(user=self.user)

        self.course = Course.objects.create(
            name="Python Programming",
            category="Programming",
            description="Python course",
            provider="Learnova",
            external_url="https://example.com/python",
            learning_mode="ONLINE",
            pricing_type="FREE",
            difficulty_level="BEGINNER",
            duration_weeks=4,
            is_active=True
        )

    def test_get_saved_courses(self):
        response = self.client.get("/api/saved-courses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_save_course(self):
        response = self.client.post(
            "/api/saved-courses/",
            {"course_id": self.course.id},
            format="json"
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_200_OK, status.HTTP_201_CREATED]
        )
        self.assertTrue(
            SavedCourse.objects.filter(
                student=self.student,
                course=self.course
            ).exists()
        )

    def test_duplicate_save_does_not_create_duplicate(self):
        SavedCourse.objects.create(
            student=self.student,
            course=self.course
        )

        response = self.client.post(
            "/api/saved-courses/",
            {"course_id": self.course.id},
            format="json"
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_200_OK, status.HTTP_201_CREATED]
        )
        self.assertEqual(
            SavedCourse.objects.filter(
                student=self.student,
                course=self.course
            ).count(),
            1
        )

    def test_saved_course_status(self):
        SavedCourse.objects.create(
            student=self.student,
            course=self.course
        )

        response = self.client.get(
            f"/api/saved-courses/{self.course.id}/status/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_remove_saved_course(self):
        SavedCourse.objects.create(
            student=self.student,
            course=self.course
        )

        response = self.client.delete(
            f"/api/saved-courses/{self.course.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            SavedCourse.objects.filter(
                student=self.student,
                course=self.course
            ).exists()
        )

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/saved-courses/")

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )
