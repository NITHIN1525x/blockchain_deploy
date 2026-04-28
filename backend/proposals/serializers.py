# proposals/serializers.py
from rest_framework import serializers
from .models import Proposal
from users.serializers import UserSerializer
from jobs.serializers import JobSerializer


class ProposalSerializer(serializers.ModelSerializer):
    """Full proposal details"""
    freelancer_details = UserSerializer(source='freelancer', read_only=True)
    job_details = JobSerializer(source='job', read_only=True)

    class Meta:
        model = Proposal
        fields = [
            'id', 'job', 'job_details',
            'freelancer', 'freelancer_details',
            'message', 'bid_amount', 'delivery_days',
            'status', 'created_at'
        ]
        read_only_fields = [
            'freelancer', 'status', 'created_at',
            'freelancer_details', 'job_details'
        ]


class ProposalCreateSerializer(serializers.ModelSerializer):
    """Used when freelancer submits a proposal"""
    class Meta:
        model = Proposal
        fields = ['id', 'message', 'bid_amount', 'delivery_days']

    def create(self, validated_data):
        request = self.context['request']
        job = self.context['job']

        # Check if freelancer already applied
        if Proposal.objects.filter(job=job, freelancer=request.user).exists():
            raise serializers.ValidationError(
                'You have already applied to this job.'
            )

        proposal = Proposal.objects.create(
            job=job,
            freelancer=request.user,
            **validated_data
        )
        return proposal