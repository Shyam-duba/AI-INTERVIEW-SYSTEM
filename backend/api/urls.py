from django.urls import path
from . import views

urlpatterns = [
    path("interview/", views.InterviewCreate.as_view(),name="interview_create"),
    path("interview/chat/<int:pk>", views.InterviewUpdateHistory.as_view(), name="interview_chat"),
    path("interview/complete/<int:pk>", views.InterviewComplete.as_view(), name="interview_complete"),
    path("interview/start/<int:pk>", views.InterviewStart.as_view(), name="interview_start"),
    path("interview/delete/<int:pk>", views.InterviewDelete.as_view(), name="interview_delete"),
]