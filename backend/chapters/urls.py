from django.urls import path, include
from .views import ChapterListCreateAPIView, ChapterRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('', ChapterListCreateAPIView.as_view(), name='chapters_list_create'),
    path('<int:id>/', ChapterRetrieveUpdateDestroyAPIView.as_view(), name='chapter_rud'),
    path('<int:id>/questions/', include('questions.urls')),
]