from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserSerializer, InterviewSerializer, ReportSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Interview, Report
from .chat import Chat
import json
# Create your views here.

class InterviewCreate(generics.ListCreateAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Interview.objects.filter(user=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)
        else:
            print(serializer.errors)

class InterviewDelete(generics.DestroyAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Interview.objects.filter(user=user)

class InterviewStart(generics.RetrieveAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Interview.objects.filter(user=user)
    
    def retrieve(self, request, *args, **kwargs):
        interview = get_object_or_404(Interview, interview_id=kwargs['pk'], user=request.user)
        
        # Update status if it's still scheduled
        if interview.status == "scheduled":
            interview.status = "ongoing"
            interview.save()
        
        return Response({"message": "Interview started", "history": interview.history, "id":kwargs['pk']}, status=status.HTTP_200_OK)

class InterviewComplete(generics.UpdateAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        interview = get_object_or_404(Interview, interview_id=kwargs['pk'], user=request.user)
        history = request.data.get("history", [])
        
        if not history:
            return Response({"error": "No conversation history provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        interview.history = history
        interview.status = "completed"
        interview.save()
        
        return Response({"message": "Interview completed and saved", "history": interview.history}, status=status.HTTP_200_OK)
    
class InterviewUpdateHistory(generics.UpdateAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        interview = get_object_or_404(Interview, interview_id=kwargs['pk'], user=request.user)
        print(kwargs['pk'])
        print(request.user.username)
        if  interview:
            # user_message = request.data.get("user_message", "")
            history = request.data.get("history",[])

            
            chat_llm = Chat()

            if isinstance(history, str):
                try:
                    history = json.loads(history)  # Convert string to Python list
                except json.JSONDecodeError:
                    return Response({"error": "Invalid JSON format for history"}, status=status.HTTP_400_BAD_REQUEST)


            if not history :
                return Response({"error": "User is required"}, status=status.HTTP_400_BAD_REQUEST)
        
            # history.append({"role": "user", "contenst": user_message})

            response = chat_llm.get_response(history, interview.role)

            history.append({"role":"assistant", "content":response})

            print(history)
            return Response({"message": "Messages added to history", "history": history}, status=status.HTTP_200_OK)
        return Response({"error":"Invalid interview_id"}, status=status.HTTP_400_BAD_REQUEST)
    
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
