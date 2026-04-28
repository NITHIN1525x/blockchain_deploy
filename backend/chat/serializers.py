# chat/serializers.py
from rest_framework import serializers
from .models import Message
from users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    sender_details = UserSerializer(source='sender', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'project', 'sender',
            'sender_details', 'text',
            'attachment', 'timestamp'
        ]
        read_only_fields = [
            'sender', 'project',
            'timestamp', 'sender_details'
        ]


class MessageCreateSerializer(serializers.ModelSerializer):
    """Used when sending a new message"""
    class Meta:
        model = Message
        fields = ['text', 'attachment']