from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Interview(models.Model):
    STATUS_CHOICES = [
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    interview_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=255)
    started_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    history = models.JSONField(default=dict)  # Store interview history as a JSON object

    def __str__(self):
        return f"{self.role} - {self.user.username} ({self.status})"

class Report(models.Model):
    interview = models.OneToOneField('Interview', on_delete=models.CASCADE, related_name='report')
    score = models.FloatField()
    interview_report = models.JSONField(default=dict)  # Store structured interview feedback as JSON

    def __str__(self):
        return f"Report for Interview {self.interview.id} - Score: {self.score}"