
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import ResumeResource


class ResumeResourceAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="resume_test_user",
            password="TestPassword123"
        )

        self.client.force_authenticate(user=self.user)

        self.url = reverse("resume-resource-list")

        self.builder = ResumeResource.objects.create(
            title="Canva Resume Builder",
            category="RESUME_BUILDER",
            description="Create professional resumes easily.",
            url="https://www.canva.com/resumes/",
            pricing_type="FREE",
            is_active=True
        )

        self.ats_checker = ResumeResource.objects.create(
            title="ATS Resume Checker",
            category="ATS_CHECKER",
            description="Check resume ATS compatibility.",
            url="https://example.com/ats-checker",
            pricing_type="PAID",
            is_active=True
        )

        self.guidance = ResumeResource.objects.create(
            title="Resume Writing Guide",
            category="RESUME_GUIDANCE",
            description="Learn professional resume writing.",
            url="https://example.com/resume-guide",
            pricing_type="FREE",
            is_active=True
        )

        self.inactive_resource = ResumeResource.objects.create(
            title="Inactive Resume Resource",
            category="RESUME_BUILDER",
            description="Inactive resource.",
            url="https://example.com/inactive-resume",
            pricing_type="FREE",
            is_active=False
        )

    def test_unauthenticated_user_cannot_access_resources(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 401)

    def test_authenticated_user_can_get_resources(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 3)

    def test_only_active_resources_are_returned(self):
        response = self.client.get(self.url)

        titles = [
            item["title"] for item in response.data["resources"]
        ]

        self.assertNotIn(
            "Inactive Resume Resource",
            titles
        )

    def test_empty_resources_response(self):
        ResumeResource.objects.all().delete()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 0)
        self.assertEqual(response.data["resources"], [])

    def test_search_resources_by_title(self):
        response = self.client.get(
            self.url,
            {"search": "canva"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)
        self.assertEqual(
            response.data["resources"][0]["title"],
            "Canva Resume Builder"
        )

    def test_search_is_case_insensitive(self):
        response = self.client.get(
            self.url,
            {"search": "CANVA"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)

    def test_filter_by_category(self):
        response = self.client.get(
            self.url,
            {"category": "ATS_CHECKER"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)
        self.assertEqual(
            response.data["resources"][0]["category"],
            "ATS_CHECKER"
        )

    def test_category_filter_is_case_insensitive(self):
        response = self.client.get(
            self.url,
            {"category": "resume_builder"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)

    def test_invalid_category_returns_400(self):
        response = self.client.get(
            self.url,
            {"category": "INVALID_CATEGORY"}
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_filter_by_pricing_type(self):
        response = self.client.get(
            self.url,
            {"pricing_type": "FREE"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 2)

        for resource in response.data["resources"]:
            self.assertEqual(resource["pricing_type"], "FREE")

    def test_pricing_filter_is_case_insensitive(self):
        response = self.client.get(
            self.url,
            {"pricing_type": "paid"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)

    def test_invalid_pricing_type_returns_400(self):
        response = self.client.get(
            self.url,
            {"pricing_type": "INVALID"}
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_combined_category_and_pricing_filters(self):
        response = self.client.get(
            self.url,
            {
                "category": "RESUME_BUILDER",
                "pricing_type": "FREE"
            }
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)

    def test_response_contains_expected_fields(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.data)
        self.assertIn("total_resources", response.data)
        self.assertIn("resources", response.data)

        resource = response.data["resources"][0]

        expected_fields = [
            "id",
            "title",
            "category",
            "description",
            "url",
            "pricing_type"
        ]

        for field in expected_fields:
            self.assertIn(field, resource)

    def test_search_ignores_surrounding_spaces(self):
        response = self.client.get(
            self.url,
            {"search": "  Canva  "}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)
