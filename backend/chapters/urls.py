"""
URL routing for the chapters app.
Defines endpoints for listing, creating, retrieving, and managing chapters and their questions.
"""

from django.urls import path, include
from .views import ChapterGenerationAPIView, ChapterListCreateAPIView, ChapterRetrieveUpdateDestroyAPIView

chapter_urlpatterns = [
    path('', ChapterListCreateAPIView.as_view(), name='chapters_list_create'),
    path('<int:id>/', ChapterRetrieveUpdateDestroyAPIView.as_view(), name='chapter_rud'),
    path('<int:id>/questions/', include('questions.urls')),
]

generation_urlpatterns = [
    path('', ChapterGenerationAPIView.as_view(), name='chapter_generation_create'),
]

urlpatterns = chapter_urlpatterns
