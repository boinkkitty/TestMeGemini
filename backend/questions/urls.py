from django.urls import path
from .views import QuestionCreateAPIView, UserChapterQuestionsAPIView

urlpatterns = [
    path('create-bulk/', QuestionCreateAPIView.as_view(), name='create-bulk-questions'),
    path('by-chapter/', UserChapterQuestionsAPIView.as_view(), name='user-chapter-questions'),
]
