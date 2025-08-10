from django.urls import path
from .views import QuestionCreateAPIView, UserChapterQuestionsAPIView, UserChapterLimitedQuestionsAPIView

urlpatterns = [
    # path('create-bulk/', QuestionCreateAPIView.as_view(), name='create-bulk-questions'),
    path('by-chapter/', UserChapterQuestionsAPIView.as_view(), name='user-chapter-questions'),
    path('by-chapter-limited/', UserChapterLimitedQuestionsAPIView.as_view(), name='user-chapter-limited-questions'),
]
