# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with role-based access.
    Roles: client or freelancer
    """
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    bio = models.TextField(blank=True, null=True)
    skills = models.CharField(max_length=500, blank=True, null=True)
    wallet_address = models.CharField(max_length=200, blank=True, null=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    # Use email as username
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"