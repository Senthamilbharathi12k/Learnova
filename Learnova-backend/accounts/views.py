
import secrets
import string

from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmailOTP
from .serializers import StudentRegistrationSerializer

from django.contrib.auth.hashers import check_password

from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    StudentRegistrationSerializer,
    StudentProfileSerializer,
)


class StudentRegistrationView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StudentRegistrationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                user = serializer.save()

                otp = ''.join(
                    secrets.choice(string.digits)
                    for _ in range(6)
                )

                EmailOTP.objects.filter(
                    user=user,
                    purpose="REGISTRATION",
                    is_verified=False
                ).delete()

                EmailOTP.objects.create(
                    user=user,
                    otp_hash=make_password(otp),
                    purpose="REGISTRATION",
                    expires_at=timezone.now() + timedelta(minutes=5)
                )

                send_mail(
                    subject="Learnova - Email Verification OTP",
                    message=(
                        f"Hello {user.first_name},\n\n"
                        f"Your Learnova verification OTP is: {otp}\n\n"
                        "This OTP expires in 5 minutes.\n"
                        "Please do not share it with anyone.\n\n"
                        "Team Learnova"
                    ),
                    from_email=None,
                    recipient_list=[user.email],
                    fail_silently=False
                )

        except Exception:
            return Response(
                {
                    "message": (
                        "Registration could not be completed. "
                        "Please check the email configuration and try again."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        return Response(
            {
                "message": (
                    "Registration successful. "
                    "Please check your email for the verification OTP."
                ),
                "email": user.email
            },
            status=status.HTTP_201_CREATED
        )


class VerifyRegistrationOTPView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        otp = str(request.data.get("otp", "")).strip()

        if not email or not otp:
            return Response(
                {"message": "Email and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(otp) != 6 or not otp.isdigit():
            return Response(
                {"message": "Enter a valid 6-digit OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            otp_record = EmailOTP.objects.filter(
                user__email__iexact=email,
                purpose="REGISTRATION",
                is_verified=False
            ).latest("created_at")
        except EmailOTP.DoesNotExist:
            return Response(
                {"message": "No pending registration OTP found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_record.attempts >= 5:
            return Response(
                {"message": "Maximum OTP attempts exceeded. Please request a new OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_record.is_expired():
            return Response(
                {"message": "OTP has expired. Please request a new OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not check_password(otp, otp_record.otp_hash):
            otp_record.attempts += 1
            otp_record.save(update_fields=["attempts"])

            remaining = max(0, 5 - otp_record.attempts)

            return Response(
                {
                    "message": "Invalid OTP.",
                    "remaining_attempts": remaining
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_record.is_verified = True
        otp_record.save(update_fields=["is_verified"])

        user = otp_record.user
        user.is_active = True
        user.save(update_fields=["is_active"])

        return Response(
            {
                "message": "Email verified successfully. Your Learnova account is now active.",
                "email": user.email,
                "is_active": user.is_active
            },
            status=status.HTTP_200_OK
        )

class StudentLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        # Validate required fields
        if not email or not password:
            return Response(
                {"message": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find user by email
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response(
                {"message": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check password
        if not check_password(password, user.password):
            return Response(
                {"message": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Prevent inactive / unverified accounts
        if not user.is_active:
            return Response(
                {
                    "message": (
                        "Your account is not active. "
                        "Please verify your email first."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        # Get student profile
        profile = getattr(user, "student_profile", None)

        return Response(
            {
                "message": "Login successful.",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(access)
                },
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "full_name": (
                        profile.full_name
                        if profile
                        else user.first_name
                    ),
                    "is_active": user.is_active
                }
            },
            status=status.HTTP_200_OK
        )

class StudentLogoutView(APIView):
    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"message": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)

            # Ensure the refresh token belongs to the logged-in user.
            if str(token["user_id"]) != str(request.user.id):
                return Response(
                    {"message": "Invalid refresh token."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token.blacklist()

            return Response(
                {"message": "Logout successful."},
                status=status.HTTP_205_RESET_CONTENT
            )

        except TokenError:
            return Response(
                {"message": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST
            )

class ForgotPasswordView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()

        if not email:
            return Response(
                {"message": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(
            email__iexact=email,
            is_active=True
        ).first()

        # Avoid revealing whether an email is registered.
        if not user:
            return Response(
                {"message": "If an active account exists, a reset OTP will be sent."},
                status=status.HTTP_200_OK
            )

        otp = ''.join(
            secrets.choice(string.digits)
            for _ in range(6)
        )

        try:
            with transaction.atomic():
                EmailOTP.objects.filter(
                    user=user,
                    purpose="FORGOT_PASSWORD"
                ).delete()

                EmailOTP.objects.create(
                    user=user,
                    otp_hash=make_password(otp),
                    purpose="FORGOT_PASSWORD",
                    expires_at=timezone.now() + timedelta(minutes=5)
                )

                send_mail(
                    subject="Learnova - Password Reset OTP",
                    message=(
                        f"Hello {user.first_name},\n\n"
                        f"Your Learnova password reset OTP is: {otp}\n\n"
                        "This OTP expires in 5 minutes.\n"
                        "Please do not share it with anyone.\n\n"
                        "Team Learnova"
                    ),
                    from_email=None,
                    recipient_list=[user.email],
                    fail_silently=False
                )

        except Exception:
            return Response(
                {"message": "Unable to send reset OTP. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        return Response(
            {"message": "If an active account exists, a reset OTP has been sent."},
            status=status.HTTP_200_OK
        )


class VerifyResetOTPView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        otp = str(request.data.get("otp", "")).strip()

        if not email or not otp:
            return Response(
                {"message": "Email and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(otp) != 6 or not otp.isdigit():
            return Response(
                {"message": "Enter a valid 6-digit OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            otp_record = EmailOTP.objects.filter(
                user__email__iexact=email,
                user__is_active=True,
                purpose="FORGOT_PASSWORD",
                is_verified=False
            ).latest("created_at")
        except EmailOTP.DoesNotExist:
            return Response(
                {"message": "No pending password reset OTP found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_record.attempts >= 5:
            return Response(
                {"message": "Maximum OTP attempts exceeded. Request a new OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_record.is_expired():
            return Response(
                {"message": "OTP has expired. Request a new OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not check_password(otp, otp_record.otp_hash):
            otp_record.attempts += 1
            otp_record.save(update_fields=["attempts"])

            return Response(
                {
                    "message": "Invalid OTP.",
                    "remaining_attempts": max(0, 5 - otp_record.attempts)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_record.is_verified = True
        otp_record.save(update_fields=["is_verified"])

        return Response(
            {"message": "OTP verified successfully. You can now reset your password."},
            status=status.HTTP_200_OK
        )


class ResetPasswordView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        new_password = request.data.get("new_password", "")
        confirm_password = request.data.get("confirm_password", "")

        if not email or not new_password or not confirm_password:
            return Response(
                {"message": "Email, new password and confirm password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {"message": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(new_password)
        except ValidationError as error:
            return Response(
                {"message": list(error.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                otp_record = EmailOTP.objects.select_for_update().filter(
                    user__email__iexact=email,
                    user__is_active=True,
                    purpose="FORGOT_PASSWORD",
                    is_verified=True
                ).latest("created_at")

                if otp_record.is_expired():
                    otp_record.delete()
                    return Response(
                        {"message": "OTP has expired. Request a new OTP."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                user = otp_record.user
                user.set_password(new_password)
                user.save(update_fields=["password"])

                # Prevent reuse of the same verified OTP.
                otp_record.delete()

        except EmailOTP.DoesNotExist:
            return Response(
                {"message": "Please verify your password reset OTP first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"message": "Password reset successfully. Please login with your new password."},
            status=status.HTTP_200_OK
        )


class StudentProfileView(APIView):

    def get(self, request):
        profile = getattr(
            request.user,
            "student_profile",
            None
        )

        if profile is None:
            return Response(
                {"message": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StudentProfileSerializer(profile)

        return Response(
            {
                "message": "Profile retrieved successfully.",
                "profile": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def patch(self, request):
        profile = getattr(
            request.user,
            "student_profile",
            None
        )

        if profile is None:
            return Response(
                {"message": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StudentProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            updated_profile = serializer.save()

            if "full_name" in serializer.validated_data:
                request.user.first_name = updated_profile.full_name
                request.user.save(update_fields=["first_name"])

        return Response(
            {
                "message": "Profile updated successfully.",
                "profile": StudentProfileSerializer(
                    updated_profile
                ).data
            },
            status=status.HTTP_200_OK
        )


class DashboardSummaryView(APIView):
    """
    Returns dashboard summary for the authenticated student.
    """

    def get(self, request):
        from skills_interests.models import (
            StudentSkill,
            StudentInterest,
        )
        from courses.views import get_matching_courses

        profile = getattr(
            request.user,
            "student_profile",
            None
        )

        if profile is None:
            return Response(
                {"message": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate profile completion.
        profile_fields = [
            profile.full_name,
            profile.phone_number,
            profile.location,
            profile.education,
            profile.college_name,
            profile.department,
            profile.graduation_year,
            profile.career_goal,
            profile.bio,
        ]

        completed_fields = sum(
            1
            for value in profile_fields
            if value is not None and str(value).strip()
        )

        profile_completion = round(
            completed_fields / len(profile_fields) * 100
        )

        # Count active student skills.
        skills_count = StudentSkill.objects.filter(
            student=profile,
            skill__is_active=True
        ).count()

        # Count active student interests.
        interests_count = StudentInterest.objects.filter(
            student=profile,
            interest__is_active=True
        ).count()

        # Use the existing rule-based recommendation logic.
        recommended_courses = get_matching_courses(profile)

        return Response(
            {
                "message": "Dashboard data retrieved successfully.",
                "dashboard": {
                    "student_name": profile.full_name,
                    "profile_completion": profile_completion,
                    "skills_count": skills_count,
                    "interests_count": interests_count,
                    "recommended_courses_count": len(
                        recommended_courses
                    ),
                }
            },
            status=status.HTTP_200_OK
        )
