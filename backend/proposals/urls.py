# proposals/urls.py
from django.urls import path
from .views import (
    ApplyToJobView,
    JobProposalsView,
    AcceptProposalView,
    RejectProposalView,
    MyProposalsView
)

urlpatterns = [
    path('jobs/<int:pk>/apply/', ApplyToJobView.as_view(), name='apply-job'),
    path('jobs/<int:pk>/proposals/', JobProposalsView.as_view(), name='job-proposals'),
    path('proposals/<int:pk>/accept/', AcceptProposalView.as_view(), name='accept-proposal'),
    path('proposals/<int:pk>/reject/', RejectProposalView.as_view(), name='reject-proposal'),
    path('proposals/my-proposals/', MyProposalsView.as_view(), name='my-proposals'),
]