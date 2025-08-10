from django.urls import path
from .views import UserChaptersAPIView, ChapterWithQuestionsCreateView

urlpatterns = [
    # path('create-with-questions/', ChapterWithQuestionsCreateView.as_view(), name='chapter-create-with-questions'),
    path('my-chapters/', UserChaptersAPIView.as_view(), name='user-chapters'),
]