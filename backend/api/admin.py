from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import Interview, Report

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ('interview_id', 'user', 'role', 'started_at', 'status')
    list_filter = ('status', 'started_at')
    search_fields = ('user__username', 'role')
    ordering = ('-started_at',)
    readonly_fields = ('started_at',)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('interview', 'score')
    search_fields = ('interview__user__username',)
    readonly_fields = ('interview',)

