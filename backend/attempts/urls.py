from django.urls import path
from .views import ChapterAttemptCreateListAPIView, ChapterAttemptRetrieveAPIView, WeeklyStatsView, ActivityLastDaysView

urlpatterns = [
    path('', ChapterAttemptCreateListAPIView.as_view(), name='chapter_attemps_list_create'),
    path('activity/', ActivityLastDaysView.as_view(), name='activity-last-days'),
    path('weekly-stats/', WeeklyStatsView.as_view(), name='weekly-stats'),
    path('<int:pk>/', ChapterAttemptRetrieveAPIView.as_view(), name='chapter_attempt_detail'),
]