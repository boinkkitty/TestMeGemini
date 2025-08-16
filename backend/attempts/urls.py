from django.urls import path
from .views import ChapterAttemptCreateListAPIView, ChapterAttemptRetrieveAPIView

urlpatterns = [
    path('attempts/', ChapterAttemptCreateListAPIView.as_view(), name='chapter_attemps_list_create'),
    path('attempts/<int:pk>/', ChapterAttemptRetrieveAPIView.as_view(), name='chapter_attempt_detail'),
]