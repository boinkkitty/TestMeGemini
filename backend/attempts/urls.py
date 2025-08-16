from django.urls import path
from .views import ChapterAttemptCreateListAPIView, ChapterAttemptRetrieveAPIView

urlpatterns = [
    path('attempts/', ChapterAttemptCreateListAPIView.as_view(), name='chapter-attempts-list-create'),
    path('attempts/<int:pk>/', ChapterAttemptRetrieveAPIView.as_view(), name='chapter-attempt-detail'),
]