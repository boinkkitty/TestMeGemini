from django.urls import path
from .views import ChapterAttemptCreateListAPIView, ChapterAttemptRetrieveAPIView
urlpatterns = [
    path('', ChapterAttemptCreateListAPIView.as_view(), name='chapter_attemps_list_create'),
    path('<int:pk>/', ChapterAttemptRetrieveAPIView.as_view(), name='chapter_attempt_detail'),
]