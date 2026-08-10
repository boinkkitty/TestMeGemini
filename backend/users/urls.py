"""
URL routing for the users app.
Defines endpoints for user info, registration, login, logout, and token refresh.
"""

from django.urls import path
from .views import (
    CookieTokenRefreshView,
    CsrfCookieView,
    LoginView,
    LogoutView,
    UserInfoView,
    UserRegistrationView,
)

user_urlpatterns = [
    path("", UserRegistrationView.as_view(), name="register-user"),
    path("me/", UserInfoView.as_view(), name="user-info"),
]

auth_urlpatterns = [
    path("csrf/", CsrfCookieView.as_view(), name="auth-csrf"),
    path("login/", LoginView.as_view(), name="user-login"),
    path("logout/", LogoutView.as_view(), name="user-logout"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
]

urlpatterns = [
    path("user-info/", UserInfoView.as_view(), name="legacy-user-info"),
    path("register/", UserRegistrationView.as_view(), name="legacy-register-user"),
    path("login/", LoginView.as_view(), name="legacy-user-login"),
    path("logout/", LogoutView.as_view(), name="legacy-user-logout"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="legacy-token-refresh"),
    path("csrf/", CsrfCookieView.as_view(), name="legacy-auth-csrf"),
]
