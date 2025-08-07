from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Chapter
from .serializers import ChapterSerializer

class ChapterWithQuestionsCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Create a chapter with associated questions
    def post(self, request):
        data = request.data.get('chapter', {})
        questions = request.data.get('questions', [])
        data['questions'] = questions
        serializer = ChapterSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            chapter = serializer.save()
            return Response(ChapterSerializer(chapter).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserChaptersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chapters = Chapter.objects.filter(user=request.user)
        serializer = ChapterSerializer(chapters, many=True)
        return Response(serializer.data)