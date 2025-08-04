from django.urls import path
from .views import QuestionCreateAPIView

urlpatterns = [
    path('create-bulk/', QuestionCreateAPIView.as_view(), name='create_bulk_questions'),
]
