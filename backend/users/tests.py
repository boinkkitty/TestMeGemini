from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from users.urls import auth_urlpatterns, user_urlpatterns, urlpatterns


def csrf_client():
    client = APIClient(enforce_csrf_checks=True)
    response = client.get("/api/v1/auth/csrf/")
    token = client.cookies[settings.CSRF_COOKIE_NAME].value
    return client, token, response


@override_settings(
    DEBUG=False,
    SECRET_KEY="test-secret-key",
    JWT_COOKIE_SECURE=True,
    JWT_COOKIE_SAMESITE="Strict",
    ALLOWED_HOSTS=["testserver"],
    CORS_ALLOWED_ORIGINS=["https://app.example.com"],
    CSRF_TRUSTED_ORIGINS=["https://app.example.com"],
    REST_FRAMEWORK={
        **settings.REST_FRAMEWORK,
        "DEFAULT_THROTTLE_RATES": {
            **settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"],
            "auth_login": "100/minute",
            "auth_register": "100/minute",
            "auth_refresh": "100/minute",
            "auth_logout": "100/minute",
            "user_settings": "100/minute",
        },
    },
)
class AuthenticationSecurityTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="user@example.com",
            username="user",
            password="correct-password",
        )

    def test_settings_fail_closed_and_use_production_cookie_security(self):
        self.assertEqual(
            settings.REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"],
            ("rest_framework.permissions.IsAuthenticated",),
        )
        self.assertEqual(settings.ALLOWED_HOSTS, ["testserver"])
        self.assertEqual(settings.CORS_ALLOWED_ORIGINS, ["https://app.example.com"])
        self.assertEqual(settings.CSRF_TRUSTED_ORIGINS, ["https://app.example.com"])
        self.assertTrue(settings.JWT_COOKIE_SECURE)
        self.assertEqual(settings.JWT_COOKIE_SAMESITE, "Strict")

    def test_url_exports_support_v1_mounting_and_legacy_compatibility(self):
        self.assertEqual([pattern.pattern._route for pattern in user_urlpatterns], ["", "me/"])
        self.assertEqual(
            [pattern.pattern._route for pattern in auth_urlpatterns],
            ["csrf/", "login/", "logout/", "token/refresh/"],
        )
        self.assertIn("user-info/", [pattern.pattern._route for pattern in urlpatterns])
        self.assertIn("refresh/", [pattern.pattern._route for pattern in urlpatterns])

    def test_csrf_bootstrap_sets_cookie_for_browser_auth_flow(self):
        _client, _token, response = csrf_client()

        self.assertEqual(response.status_code, 204)
        self.assertIn(settings.CSRF_COOKIE_NAME, response.cookies)

    def test_login_requires_csrf_and_sets_consistent_secure_cookies(self):
        no_csrf_client = APIClient(enforce_csrf_checks=True)
        blocked = no_csrf_client.post(
            "/api/v1/auth/login/",
            {"email": "user@example.com", "password": "correct-password"},
            format="json",
        )
        self.assertEqual(blocked.status_code, 403)

        client, csrf_token, _response = csrf_client()
        response = client.post(
            "/api/v1/auth/login/",
            {"email": "user@example.com", "password": "correct-password"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        access_cookie = response.cookies[settings.JWT_ACCESS_COOKIE_NAME]
        refresh_cookie = response.cookies[settings.JWT_REFRESH_COOKIE_NAME]
        self.assertTrue(access_cookie["httponly"])
        self.assertTrue(access_cookie["secure"])
        self.assertEqual(access_cookie["samesite"], "Strict")
        self.assertEqual(access_cookie["path"], "/")
        self.assertEqual(
            int(access_cookie["max-age"]),
            int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        )
        self.assertEqual(refresh_cookie["samesite"], access_cookie["samesite"])
        self.assertEqual(refresh_cookie["path"], access_cookie["path"])

    def test_register_requires_csrf(self):
        no_csrf_client = APIClient(enforce_csrf_checks=True)
        blocked = no_csrf_client.post(
            "/api/v1/users/",
            {
                "email": "new@example.com",
                "username": "new-user",
                "password": "correct-password",
            },
            format="json",
        )
        self.assertEqual(blocked.status_code, 403)

        client, csrf_token, _response = csrf_client()
        response = client.post(
            "/api/v1/users/",
            {
                "email": "new@example.com",
                "username": "new-user",
                "password": "correct-password",
            },
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(response.status_code, 201)

    def test_register_applies_django_password_validators(self):
        client, csrf_token, _response = csrf_client()
        response = client.post(
            "/api/v1/users/",
            {
                "email": "weak@example.com",
                "username": "weak-user",
                "password": "123",
            },
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)

    def test_registration_enforces_case_insensitive_email_uniqueness(self):
        client, csrf_token, _response = csrf_client()
        response = client.post(
            "/api/v1/users/",
            {
                "email": "USER@example.com",
                "username": "duplicate-email",
                "password": "another-correct-password",
            },
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_cookie_jwt_auth_rejects_unsafe_request_without_csrf(self):
        refresh = RefreshToken.for_user(self.user)
        client = APIClient(enforce_csrf_checks=True)
        client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = str(refresh.access_token)

        response = client.patch(
            "/api/v1/users/me/",
            {"username": "changed"},
            format="json",
        )

        self.assertIn(response.status_code, (401, 403))
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "user")

    def test_cookie_jwt_auth_allows_unsafe_request_with_csrf(self):
        refresh = RefreshToken.for_user(self.user)
        client, csrf_token, _response = csrf_client()
        client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = str(refresh.access_token)

        response = client.patch(
            "/api/v1/users/me/",
            {"username": "changed"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "changed")

    def test_refresh_requires_csrf_and_returns_401_for_invalid_refresh_token(self):
        client = APIClient(enforce_csrf_checks=True)
        client.cookies[settings.JWT_REFRESH_COOKIE_NAME] = "not-a-token"
        blocked = client.post("/api/v1/auth/token/refresh/", {}, format="json")
        self.assertEqual(blocked.status_code, 403)

        client, csrf_token, _response = csrf_client()
        client.cookies[settings.JWT_REFRESH_COOKIE_NAME] = "not-a-token"
        response = client.post(
            "/api/v1/auth/token/refresh/",
            {},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(response.status_code, 401)

    def test_logout_invalid_refresh_still_clears_session_cookies(self):
        refresh = RefreshToken.for_user(self.user)
        client, csrf_token, _response = csrf_client()
        client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = str(refresh.access_token)
        client.cookies[settings.JWT_REFRESH_COOKIE_NAME] = "not-a-token"

        response = client.post(
            "/api/v1/auth/logout/",
            {},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.cookies[settings.JWT_ACCESS_COOKIE_NAME]["max-age"], 0)
        self.assertEqual(response.cookies[settings.JWT_REFRESH_COOKIE_NAME]["max-age"], 0)
