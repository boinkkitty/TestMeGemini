from django.urls import path
from .views import ChapterAttemptCreateListAPIView

urlpatterns = [
    path('attempts/', ChapterAttemptCreateListAPIView.as_view(), name='chapter-attempts-list-create'),
]