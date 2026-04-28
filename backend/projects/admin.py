# projects/admin.py
from django.contrib import admin
from .models import Project, Submission

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        'job', 'client', 'freelancer',
        'escrow_amount', 'payment_status', 'work_status'
    ]
    list_filter = ['payment_status', 'work_status']
    search_fields = ['job__title', 'client__username', 'freelancer__username']

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['project', 'submitted_at', 'github_link', 'website_url']