from django.urls import path
from .views import UserChaptersAPIView, CreateChapterWithQuestionsView

urlpatterns = [
    path('create-with-questions/', CreateChapterWithQuestionsView.as_view(), name='create-chapter-with-questions'),
    path('my-chapters/', UserChaptersAPIView.as_view(), name='user-chapters'),
]