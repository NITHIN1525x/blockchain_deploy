# disputes/admin.py
from django.contrib import admin
from .models import Dispute

@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = [
        'project', 'raised_by', 'status',
        'resolution', 'created_at', 'resolved_at'
    ]
    list_filter = ['status', 'resolution']
    search_fields = ['project__job__title', 'raised_by__username']
    readonly_fields = ['created_at', 'resolved_at']