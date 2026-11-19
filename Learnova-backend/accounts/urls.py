from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    StudentRegistrationView,
    VerifyRegistrationOTPView,
    StudentLoginView,
    ForgotPasswordView,
    VerifyResetOTPView,
    ResetPasswordView,
    StudentLogoutView,
    StudentProfileView,
)

urlpatterns = [
    path("register/", StudentRegistrationView.as_view(), name="student-register"),
    path("verify-otp/",VerifyRegistrationOTPView.as_view(),name="verify-registration-otp"),
    path("login/", StudentLoginView.as_view(), name="student-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("verify-reset-otp/", VerifyResetOTPView.as_view(), name="verify-reset-otp"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("logout/", StudentLogoutView.as_view(), name="student-logout"),
    path("profile/", StudentProfileView.as_view(), name="student-profile"),

]
