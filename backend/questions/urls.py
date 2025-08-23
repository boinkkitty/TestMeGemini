from django.urls import path
from .views import ChapterQuestionsAPIView

urlpatterns = [
    path('questions/', ChapterQuestionsAPIView.as_view(), name='chapter_questions'),
]
