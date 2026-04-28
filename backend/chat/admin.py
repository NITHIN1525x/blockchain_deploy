# chat/admin.py
from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'project', 'text', 'timestamp']
    list_filter = ['project']
    search_fields = ['sender__username', 'text']
    ordering = ['timestamp']