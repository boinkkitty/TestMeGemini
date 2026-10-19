"""Canonical URL configuration used exclusively for generated OpenAPI schema."""

from django.urls import include, path

from chapters.urls import chapter_urlpatterns, generation_urlpatterns
from users.urls import auth_urlpatterns, user_urlpatterns


urlpatterns = [
    path('api/v1/users/', include((user_urlpatterns, 'users'), namespace='schema-v1-users')),
    path('api/v1/auth/', include((auth_urlpatterns, 'auth'), namespace='schema-v1-auth')),
    path('api/v1/chapters/', include((chapter_urlpatterns, 'chapters'), namespace='schema-v1-chapters')),
    path(
        'api/v1/chapter-generations/',
        include(
            (generation_urlpatterns, 'chapter-generations'),
            namespace='schema-v1-chapter-generations',
        ),
    ),
    path('api/v1/attempts/', include(('attempts.urls', 'attempts'), namespace='schema-v1-attempts')),
]
