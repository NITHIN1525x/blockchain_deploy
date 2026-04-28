# disputes/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Dispute
from .serializers import (
    DisputeSerializer,
    DisputeCreateSerializer,
    DisputeResolveSerializer
)
from projects.models import Project


class RaiseDisputeView(APIView):
    """
    POST /api/projects/{id}/raise-dispute/
    Client OR Freelancer can raise a dispute.
    Payment immediately goes ON HOLD.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Get the project
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only client or freelancer of this project can raise
        if project.client != request.user and project.freelancer != request.user:
            return Response(
                {'error': 'You are not a member of this project.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if dispute already exists
        if Dispute.objects.filter(
            project=project,
            status__in=['open', 'under_review']
        ).exists():
            return Response(
                {'error': 'A dispute is already open for this project.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Payment must be locked to raise dispute
        if project.payment_status not in ['locked', 'on_hold']:
            return Response(
                {'error': 'No locked payment found to dispute.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DisputeCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Create dispute
            dispute = Dispute.objects.create(
                project=project,
                raised_by=request.user,
                reason=serializer.validated_data['reason']
            )

            # ✅ Put payment ON HOLD immediately
            project.payment_status = 'on_hold'
            project.save()

            return Response(
                {
                    'message': 'Dispute raised. Payment is now on hold. Admin will review shortly.',
                    'dispute': DisputeSerializer(dispute).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DisputeListView(generics.ListAPIView):
    """
    GET /api/disputes/
    Admin sees all disputes.
    Users see only their own disputes.
    """
    serializer_class = DisputeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin sees everything
        if user.is_staff:
            return Dispute.objects.all()

        # Users see only their project disputes
        if user.role == 'client':
            return Dispute.objects.filter(project__client=user)
        else:
            return Dispute.objects.filter(project__freelancer=user)


class DisputeDetailView(generics.RetrieveAPIView):
    """
    GET /api/disputes/{id}/
    View single dispute details
    """
    serializer_class = DisputeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Dispute.objects.all()
        return Dispute.objects.filter(
            project__client=user
        ) | Dispute.objects.filter(
            project__freelancer=user
        )


class ResolveDisputeView(APIView):
    """
    POST /api/disputes/{id}/resolve/
    ADMIN ONLY.
    Admin can:
      - refund_client   → all money back to client
      - pay_freelancer  → all money to freelancer
      - split           → split between both
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            dispute = Dispute.objects.get(pk=pk)
        except Dispute.DoesNotExist:
            return Response(
                {'error': 'Dispute not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if dispute.status == 'resolved':
            return Response(
                {'error': 'This dispute is already resolved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DisputeResolveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        resolution = serializer.validated_data.get('resolution')
        project = dispute.project
        total = project.escrow_amount

        # ── RESOLUTION: Refund Client ──────────────────────────
        if resolution == 'refund_client':
            # Money goes back to client balance
            project.client.balance += total
            project.client.save()

            project.payment_status = 'refunded'
            project.save()

        # ── RESOLUTION: Pay Freelancer ─────────────────────────
        elif resolution == 'pay_freelancer':
            # Full amount goes to freelancer
            project.freelancer.balance += total
            project.freelancer.save()

            project.payment_status = 'released'
            project.work_status = 'approved'
            project.save()

            # Mark job complete
            project.job.status = 'completed'
            project.job.save()

        # ── RESOLUTION: Split Payment ──────────────────────────
        elif resolution == 'split':
            client_amt = serializer.validated_data.get('client_amount', 0)
            freelancer_amt = serializer.validated_data.get('freelancer_amount', 0)

            # Validate split amounts
            if not client_amt or not freelancer_amt:
                return Response(
                    {'error': 'Provide both client_amount and freelancer_amount for split.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if float(client_amt) + float(freelancer_amt) != float(total):
                return Response(
                    {'error': f'Split amounts must add up to ${total}.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Credit both parties
            project.client.balance += client_amt
            project.client.save()

            project.freelancer.balance += freelancer_amt
            project.freelancer.save()

            project.payment_status = 'released'
            project.save()

        else:
            return Response(
                {'error': 'Invalid resolution type.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Mark dispute as resolved ───────────────────────────
        dispute.status = 'resolved'
        dispute.resolution = resolution
        dispute.admin_notes = serializer.validated_data.get('admin_notes', '')
        dispute.client_amount = serializer.validated_data.get('client_amount')
        dispute.freelancer_amount = serializer.validated_data.get('freelancer_amount')
        dispute.resolved_at = timezone.now()
        dispute.save()

        return Response(
            {
                'message': f'Dispute resolved! Resolution: {resolution}',
                'dispute': DisputeSerializer(dispute).data
            },
            status=status.HTTP_200_OK
        )


class MarkUnderReviewView(APIView):
    """
    POST /api/disputes/{id}/under-review/
    Admin marks dispute as under review
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            dispute = Dispute.objects.get(pk=pk)
        except Dispute.DoesNotExist:
            return Response(
                {'error': 'Dispute not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        dispute.status = 'under_review'
        dispute.save()

        return Response(
            {
                'message': 'Dispute marked as under review.',
                'dispute': DisputeSerializer(dispute).data
            },
            status=status.HTTP_200_OK
        )