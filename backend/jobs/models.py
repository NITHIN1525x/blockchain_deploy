# jobs/models.py
from django.db import models
from users.models import User


class Job(models.Model):
    """
    A job posted by a client.
    Freelancers can browse and apply.
    """
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
        ('closed', 'Closed'),
    )

    CATEGORY_CHOICES = (
        ('web_dev', 'Web Development'),
        ('mobile_dev', 'Mobile Development'),
        ('design', 'Design'),
        ('writing', 'Writing'),
        ('marketing', 'Marketing'),
        ('data', 'Data Science'),
        ('other', 'Other'),
    )

    # Who posted this job
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posted_jobs'
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='other'
    )
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    deadline = models.DateField()
    skills_required = models.CharField(max_length=500, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']  # newest first

    def __str__(self):
        return f"{self.title} by {self.client.username}"