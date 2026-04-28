# jobs/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Job
from .serializers import JobSerializer, JobCreateSerializer


class IsClient(permissions.BasePermission):
    """Only clients can post/delete jobs"""
    def has_permission(self, request, view):
        return request.user.role == 'client'


class JobListView(generics.ListAPIView):
    """
    GET /api/jobs/
    List all open jobs — anyone logged in can see
    """
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Job.objects.filter(status='open')

        # Optional filters via query params
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)

        if search:
            queryset = queryset.filter(
                title__icontains=search
            ) | queryset.filter(
                description__icontains=search
            )

        return queryset


class JobCreateView(generics.CreateAPIView):
    """
    POST /api/jobs/create/
    Only clients can post jobs
    """
    serializer_class = JobCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def get_serializer_context(self):
        return {'request': self.request}


class JobDetailView(generics.RetrieveAPIView):
    """
    GET /api/jobs/{id}/
    View a single job detail
    """
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Job.objects.all()


class JobDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/jobs/{id}/delete/
    Only the client who posted it can delete
    """
    permission_classes = [permissions.IsAuthenticated, IsClient]
    queryset = Job.objects.all()

    def destroy(self, request, *args, **kwargs):
        job = self.get_object()

        # Make sure only the owner can delete
        if job.client != request.user:
            return Response(
                {'error': 'You can only delete your own jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )

        job.delete()
        return Response(
            {'message': 'Job deleted successfully.'},
            status=status.HTTP_200_OK
        )


class MyPostedJobsView(generics.ListAPIView):
    """
    GET /api/jobs/my-jobs/
    Client sees only their own posted jobs
    """
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def get_queryset(self):
        return Job.objects.filter(client=self.request.user)