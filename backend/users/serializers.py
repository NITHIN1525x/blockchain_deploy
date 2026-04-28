# users/serializers.py
from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'bio', 'skills', 'wallet_address']

    def create(self, validated_data):
        # Create user with hashed password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'client'),
            bio=validated_data.get('bio', ''),
            skills=validated_data.get('skills', ''),
            wallet_address=validated_data.get('wallet_address', ''),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for viewing and updating profile"""
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role',
            'bio', 'skills', 'wallet_address',
            'balance', 'avatar', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'role', 'balance', 'date_joined']