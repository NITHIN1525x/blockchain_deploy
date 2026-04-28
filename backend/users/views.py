# users/views.py
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(APIView):
    """
    POST /api/register/
    Register a new client or freelancer
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate JWT tokens on registration
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Account created successfully!',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/login/
    Login with email + password, get JWT tokens back
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'error': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find user by email
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'No account found with this email.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Authenticate using email (USERNAME_FIELD for custom User model)
        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {'error': 'Incorrect password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': f'Welcome back, {user.username}!',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/profile/  → view your profile
    PUT  /api/profile/  → update your profile
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Always return the currently logged-in user
        return self.request.user


class FreelancerListView(generics.ListAPIView):
    """
    GET /api/freelancers/
    List all freelancers (clients can browse)
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role='freelancer')