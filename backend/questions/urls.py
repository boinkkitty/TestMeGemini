from django.urls import path
from .views import ChapterQuestionsAPIView

urlpatterns = [
    path('chapter/<int:chapter_id>/questions/', ChapterQuestionsAPIView.as_view(), name='chapter_questions'),
]
