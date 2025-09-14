"""
Custom authentication backend for JWT in cookies.
Extends SimpleJWT's JWTAuthentication to support reading tokens from cookies.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class that retrieves JWT from cookies instead of headers.
    """
    def authenticate(self, request):
        """
        Authenticate the request using a JWT from the 'access_token' cookie.
        Args:
            request (Request): The HTTP request object.
        Returns:
            tuple: (user, validated_token) if authentication is successful.
            None: If no token is found.
        Raises:
            AuthenticationFailed: If token validation or user retrieval fails.
        """
        token = request.COOKIES.get("access_token")

        if not token:
            return None
        try:
            validated_token = self.get_validated_token(token)
        except AuthenticationFailed as e:
            raise AuthenticationFailed(f"Token validation failed:{str(e)}")
        try:
            user=self.get_user(validated_token)
            return user, validated_token
        except AuthenticationFailed as e:
            raise AuthenticationFailed(f"Error retrieving user:{str(e)}")

    pass

