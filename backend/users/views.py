import logging

from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import CustomUserSerializer, LoginUserSerializer, RegisterUserSerializer

logger = logging.getLogger(__name__)


def _cookie_kwargs(max_age=None):
    kwargs = {
        "httponly": True,
        "secure": settings.JWT_COOKIE_SECURE,
        "samesite": settings.JWT_COOKIE_SAMESITE,
        "path": "/",
    }
    if settings.JWT_COOKIE_DOMAIN:
        kwargs["domain"] = settings.JWT_COOKIE_DOMAIN
    if max_age is not None:
        kwargs["max_age"] = int(max_age.total_seconds())
    return kwargs


def _set_token_cookies(response, access_token, refresh_token=None):
    response.set_cookie(
        key=settings.JWT_ACCESS_COOKIE_NAME,
        value=access_token,
        **_cookie_kwargs(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"]),
    )
    if refresh_token is not None:
        response.set_cookie(
            key=settings.JWT_REFRESH_COOKIE_NAME,
            value=str(refresh_token),
            **_cookie_kwargs(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]),
        )


def _delete_token_cookies(response):
    delete_kwargs = {
        "path": "/",
        "samesite": settings.JWT_COOKIE_SAMESITE,
    }
    if settings.JWT_COOKIE_DOMAIN:
        delete_kwargs["domain"] = settings.JWT_COOKIE_DOMAIN
    response.delete_cookie(settings.JWT_ACCESS_COOKIE_NAME, **delete_kwargs)
    response.delete_cookie(settings.JWT_REFRESH_COOKIE_NAME, **delete_kwargs)


class UserInfoView(RetrieveUpdateAPIView):
    """
    API endpoint for retrieving and updating the authenticated user's info.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer
    throttle_scope = "user_settings"

    def get_object(self):
        return self.request.user


@method_decorator(csrf_protect, name="dispatch")
class UserRegistrationView(CreateAPIView):
    """
    API endpoint for registering a new user.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = RegisterUserSerializer
    throttle_scope = "auth_register"


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    """
    API endpoint for user login. Sets JWT tokens in cookies on success.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "auth_login"

    def post(self, request):
        """
        Handle user login, validate credentials, and set JWT cookies.
        """
        serializer = LoginUserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = Response({
                "user": CustomUserSerializer(user).data
            },
            status=status.HTTP_200_OK)

            _set_token_cookies(response, access_token, refresh)
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_protect, name="dispatch")
class LogoutView(APIView):
    """
    API endpoint for user logout. Clears authentication cookies.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "auth_logout"

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)

        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                refresh.blacklist()
            except TokenError:
                response = Response(
                    {"message": "Session cookies cleared."},
                    status=status.HTTP_200_OK,
                )
                _delete_token_cookies(response)
                return response
            except Exception:
                logger.exception("Unexpected failure blacklisting refresh token during logout")
                return Response(
                    {"error": "Could not invalidate refresh token"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        response = Response({"message": "Successfully logged out!"}, status=status.HTTP_200_OK)
        _delete_token_cookies(response)
        return response


@method_decorator(csrf_protect, name="dispatch")
class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "auth_refresh"

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)

        if not refresh_token:
            return Response({"error": "Refresh token not provided"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            response = Response({"message": "Access token refreshed successfully"}, status=status.HTTP_200_OK)
            _set_token_cookies(response, access_token)
            return response
        except TokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfCookieView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)
