from datetime import timedelta, date
from api.utils.score import get_score
from attempts.serializers import ChapterAttemptSerializer, QuestionAttemptSerializer
from questions.models import Question
from rest_framework import permissions, status
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from .models import ChapterAttempt
from .serializers import ChapterAttemptDetailSerializer, ChapterAttemptSerializer, QuestionAttemptSerializer

class ChapterAttemptCreateListAPIView(ListCreateAPIView):
    serializer_class = ChapterAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ChapterAttempt.objects.filter(user=self.request.user).order_by('-completed_at')
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                limit = int(limit)
                if limit > 0:
                    return qs[:limit]
            except (ValueError, TypeError):
                pass
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chapter_attempt = serializer.save(user=request.user)
        total_score = 0
        questions_data = request.data.get('questions', [])
        question_ids = [q['question_id'] for q in questions_data]
        questions = Question.objects.filter(id__in=question_ids).prefetch_related('choices')
        question_map = {q.id: q for q in questions}
        for q_data in questions_data:
            qid = q_data['question_id']
            selected_choice_ids = q_data['selected_choices']
            question = question_map.get(qid)
            if not question:
                continue
            correct_choices = set(question.choices.filter(is_correct=True).values_list('id', flat=True))
            score = get_score(question, set(selected_choice_ids), correct_choices)
            qa_data = {
                'chapter_attempt': chapter_attempt.id,
                'question': qid,
                'selected_choices': selected_choice_ids,
                'score': score
            }
            qa_serializer = QuestionAttemptSerializer(data=qa_data)
            qa_serializer.is_valid(raise_exception=True)
            qa_serializer.save()
            total_score += score
        chapter_attempt.score = total_score
        chapter_attempt.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ChapterAttemptRetrieveAPIView(RetrieveAPIView):
    serializer_class = ChapterAttemptDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ChapterAttempt.objects.all()

    def get_queryset(self):
        return ChapterAttempt.objects.filter(user=self.request.user)

# User activity for last N days
class ActivityLastDaysView(RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        days = int(request.GET.get('days', 7))
        today = date.today()
        activity = []
        for i in range(days):
            day = today - timedelta(days=days - i - 1)
            attempted = ChapterAttempt.objects.filter(user=request.user, completed_at__date=day).exists()
            activity.append({"date": str(day), "attempted": attempted})
        return Response(activity)

# Weekly stats
class WeeklyStatsView(RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        today = date.today()
        week_ago = today - timedelta(days=6)
        attempts = ChapterAttempt.objects.filter(user=request.user, completed_at__date__gte=week_ago)
        scores = [a.score for a in attempts if a.score is not None]
        average_score = sum(scores) / len(scores) if scores else 0
        highest_score = max(scores) if scores else 0
        attempt_count = attempts.count()
        return Response({
            "average_score": average_score,
            "highest_score": highest_score,
            "attempt_count": attempt_count,
        })