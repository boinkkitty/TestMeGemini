"""
Serializers for the users app.
Includes serializers for user registration, login, and user info.
"""

from rest_framework.serializers import ModelSerializer, Serializer
from .models import CustomUser
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction

class CustomUserSerializer(ModelSerializer):
    """
    Serializer for displaying user info (id, email, username).
    """

    class Meta:
        model = CustomUser
        fields = ("id", "email", "username")

    def validate_email(self, value):
        normalized = value.strip().lower()
        duplicate = CustomUser.objects.filter(email__iexact=normalized)
        if self.instance is not None:
            duplicate = duplicate.exclude(pk=self.instance.pk)
        if duplicate.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized

    def update(self, instance, validated_data):
        try:
            with transaction.atomic():
                return super().update(instance, validated_data)
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {"email": "A user with this email already exists."}
            ) from exc

class RegisterUserSerializer(ModelSerializer):
    """
    Serializer for registering a new user. Handles password hashing.
    """

    class Meta:
        model = CustomUser
        fields = ("email", "username", "password")
        extra_kwargs = {"password": {"write_only":True}}

    def validate(self, attrs):
        candidate = CustomUser(email=attrs.get("email"), username=attrs.get("username"))
        try:
            validate_password(attrs.get("password"), user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc
        return attrs

    def validate_email(self, value):
        normalized = value.strip().lower()
        if CustomUser.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized

    def create(self, validated_data):
        """
        Create a new user with hashed password.
        Args:
            validated_data (dict): Validated user data.
        Returns:
            CustomUser: The created user instance.
        """
        try:
            return CustomUser.objects.create_user(**validated_data)
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {"email": "A user with this email already exists."}
            ) from exc

class LoginUserSerializer(Serializer):
    """
    Serializer for user login. Validates credentials and returns user if valid.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Validate user credentials and return user if valid.
        Args:
            data (dict): Login credentials.
        Returns:
            CustomUser: The authenticated user.
        Raises:
            ValidationError: If credentials are incorrect.
        """
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect credentials!")
