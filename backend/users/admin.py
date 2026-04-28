# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'role', 'balance', 'is_staff']
    list_filter = ['role', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Marketplace Info', {
            'fields': ('role', 'bio', 'skills', 'wallet_address', 'balance', 'avatar')
        }),
    )