# proposals/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Proposal
from .serializers import ProposalSerializer, ProposalCreateSerializer
from jobs.models import Job


class IsFreelancer(permissions.BasePermission):
    """Only freelancers can apply to jobs"""
    def has_permission(self, request, view):
        return request.user.role == 'freelancer'


class IsClient(permissions.BasePermission):
    """Only clients can accept/reject proposals"""
    def has_permission(self, request, view):
        return request.user.role == 'client'


class ApplyToJobView(APIView):
    """
    POST /api/jobs/{id}/apply/
    Freelancer applies to a job
    """
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]

    def post(self, request, pk):
        # Get the job
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only open jobs can receive proposals
        if job.status != 'open':
            return Response(
                {'error': 'This job is no longer accepting proposals.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ProposalCreateSerializer(
            data=request.data,
            context={'request': request, 'job': job}
        )

        if serializer.is_valid():
            proposal = serializer.save()
            return Response(
                {
                    'message': 'Proposal submitted successfully!',
                    'proposal': ProposalSerializer(proposal).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobProposalsView(generics.ListAPIView):
    """
    GET /api/jobs/{id}/proposals/
    Client views all proposals for their job
    """
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def get_queryset(self):
        job_id = self.kwargs['pk']
        return Proposal.objects.filter(
            job_id=job_id,
            job__client=self.request.user  # only job owner can see
        )


class AcceptProposalView(APIView):
    """
    POST /api/proposals/{id}/accept/
    Client accepts a proposal → creates a project automatically
    """
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def post(self, request, pk):
        try:
            proposal = Proposal.objects.get(pk=pk)
        except Proposal.DoesNotExist:
            return Response(
                {'error': 'Proposal not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only job owner can accept
        if proposal.job.client != request.user:
            return Response(
                {'error': 'You are not authorized to accept this proposal.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if proposal.status != 'pending':
            return Response(
                {'error': 'This proposal has already been reviewed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Accept this proposal
        proposal.status = 'accepted'
        proposal.save()

        # Reject all other proposals for the same job
        Proposal.objects.filter(
            job=proposal.job
        ).exclude(pk=pk).update(status='rejected')

        # Mark job as assigned
        proposal.job.status = 'assigned'
        proposal.job.save()

        # Auto-create a Project
        from projects.models import Project
        project = Project.objects.create(
            job=proposal.job,
            client=request.user,
            freelancer=proposal.freelancer,
            escrow_amount=proposal.bid_amount,
        )

        return Response(
            {
                'message': 'Proposal accepted! Project created.',
                'proposal': ProposalSerializer(proposal).data,
                'project_id': project.id
            },
            status=status.HTTP_200_OK
        )


class RejectProposalView(APIView):
    """
    POST /api/proposals/{id}/reject/
    Client rejects a proposal
    """
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def post(self, request, pk):
        try:
            proposal = Proposal.objects.get(pk=pk)
        except Proposal.DoesNotExist:
            return Response(
                {'error': 'Proposal not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if proposal.job.client != request.user:
            return Response(
                {'error': 'Not authorized.'},
                status=status.HTTP_403_FORBIDDEN
            )

        proposal.status = 'rejected'
        proposal.save()

        return Response(
            {'message': 'Proposal rejected.'},
            status=status.HTTP_200_OK
        )


class MyProposalsView(generics.ListAPIView):
    """
    GET /api/proposals/my-proposals/
    Freelancer sees all their submitted proposals
    """
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]

    def get_queryset(self):
        return Proposal.objects.filter(freelancer=self.request.user)