"""
Custom user manager for the users app.
Provides methods for creating regular users and superusers using email as the unique identifier.
"""

from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    """
    Custom manager for the CustomUser model.
    Handles user and superuser creation with email as the unique identifier.
    """
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.
        Args:
            email (str): The user's email address.
            password (str, optional): The user's password.
            **extra_fields: Additional fields for the user model.
        Returns:
            CustomUser: The created user instance.
        Raises:
            ValueError: If email is not provided.
        """
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email).strip().lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password.
        Args:
            email (str): The user's email address.
            password (str, optional): The user's password.
            **extra_fields: Additional fields for the user model.
        Returns:
            CustomUser: The created superuser instance.
        Raises:
            ValueError: If is_staff or is_superuser are not set to True.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True")
        
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True")
        
        return self.create_user(email, password, **extra_fields)
