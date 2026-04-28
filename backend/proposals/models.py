# proposals/models.py
from django.db import models
from users.models import User
from jobs.models import Job


class Proposal(models.Model):
    """
    A freelancer applies to a job with a proposal.
    Contains bid amount, delivery time, and a message.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='proposals'
    )
    freelancer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='my_proposals'
    )

    message = models.TextField()
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_days = models.PositiveIntegerField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        # One freelancer can only apply once per job
        unique_together = ['job', 'freelancer']

    def __str__(self):
        return f"{self.freelancer.username} → {self.job.title} ({self.status})"