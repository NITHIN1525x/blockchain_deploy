# projects/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Project, Submission
from .serializers import ProjectSerializer, SubmissionSerializer


class IsClient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'client'


class IsFreelancer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'freelancer'


class ProjectListView(generics.ListAPIView):
    """
    GET /api/projects/
    Returns projects for the logged-in user (client or freelancer)
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return Project.objects.filter(client=user)
        elif user.role == 'freelancer':
            return Project.objects.filter(freelancer=user)
        return Project.objects.none()


class ProjectDetailView(generics.RetrieveAPIView):
    """
    GET /api/projects/{id}/
    View single project details
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return Project.objects.filter(client=user)
        return Project.objects.filter(freelancer=user)


class LockPaymentView(APIView):
    """
    POST /api/projects/{id}/lock-payment/
    Client deposits money into escrow (simulated).
    payment_status: pending → locked
    """
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, client=request.user)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if project.payment_status != 'pending':
            return Response(
                {'error': f'Payment is already {project.payment_status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Simulate escrow lock
        project.payment_status = 'locked'
        project.save()

        return Response(
            {
                'message': f'${project.escrow_amount} locked in escrow successfully!',
                'project': ProjectSerializer(project).data
            },
            status=status.HTTP_200_OK
        )


class SubmitWorkView(APIView):
    """
    POST /api/projects/{id}/submit-work/
    Freelancer submits their work.
    work_status → submitted
    """
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, freelancer=request.user)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Must be locked before submitting
        if project.payment_status not in ['locked']:
            return Response(
                {'error': 'Client has not locked payment yet.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if project.work_status not in ['in_progress', 'revision_requested']:
            return Response(
                {'error': 'Work cannot be submitted at this stage.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create submission record
        serializer = SubmissionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)

            # Update project work status
            project.work_status = 'submitted'
            project.save()

            return Response(
                {
                    'message': 'Work submitted successfully!',
                    'submission': serializer.data,
                    'project': ProjectSerializer(project).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RequestRevisionView(APIView):
    """
    POST /api/projects/{id}/request-revision/
    Client requests changes.
    work_status → revision_requested
    """
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, client=request.user)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if project.work_status != 'submitted':
            return Response(
                {'error': 'No submission to review yet.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save revision notes from client
        notes = request.data.get('notes', '')
        if not notes:
            return Response(
                {'error': 'Please provide revision notes.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        project.work_status = 'revision_requested'
        project.revision_notes = notes
        project.save()

        return Response(
            {
                'message': 'Revision requested. Freelancer will be notified.',
                'project': ProjectSerializer(project).data
            },
            status=status.HTTP_200_OK
        )


class ApproveWorkView(APIView):
    """
    POST /api/projects/{id}/approve/
    Client approves work.
    payment_status → released
    work_status → approved
    Freelancer balance gets credited!
    """
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, client=request.user)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if project.work_status != 'submitted':
            return Response(
                {'error': 'No submitted work to approve.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if project.payment_status != 'locked':
            return Response(
                {'error': 'Payment must be locked before approving.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Release payment to freelancer
        project.payment_status = 'released'
        project.work_status = 'approved'
        project.save()

        # ✅ Credit freelancer's balance
        freelancer = project.freelancer
        freelancer.balance += project.escrow_amount
        freelancer.save()

        # ✅ Mark job as completed
        project.job.status = 'completed'
        project.job.save()

        return Response(
            {
                'message': f'Work approved! ${project.escrow_amount} released to {freelancer.username}.',
                'project': ProjectSerializer(project).data
            },
            status=status.HTTP_200_OK
        )