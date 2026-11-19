
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class StudentProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile"
    )

    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=15, blank=True)

    location = models.CharField(max_length=150, blank=True)
    education = models.CharField(max_length=150, blank=True)
    college_name = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=150, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)

    career_goal = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True, max_length=500)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


class EmailOTP(models.Model):
    PURPOSE_CHOICES = [
        ("REGISTRATION", "Registration"),
        ("LOGIN", "Login"),
        ("FORGOT_PASSWORD", "Forgot Password"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_otps"
    )
    otp_hash = models.CharField(max_length=128)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.user.email} - {self.purpose}"
