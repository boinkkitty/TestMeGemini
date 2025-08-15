from django.urls import path
from .views import UserChaptersAPIView, CreateChapterWithQuestionsView

urlpatterns = [
    path('create-with-questions/', CreateChapterWithQuestionsView.as_view(), name='create_chapter_with_questions'),
    path('my-chapters/', UserChaptersAPIView.as_view(), name='user_chapters'),
]