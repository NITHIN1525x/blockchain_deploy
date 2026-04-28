# projects/urls.py
from django.urls import path
from .views import (
    ProjectListView,
    ProjectDetailView,
    LockPaymentView,
    SubmitWorkView,
    RequestRevisionView,
    ApproveWorkView,
)

urlpatterns = [
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<int:pk>/lock-payment/', LockPaymentView.as_view(), name='lock-payment'),
    path('projects/<int:pk>/submit-work/', SubmitWorkView.as_view(), name='submit-work'),
    path('projects/<int:pk>/request-revision/', RequestRevisionView.as_view(), name='request-revision'),
    path('projects/<int:pk>/approve/', ApproveWorkView.as_view(), name='approve-work'),
]