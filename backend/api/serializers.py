from django.contrib.auth.models import User # type: ignore
from rest_framework import serializers
from .models import Interview, Report


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    

class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = ["interview_id", "user", "started_at", "role", "status", "history"]

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        feilds = ["interview", "score", "interview_report"]