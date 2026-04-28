# jobs/serializers.py
from rest_framework import serializers
from .models import Job
from users.serializers import UserSerializer


class JobSerializer(serializers.ModelSerializer):
    """Full job details with client info"""
    # Show client details nested
    client_details = UserSerializer(source='client', read_only=True)
    # Show how many proposals this job has
    proposal_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'category',
            'budget', 'deadline', 'skills_required',
            'status', 'client', 'client_details',
            'proposal_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['client', 'status', 'created_at', 'updated_at']

    def get_proposal_count(self, obj):
        return obj.proposals.count()


class JobCreateSerializer(serializers.ModelSerializer):
    """Used when creating a new job"""
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'category',
            'budget', 'deadline', 'skills_required'
        ]

    def create(self, validated_data):
        # Automatically set client to logged-in user
        request = self.context['request']
        job = Job.objects.create(
            client=request.user,
            **validated_data
        )
        return job