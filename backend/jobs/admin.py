# jobs/admin.py
from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'budget', 'status', 'category', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['title', 'description']