# chat/models.py
from django.db import models
from users.models import User
from projects.models import Project


class Message(models.Model):
    """
    Chat messages between client and freelancer
    within a specific project.
    """
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )

    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    # Optional file attachment link
    attachment = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ['timestamp']  # oldest first (chat order)

    def __str__(self):
        return f"{self.sender.username} → Project {self.project.id}: {self.text[:40]}"