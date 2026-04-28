# users/urls.py
from django.urls import path
from .views import RegisterView, LoginView, ProfileView, FreelancerListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('freelancers/', FreelancerListView.as_view(), name='freelancer-list'),
]