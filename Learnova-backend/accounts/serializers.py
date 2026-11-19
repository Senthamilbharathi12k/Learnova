
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import StudentProfile


class StudentRegistrationSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(
        max_length=15,
        required=False,
        allow_blank=True
    )
    education = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True
    )
    college_name = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True
    )
    graduation_year = serializers.IntegerField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "full_name",
            "email",
            "password",
            "confirm_password",
            "phone_number",
            "education",
            "college_name",
            "graduation_year",
        ]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        password = validated_data.pop("password")
        full_name = validated_data.pop("full_name")
        email = validated_data.pop("email")

        profile_data = {
            "phone_number": validated_data.pop("phone_number", ""),
            "education": validated_data.pop("education", ""),
            "college_name": validated_data.pop("college_name", ""),
            "graduation_year": validated_data.pop(
                "graduation_year", None
            ),
        }

        user = User(
            username=email,
            email=email,
            first_name=full_name,
            is_active=False
        )
        user.set_password(password)
        user.save()

        StudentProfile.objects.create(
            user=user,
            full_name=full_name,
            **profile_data
        )

        return user




class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "full_name",
            "email",
            "phone_number",
            "location",
            "education",
            "college_name",
            "department",
            "graduation_year",
            "career_goal",
            "bio",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "email",
            "created_at",
            "updated_at",
        ]

    def validate_full_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Full name cannot be empty."
            )

        return value

    def validate_phone_number(self, value):
        value = value.strip()

        if value:
            allowed_chars = set("0123456789+-() ")

            if not all(char in allowed_chars for char in value):
                raise serializers.ValidationError(
                    "Enter a valid phone number."
                )

            digit_count = sum(char.isdigit() for char in value)

            if digit_count < 7 or digit_count > 15:
                raise serializers.ValidationError(
                    "Phone number must contain 7 to 15 digits."
                )

        return value

    def validate_graduation_year(self, value):
        if value is not None and not (1950 <= value <= 2100):
            raise serializers.ValidationError(
                "Enter a valid graduation year."
            )

        return value

    def validate_bio(self, value):
        if len(value) > 500:
            raise serializers.ValidationError(
                "About Me cannot exceed 500 characters."
            )

        return value
