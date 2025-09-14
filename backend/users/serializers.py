"""
Serializers for the users app.
Includes serializers for user registration, login, and user info.
"""

from rest_framework.serializers import ModelSerializer, Serializer
from .models import CustomUser
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework.views import APIView

class CustomUserSerializer(ModelSerializer):
    """
    Serializer for displaying user info (id, email, username).
    """

    class Meta:
        model = CustomUser
        fields = ("id", "email", "username")

class RegisterUserSerializer(ModelSerializer):
    """
    Serializer for registering a new user. Handles password hashing.
    """

    class Meta:
        model = CustomUser
        fields = ("email", "username", "password")
        extra_kwargs = {"password": {"write_only":True}}

    def create(self, validated_data):
        """
        Create a new user with hashed password.
        Args:
            validated_data (dict): Validated user data.
        Returns:
            CustomUser: The created user instance.
        """
        user = CustomUser.objects.create_user(**validated_data)
        return user      

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
        raise serializers.ValidationError("Incorrect ccredentials!")


