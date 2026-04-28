# disputes/models.py
from django.db import models
from users.models import User
from projects.models import Project


class Dispute(models.Model):
    """
    Either client or freelancer can raise a dispute.
    Admin reviews and resolves it.
    """
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('under_review', 'Under Review'),
        ('resolved', 'Resolved'),
    )

    RESOLUTION_CHOICES = (
        ('refund_client', 'Refund Client'),
        ('pay_freelancer', 'Pay Freelancer'),
        ('split', 'Split Payment'),
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='disputes'
    )

    # Who raised the dispute (client or freelancer)
    raised_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='raised_disputes'
    )

    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )

    # Admin fills these after review
    resolution = models.CharField(
        max_length=20,
        choices=RESOLUTION_CHOICES,
        blank=True,
        null=True
    )
    admin_notes = models.TextField(blank=True, null=True)

    # Split amount (used when resolution = split)
    client_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )
    freelancer_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Dispute on Project {self.project.id} by {self.raised_by.username} [{self.status}]"