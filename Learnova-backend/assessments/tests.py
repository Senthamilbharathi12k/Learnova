from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import StudentProfile
from skills_interests.models import Skill, StudentSkill
from courses.models import Course
from saved_courses.models import SavedCourse
from learning_progress.models import CourseProgress

from .models import (
    AssessmentCategory,
    AssessmentQuestion,
    AssessmentAttempt,
    CourseAssessment,
    CourseAssessmentQuestion,
    CourseAssessmentAttempt,
)


User = get_user_model()


class AssessmentAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="assessment_student",
            email="assessment@test.com",
            password="TestPass123!"
        )

        self.student = StudentProfile.objects.create(
            user=self.user,
            full_name="Assessment Student"
        )

        self.client.force_authenticate(user=self.user)

        self.skill = Skill.objects.create(
            name="Python",
            description="Python programming",
            is_active=True
        )

        StudentSkill.objects.create(
            student=self.student,
            skill=self.skill,
            proficiency="BEGINNER"
        )

        self.category = AssessmentCategory.objects.create(
            name="Python",
            slug="python",
            skill=self.skill,
            description="Python assessment",
            level="BEGINNER",
            duration="10-15 minutes",
            is_active=True
        )

        for order in range(1, 6):
            AssessmentQuestion.objects.create(
                category=self.category,
                question=f"Python question {order}?",
                options=["Option A", "Option B", "Option C", "Option D"],
                correct_answer=1,
                explanation="Test explanation",
                order=order,
                is_active=True
            )

    def test_get_categories(self):
        response = self.client.get("/api/assessments/categories/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_questions(self):
        response = self.client.get(
            "/api/assessments/categories/python/questions/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_questions_do_not_expose_answers(self):
        response = self.client.get(
            "/api/assessments/categories/python/questions/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        if isinstance(data, dict) and "questions" in data:
            data = data["questions"]

        for question in data:
            self.assertNotIn("correct_answer", question)
            self.assertNotIn("correct_option", question)

    def test_submit_assessment(self):
        questions = AssessmentQuestion.objects.filter(
            category=self.category
        )

        answers = {
            str(question.id): 1
            for question in questions
        }

        response = self.client.post(
            "/api/assessments/submit/",
            {
                "category_id": "python",
                "answers": answers
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            AssessmentAttempt.objects.filter(
                student=self.student,
                category=self.category
            ).exists()
        )

    def test_assessment_history(self):
        response = self.client.get("/api/assessments/history/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/assessments/categories/")

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )


class CourseFinalAssessmentAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="course_assessment_student",
            email="course_assessment@test.com",
            password="TestPass123!"
        )

        self.student = StudentProfile.objects.create(
            user=self.user,
            full_name="Course Assessment Student"
        )

        self.client.force_authenticate(user=self.user)

        self.course = Course.objects.create(
            name="HTML and CSS Testing Course",
            category="Web Development",
            description="Course final assessment test",
            provider="Learnova",
            external_url="https://example.com/html-css",
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

        self.assessment = CourseAssessment.objects.create(
            course=self.course,
            title="HTML and CSS Final Assessment",
            description="Automated test assessment",
            pass_percentage=70,
            is_active=True
        )

        # Four questions make it easy to test PASS (75%) and FAIL (25%).
        self.questions = []

        correct_indexes = [1, 2, 0, 3]

        for order, correct_index in enumerate(correct_indexes, start=1):
            question = CourseAssessmentQuestion.objects.create(
                assessment=self.assessment,
                question=f"Course assessment question {order}?",
                options=["Option A", "Option B", "Option C", "Option D"],
                correct_answer=correct_index,
                explanation="Private test explanation",
                order=order,
                is_active=True
            )
            self.questions.append(question)

        self.progress = CourseProgress.objects.create(
            student=self.student,
            course=self.course,
            total_lessons=20,
            completed_lessons=0,
            completion_status="COMPLETED"
        )

    def make_correct_answers(self):
        return {
            str(question.id): question.correct_answer
            for question in self.questions
        }

    def test_questions_api_returns_questions_without_answer_key(self):
        response = self.client.get(
            f"/api/assessments/courses/{self.course.id}/questions/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["assessment"]["total_questions"], 4)

        for question in response.data["questions"]:
            self.assertNotIn("correct_answer", question)
            self.assertNotIn("explanation", question)

    def test_incomplete_course_cannot_access_questions(self):
        self.progress.completion_status = "IN_PROGRESS"
        self.progress.save(update_fields=["completion_status"])

        response = self.client.get(
            f"/api/assessments/courses/{self.course.id}/questions/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_incomplete_course_cannot_submit_assessment(self):
        self.progress.completion_status = "IN_PROGRESS"
        self.progress.save(update_fields=["completion_status"])

        response = self.client.post(
            f"/api/assessments/courses/{self.course.id}/submit/",
            {"answers": self.make_correct_answers()},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        self.assertEqual(
            CourseAssessmentAttempt.objects.filter(
                student=self.student
            ).count(),
            0
        )

    def test_correct_answers_produce_pass(self):
        answers = self.make_correct_answers()

        response = self.client.post(
            f"/api/assessments/courses/{self.course.id}/submit/",
            {"answers": answers},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertEqual(response.data["attempt"]["score"], 100)
        self.assertEqual(response.data["attempt"]["result"], "PASS")
        self.assertEqual(response.data["attempt"]["correct_answers"], 4)

        self.assertEqual(
            CourseAssessmentAttempt.objects.filter(
                student=self.student,
                assessment=self.assessment
            ).count(),
            1
        )

    def test_wrong_answers_produce_fail(self):
        answers = {
            str(question.id): (question.correct_answer + 1) % len(question.options)
            for question in self.questions
        }

        response = self.client.post(
            f"/api/assessments/courses/{self.course.id}/submit/",
            {"answers": answers},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertEqual(response.data["attempt"]["score"], 0)
        self.assertEqual(response.data["attempt"]["result"], "FAIL")

    def test_retake_creates_separate_attempt(self):
        correct_answers = self.make_correct_answers()

        first_response = self.client.post(
            f"/api/assessments/courses/{self.course.id}/submit/",
            {"answers": correct_answers},
            format="json"
        )

        second_response = self.client.post(
            f"/api/assessments/courses/{self.course.id}/submit/",
            {"answers": correct_answers},
            format="json"
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertEqual(
            second_response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertNotEqual(
            first_response.data["attempt"]["id"],
            second_response.data["attempt"]["id"]
        )

        self.assertEqual(
            CourseAssessmentAttempt.objects.filter(
                student=self.student,
                assessment=self.assessment
            ).count(),
            2
        )

    def test_attempt_history_returns_student_course_attempts(self):
        self.client.post(
            f"/api/assessments/courses/{self.course.id}/submit/",
            {"answers": self.make_correct_answers()},
            format="json"
        )

        response = self.client.get(
            f"/api/assessments/courses/{self.course.id}/history/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["course_id"], self.course.id)
        self.assertEqual(response.data["total_attempts"], 1)
        self.assertEqual(len(response.data["history"]), 1)

    def test_missing_question_is_rejected(self):
        answers = self.make_correct_answers()
        answers.pop(str(self.questions[-1].id))

        response = self.client.post(
            f"/api/assessments/courses/{self.course.id}/submit/",
            {"answers": answers},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_invalid_option_index_is_rejected(self):
        answers = self.make_correct_answers()
        answers[str(self.questions[0].id)] = 99

        response = self.client.post(
            f"/api/assessments/courses/{self.course.id}/submit/",
            {"answers": answers},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_negative_option_index_is_rejected(self):
        answers = self.make_correct_answers()
        answers[str(self.questions[0].id)] = -1

        response = self.client.post(
            f"/api/assessments/courses/{self.course.id}/submit/",
            {"answers": answers},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_attempt_response_does_not_expose_correct_answer_key(self):
        response = self.client.post(
            f"/api/assessments/courses/{self.course.id}/submit/",
            {"answers": self.make_correct_answers()},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertNotIn(
            "correct_answer",
            response.data["attempt"]
        )
        self.assertNotIn(
            "explanation",
            response.data["attempt"]
        )
