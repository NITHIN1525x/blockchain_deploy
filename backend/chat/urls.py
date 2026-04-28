# chat/urls.py
from django.urls import path
from .views import ProjectMessagesView, SendMessageView

urlpatterns = [
    # Get all messages for a project
    path(
        'projects/<int:pk>/messages/',
        ProjectMessagesView.as_view(),
        name='project-messages'
    ),

    # Send a message in a project
    path(
        'projects/<int:pk>/messages/send/',
        SendMessageView.as_view(),
        name='send-message'
    ),
]