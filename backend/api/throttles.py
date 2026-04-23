from rest_framework.throttling import UserRateThrottle


class ChapterCreateThrottle(UserRateThrottle):
    scope = 'chapter_create'
