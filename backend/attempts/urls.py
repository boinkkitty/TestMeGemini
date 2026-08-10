"""
URL routing for the attempts app.
Defines endpoints for creating/listing chapter attempts and retrieving attempt details.
"""

from django.urls import path
from .views import ChapterAttemptCreateListAPIView, ChapterAttemptRetrieveAPIView

urlpatterns = [
    path('', ChapterAttemptCreateListAPIView.as_view(), name='chapter_attempts_list_create'),
    path('<int:pk>/', ChapterAttemptRetrieveAPIView.as_view(), name='chapter_attempt_detail'),
]
