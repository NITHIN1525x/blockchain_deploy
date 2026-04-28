# projects/models.py
from django.db import models
from users.models import User
from jobs.models import Job


class Project(models.Model):
    """
    Created automatically when client accepts a proposal.
    Handles the full escrow + work flow.
    """
    PAYMENT_STATUS = (
        ('pending', 'Pending'),        # proposal accepted, not paid yet
        ('locked', 'Locked'),          # client deposited into escrow
        ('on_hold', 'On Hold'),        # dispute raised
        ('released', 'Released'),      # client approved, paid to freelancer
        ('refunded', 'Refunded'),      # admin refunded to client
    )

    WORK_STATUS = (
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('revision_requested', 'Revision Requested'),
        ('approved', 'Approved'),
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='client_projects'
    )
    freelancer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='freelancer_projects'
    )

    escrow_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='pending'
    )
    work_status = models.CharField(
        max_length=30,
        choices=WORK_STATUS,
        default='in_progress'
    )

    revision_notes = models.TextField(blank=True, null=True)
    # Optional blockchain tracking fields
    onchain_project_id = models.PositiveBigIntegerField(blank=True, null=True)
    contract_address = models.CharField(max_length=120, blank=True, null=True)
    last_tx_hash = models.CharField(max_length=120, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Project: {self.job.title} | {self.client.username} ↔ {self.freelancer.username}"


class Submission(models.Model):
    """
    Freelancer submits work — github link, file, notes etc.
    Can be resubmitted after revision requests.
    """
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='submissions'
    )

    github_link = models.URLField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    file_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Submission for {self.project.job.title} at {self.submitted_at}"