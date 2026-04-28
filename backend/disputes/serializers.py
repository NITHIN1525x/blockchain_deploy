# disputes/serializers.py
from rest_framework import serializers
from .models import Dispute
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer


class DisputeSerializer(serializers.ModelSerializer):
    """Full dispute details"""
    raised_by_details = UserSerializer(source='raised_by', read_only=True)
    project_details = ProjectSerializer(source='project', read_only=True)

    class Meta:
        model = Dispute
        fields = [
            'id', 'project', 'project_details',
            'raised_by', 'raised_by_details',
            'reason', 'status',
            'resolution', 'admin_notes',
            'client_amount', 'freelancer_amount',
            'created_at', 'resolved_at'
        ]
        read_only_fields = [
            'raised_by', 'status', 'resolution',
            'admin_notes', 'client_amount',
            'freelancer_amount', 'created_at', 'resolved_at'
        ]


class DisputeCreateSerializer(serializers.ModelSerializer):
    """Used when raising a new dispute"""
    class Meta:
        model = Dispute
        fields = ['reason']


class DisputeResolveSerializer(serializers.ModelSerializer):
    """Used by admin to resolve dispute"""
    class Meta:
        model = Dispute
        fields = [
            'resolution', 'admin_notes',
            'client_amount', 'freelancer_amount'
        ]