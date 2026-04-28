# chat/views.py
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message
from .serializers import MessageSerializer, MessageCreateSerializer
from projects.models import Project


class ProjectMessagesView(APIView):
    """
    GET  /api/projects/{id}/messages/      → Get all messages
    POST /api/projects/{id}/messages/send/ → Send a message
    Only project members (client or freelancer) can access
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_project(self, pk, user):
        """
        Helper: get project only if user is client or freelancer
        """
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return None

        # Only client or freelancer of this project can chat
        if project.client != user and project.freelancer != user:
            return None

        return project

    def get(self, request, pk):
        """
        GET /api/projects/{id}/messages/
        Returns all messages for a project
        """
        project = self.get_project(pk, request.user)
        if not project:
            return Response(
                {'error': 'Project not found or access denied.'},
                status=status.HTTP_404_NOT_FOUND
            )

        messages = Message.objects.filter(project=project)
        serializer = MessageSerializer(messages, many=True)

        return Response(
            {
                'project_id': pk,
                'messages': serializer.data
            },
            status=status.HTTP_200_OK
        )


class SendMessageView(APIView):
    """
    POST /api/projects/{id}/messages/send/
    Send a message in a project chat
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Verify project access
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only project members can send messages
        if project.client != request.user and project.freelancer != request.user:
            return Response(
                {'error': 'You are not a member of this project.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Save message with sender and project
            message = Message.objects.create(
                project=project,
                sender=request.user,
                text=serializer.validated_data['text'],
                attachment=serializer.validated_data.get('attachment', None)
            )

            return Response(
                {
                    'message': 'Message sent!',
                    'data': MessageSerializer(message).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)