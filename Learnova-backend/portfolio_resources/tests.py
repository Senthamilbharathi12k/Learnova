
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import PortfolioResource


class PortfolioResourceAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="portfolio_test_user",
            password="TestPassword123"
        )

        self.client.force_authenticate(user=self.user)

        self.url = reverse("portfolio-resource-list")

        self.developer = PortfolioResource.objects.create(
            title="GitHub Developer Portfolio",
            category="DEVELOPER_PORTFOLIO",
            access="FREE",
            description="Build and showcase developer projects.",
            features=["Project showcase", "GitHub integration"],
            url="https://github.com/",
            is_active=True
        )

        self.design = PortfolioResource.objects.create(
            title="Behance Design Portfolio",
            category="DESIGN_PORTFOLIO",
            access="FREE",
            description="Showcase creative design projects.",
            features=["Design showcase", "Creative projects"],
            url="https://www.behance.net/",
            is_active=True
        )

        self.website_builder = PortfolioResource.objects.create(
            title="Portfolio Website Builder",
            category="WEBSITE_BUILDER",
            access="PAID",
            description="Create a personal portfolio website.",
            features=["Website builder", "Templates"],
            url="https://example.com/website-builder",
            is_active=True
        )

        self.inactive_resource = PortfolioResource.objects.create(
            title="Inactive Portfolio Resource",
            category="PORTFOLIO_TEMPLATES",
            access="FREE",
            description="Inactive portfolio resource.",
            features=[],
            url="https://example.com/inactive-portfolio",
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
            "Inactive Portfolio Resource",
            titles
        )

    def test_empty_resources_response(self):
        PortfolioResource.objects.all().delete()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 0)
        self.assertEqual(response.data["resources"], [])

    def test_search_resources_by_title(self):
        response = self.client.get(
            self.url,
            {"search": "GitHub"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)
        self.assertEqual(
            response.data["resources"][0]["title"],
            "GitHub Developer Portfolio"
        )

    def test_search_resources_by_description(self):
        response = self.client.get(
            self.url,
            {"search": "creative design"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)
        self.assertEqual(
            response.data["resources"][0]["title"],
            "Behance Design Portfolio"
        )

    def test_search_resources_by_category(self):
        response = self.client.get(
            self.url,
            {"search": "DEVELOPER_PORTFOLIO"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)

    def test_filter_by_category(self):
        response = self.client.get(
            self.url,
            {"category": "DESIGN_PORTFOLIO"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)
        self.assertEqual(
            response.data["resources"][0]["category"],
            "DESIGN_PORTFOLIO"
        )

    def test_category_filter_is_case_insensitive(self):
        response = self.client.get(
            self.url,
            {"category": "developer_portfolio"}
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

    def test_combined_search_and_category_filters(self):
        response = self.client.get(
            self.url,
            {
                "search": "portfolio",
                "category": "DEVELOPER_PORTFOLIO"
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
            "access",
            "description",
            "features",
            "url"
        ]

        for field in expected_fields:
            self.assertIn(field, resource)

    def test_features_are_returned_as_list(self):
        response = self.client.get(
            self.url,
            {"search": "GitHub"}
        )

        self.assertEqual(response.status_code, 200)

        resource = response.data["resources"][0]

        self.assertIsInstance(resource["features"], list)
        self.assertEqual(
            resource["features"],
            ["Project showcase", "GitHub integration"]
        )

    def test_search_ignores_surrounding_spaces(self):
        response = self.client.get(
            self.url,
            {"search": "  GitHub  "}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_resources"], 1)
