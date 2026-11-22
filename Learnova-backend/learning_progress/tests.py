from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import StudentProfile
from courses.models import Course
from saved_courses.models import SavedCourse

from .models import CourseProgress, LearningSession


User = get_user_model()


class LearningProgressAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="progress_student",
            email="progress@test.com",
            password="TestPass123!"
        )

        self.student = StudentProfile.objects.create(
            user=self.user,
            full_name="Progress Student"
        )

        self.client.force_authenticate(user=self.user)

        self.course = Course.objects.create(
            name="React Development",
            category="Web Development",
            description="React course",
            provider="Learnova",
            external_url="https://example.com/react",
            learning_mode="ONLINE",
            pricing_type="FREE",
            difficulty_level="BEGINNER",
            duration_weeks=4,
            is_active=True
        )

        SavedCourse.objects.create(
            student=self.student,
            course=self.course
        )

        self.progress = CourseProgress.objects.create(
            student=self.student,
            course=self.course,
            total_lessons=20,
            completed_lessons=0
        )

    def test_get_learning_progress(self):
        response = self.client.get("/api/learning-progress/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("courses", response.data)
        self.assertIn("sessions", response.data)

    def test_update_course_progress(self):
        response = self.client.patch(
            f"/api/learning-progress/courses/{self.course.id}/",
            {"completed_lessons": 8},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.progress.refresh_from_db()
        self.assertEqual(self.progress.completed_lessons, 8)

    def test_reject_completed_lessons_above_total(self):
        response = self.client.patch(
            f"/api/learning-progress/courses/{self.course.id}/",
            {"completed_lessons": 25},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_add_learning_session(self):
        response = self.client.post(
            "/api/learning-progress/sessions/",
            {
                "course_id": self.course.id,
                "hours": "1.50"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(
            LearningSession.objects.filter(
                student=self.student,
                course=self.course
            ).count(),
            1
        )

        self.progress.refresh_from_db()
        self.assertEqual(str(self.progress.learning_hours), "1.50")

    def test_reject_invalid_learning_hours(self):
        response = self.client.post(
            "/api/learning-progress/sessions/",
            {
                "course_id": self.course.id,
                "hours": "25.00"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_unsaved_course_cannot_receive_progress(self):
        another_course = Course.objects.create(
            name="SQL Course",
            category="Database",
            description="SQL course",
            provider="Learnova",
            external_url="https://example.com/sql",
            learning_mode="ONLINE",
            pricing_type="FREE",
            difficulty_level="BEGINNER",
            duration_weeks=3,
            is_active=True
        )

        response = self.client.patch(
            f"/api/learning-progress/courses/{another_course.id}/",
            {"completed_lessons": 2},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/learning-progress/")

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_course_completion_requires_confirmation(self):
        response = self.client.post(
            f"/api/learning-progress/courses/{self.course.id}/complete/",
            {"confirm": False},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.progress.refresh_from_db()
        self.assertEqual(
            self.progress.completion_status,
            "IN_PROGRESS"
        )

    def test_course_completion_success(self):
        response = self.client.post(
            f"/api/learning-progress/courses/{self.course.id}/complete/",
            {"confirm": True},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        self.assertEqual(
            response.data["completion_status"],
            "COMPLETED"
        )
        self.assertIsNotNone(response.data["completed_at"])

        self.progress.refresh_from_db()
        self.assertEqual(
            self.progress.completion_status,
            "COMPLETED"
        )
        self.assertIsNotNone(self.progress.completed_at)

    def test_repeated_completion_preserves_original_date(self):
        first_response = self.client.post(
            f"/api/learning-progress/courses/{self.course.id}/complete/",
            {"confirm": True},
            format="json"
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_200_OK
        )

        self.progress.refresh_from_db()
        original_completed_at = self.progress.completed_at

        second_response = self.client.post(
            f"/api/learning-progress/courses/{self.course.id}/complete/",
            {"confirm": True},
            format="json"
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_200_OK
        )

        self.progress.refresh_from_db()
        self.assertEqual(
            self.progress.completed_at,
            original_completed_at
        )

    def test_unsaved_course_cannot_be_marked_completed(self):
        another_course = Course.objects.create(
            name="UnSaved Course",
            category="Testing",
            description="Unsaved course",
            provider="Learnova",
            external_url="https://example.com/unsaved",
            learning_mode="ONLINE",
            pricing_type="FREE",
            difficulty_level="BEGINNER",
            duration_weeks=2,
            is_active=True
        )

        response = self.client.post(
            f"/api/learning-progress/courses/{another_course.id}/complete/",
            {"confirm": True},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_total_lessons_is_read_only(self):
        response = self.client.patch(
            f"/api/learning-progress/courses/{self.course.id}/",
            {"total_lessons": 99},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.progress.refresh_from_db()
        self.assertEqual(self.progress.total_lessons, 20)

    def test_student_cannot_access_another_students_progress(self):
        other_user = User.objects.create_user(
            username="other_progress_student",
            email="otherprogress@test.com",
            password="TestPass123!"
        )

        other_student = StudentProfile.objects.create(
            user=other_user,
            full_name="Other Student"
        )

        other_course = Course.objects.create(
            name="Python Development",
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

        SavedCourse.objects.create(
            student=other_student,
            course=other_course
        )

        CourseProgress.objects.create(
            student=other_student,
            course=other_course,
            total_lessons=20,
            completed_lessons=5
        )

        # Current student must not see another student's course.
        response = self.client.get("/api/learning-progress/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        returned_course_ids = [
            item["id"] for item in response.data["courses"]
        ]

        self.assertNotIn(other_course.id, returned_course_ids)

        # Current student must not update another student's progress.
        response = self.client.patch(
            f"/api/learning-progress/courses/{other_course.id}/",
            {"completed_lessons": 10},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_student_cannot_add_session_to_another_students_course(self):
        other_user = User.objects.create_user(
            username="session_other_student",
            email="sessionother@test.com",
            password="TestPass123!"
        )

        other_student = StudentProfile.objects.create(
            user=other_user,
            full_name="Session Other Student"
        )

        other_course = Course.objects.create(
            name="Java Development",
            category="Programming",
            description="Java course",
            provider="Learnova",
            external_url="https://example.com/java",
            learning_mode="ONLINE",
            pricing_type="FREE",
            difficulty_level="BEGINNER",
            duration_weeks=4,
            is_active=True
        )

        SavedCourse.objects.create(
            student=other_student,
            course=other_course
        )

        response = self.client.post(
            "/api/learning-progress/sessions/",
            {
                "course_id": other_course.id,
                "hours": "1.50"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )
