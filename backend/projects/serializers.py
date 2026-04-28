# projects/serializers.py
from rest_framework import serializers
from .models import Project, Submission
from users.serializers import UserSerializer
from jobs.serializers import JobSerializer


class SubmissionSerializer(serializers.ModelSerializer):
    """Serializer for work submissions"""
    class Meta:
        model = Submission
        fields = [
            'id', 'project', 'github_link',
            'website_url', 'file_link',
            'notes', 'submitted_at'
        ]
        read_only_fields = ['project', 'submitted_at']


class ProjectSerializer(serializers.ModelSerializer):
    """Full project details with nested info"""
    client_details = UserSerializer(source='client', read_only=True)
    freelancer_details = UserSerializer(source='freelancer', read_only=True)
    job_details = JobSerializer(source='job', read_only=True)
    latest_submission = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'job', 'job_details',
            'client', 'client_details',
            'freelancer', 'freelancer_details',
            'escrow_amount', 'payment_status',
            'work_status', 'revision_notes',
            'onchain_project_id',
            'contract_address',
            'last_tx_hash',
            'latest_submission',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'client', 'freelancer', 'escrow_amount',
            'payment_status', 'work_status', 'created_at',
            'onchain_project_id', 'contract_address', 'last_tx_hash'
        ]

    def get_latest_submission(self, obj):
        # Get the most recent submission
        submission = obj.submissions.first()
        if submission:
            return SubmissionSerializer(submission).data
        return None