from django.urls import path, include
from .views import ChapterListCreateAPIView

urlpatterns = [
    path('', ChapterListCreateAPIView.as_view(), name='chapters_list_create'),
    path('<int:chapter_id>/', include('questions.urls')),
]