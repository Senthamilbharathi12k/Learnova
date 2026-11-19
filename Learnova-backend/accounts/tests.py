
import re

from django.contrib.auth.models import User
from django.core import mail
from django.test import TestCase, override_settings
from django.contrib.auth.hashers import make_password

from rest_framework.test import APIClient
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from .models import StudentProfile, EmailOTP


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend"
)
class AuthenticationAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="student@example.com",
            email="student@example.com",
            password="Str0ng!Passw0rd#2026",
            first_name="Test Student",
            is_active=True,
        )

        self.profile = StudentProfile.objects.create(
            user=self.user,
            full_name="Test Student",
            phone_number="9876543210",
            education="B.E",
            college_name="Test Engineering College",
            graduation_year=2027,
        )

        self.login_url = "/api/auth/login/"
        self.register_url = "/api/auth/register/"
        self.verify_url = "/api/auth/verify-otp/"
        self.profile_url = "/api/auth/profile/"
        self.logout_url = "/api/auth/logout/"
        self.forgot_url = "/api/auth/forgot-password/"
        self.verify_reset_url = "/api/auth/verify-reset-otp/"
        self.reset_url = "/api/auth/reset-password/"

    def get_access_token(self):
        response = self.client.post(
            self.login_url,
            {
                "email": "student@example.com",
                "password": "Str0ng!Passw0rd#2026",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["tokens"]["access"]

    # LOGIN TESTS

    def test_login_success_returns_jwt_tokens(self):
        response = self.client.post(
            self.login_url,
            {
                "email": "student@example.com",
                "password": "Str0ng!Passw0rd#2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data["tokens"])
        self.assertIn("refresh", response.data["tokens"])

    def test_login_invalid_password_rejected(self):
        response = self.client.post(
            self.login_url,
            {
                "email": "student@example.com",
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_login_missing_fields_rejected(self):
        response = self.client.post(
            self.login_url,
            {"email": "student@example.com"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_user_cannot_login(self):
        self.user.is_active = False
        self.user.save()

        response = self.client.post(
            self.login_url,
            {
                "email": "student@example.com",
                "password": "Str0ng!Passw0rd#2026",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # REGISTRATION AND OTP TESTS

    def test_registration_creates_inactive_user_and_sends_otp(self):
        response = self.client.post(
            self.register_url,
            {
                "full_name": "New Student",
                "email": "newstudent@example.com",
                "password": "Str0ng!Passw0rd#2026",
                "confirm_password": "Str0ng!Passw0rd#2026",
                "phone_number": "9876543210",
                "education": "B.E",
                "college_name": "Example College",
                "graduation_year": 2027,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        new_user = User.objects.get(
            email="newstudent@example.com"
        )

        self.assertFalse(new_user.is_active)
        self.assertTrue(
            StudentProfile.objects.filter(user=new_user).exists()
        )
        self.assertEqual(len(mail.outbox), 1)

        self.assertTrue(
            EmailOTP.objects.filter(
                user=new_user,
                purpose="REGISTRATION",
                is_verified=False,
            ).exists()
        )

    def test_registration_password_mismatch_rejected(self):
        response = self.client.post(
            self.register_url,
            {
                "full_name": "New Student",
                "email": "newstudent@example.com",
                "password": "Str0ng!Passw0rd#2026",
                "confirm_password": "Different!Pass2026",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_registration_duplicate_email_rejected(self):
        response = self.client.post(
            self.register_url,
            {
                "full_name": "Duplicate Student",
                "email": "student@example.com",
                "password": "Str0ng!Passw0rd#2026",
                "confirm_password": "Str0ng!Passw0rd#2026",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_registration_otp_verification_activates_user(self):
        self.client.post(
            self.register_url,
            {
                "full_name": "OTP Student",
                "email": "otpstudent@example.com",
                "password": "Str0ng!Passw0rd#2026",
                "confirm_password": "Str0ng!Passw0rd#2026",
            },
            format="json",
        )

        new_user = User.objects.get(
            email="otpstudent@example.com"
        )

        otp_record = EmailOTP.objects.get(
            user=new_user,
            purpose="REGISTRATION",
        )

        # Test uses the stored hash; no real email or OTP is exposed.
        from django.contrib.auth.hashers import check_password

        # The OTP is retrieved from the test email.
        otp_match = re.search(
            r"(?<!\d)\d{6}(?!\d)",
            mail.outbox[-1].body,
        )
        self.assertIsNotNone(otp_match)

        otp = otp_match.group()

        self.assertTrue(
            check_password(otp, otp_record.otp_hash)
        )

        response = self.client.post(
            self.verify_url,
            {
                "email": "otpstudent@example.com",
                "otp": otp,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        new_user.refresh_from_db()
        self.assertTrue(new_user.is_active)

    # PROFILE TESTS

    def test_profile_requires_authentication(self):
        response = self.client.get(self.profile_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_view_profile(self):
        token = self.get_access_token()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )

        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["profile"]["email"],
            "student@example.com",
        )

    def test_profile_can_be_updated(self):
        token = self.get_access_token()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )

        response = self.client.patch(
            self.profile_url,
            {"full_name": "Updated Student"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.profile.refresh_from_db()
        self.assertEqual(
            self.profile.full_name,
            "Updated Student",
        )

    def test_invalid_phone_number_rejected(self):
        token = self.get_access_token()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )

        response = self.client.patch(
            self.profile_url,
            {"phone_number": "invalid-phone"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # LOGOUT TEST

    def test_logout_blacklists_refresh_token(self):
        access_token = self.get_access_token()

        login_response = self.client.post(
            self.login_url,
            {
                "email": "student@example.com",
                "password": "Str0ng!Passw0rd#2026",
            },
            format="json",
        )

        refresh_token = login_response.data["tokens"]["refresh"]

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access_token}"
        )

        response = self.client.post(
            self.logout_url,
            {"refresh": refresh_token},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_205_RESET_CONTENT,
        )

    # PASSWORD RESET TESTS

    def test_forgot_password_sends_otp(self):
        response = self.client.post(
            self.forgot_url,
            {"email": "student@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

        self.assertTrue(
            EmailOTP.objects.filter(
                user=self.user,
                purpose="FORGOT_PASSWORD",
                is_verified=False,
            ).exists()
        )

    def test_unknown_email_forgot_password_does_not_reveal_account(self):
        response = self.client.post(
            self.forgot_url,
            {"email": "unknown@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_requires_verified_otp(self):
        response = self.client.post(
            self.reset_url,
            {
                "email": "student@example.com",
                "new_password": "NewSecure!Pass2026",
                "confirm_password": "NewSecure!Pass2026",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


class DashboardAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="dashboard@example.com",
            email="dashboard@example.com",
            password="TestPass123!2026",
            first_name="Dashboard Student",
        )

        self.profile = StudentProfile.objects.create(
            user=self.user,
            full_name="Dashboard Student",
            phone_number="9876543210",
            education="B.E",
            college_name="Test Engineering College",
            graduation_year=2027,
        )

        self.dashboard_url = "/api/dashboard/"

    def test_dashboard_requires_authentication(self):
        response = self.client.get(self.dashboard_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_student_can_view_dashboard(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.dashboard_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["message"],
            "Dashboard data retrieved successfully.",
        )

        dashboard = response.data["dashboard"]

        self.assertEqual(
            dashboard["student_name"],
            "Dashboard Student",
        )

        self.assertEqual(
            dashboard["profile_completion"],
            56,
        )

        self.assertEqual(dashboard["skills_count"], 0)
        self.assertEqual(dashboard["interests_count"], 0)
        self.assertEqual(
            dashboard["recommended_courses_count"],
            0,
        )
