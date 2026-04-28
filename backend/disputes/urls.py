# disputes/urls.py
from django.urls import path
from .views import (
    RaiseDisputeView,
    DisputeListView,
    DisputeDetailView,
    ResolveDisputeView,
    MarkUnderReviewView,
)

urlpatterns = [
    # Raise a dispute on a project
    path(
        'projects/<int:pk>/raise-dispute/',
        RaiseDisputeView.as_view(),
        name='raise-dispute'
    ),

    # List all disputes
    path(
        'disputes/',
        DisputeListView.as_view(),
        name='dispute-list'
    ),

    # Single dispute detail
    path(
        'disputes/<int:pk>/',
        DisputeDetailView.as_view(),
        name='dispute-detail'
    ),

    # Admin: mark under review
    path(
        'disputes/<int:pk>/under-review/',
        MarkUnderReviewView.as_view(),
        name='dispute-under-review'
    ),

    # Admin: resolve dispute
    path(
        'disputes/<int:pk>/resolve/',
        ResolveDisputeView.as_view(),
        name='resolve-dispute'
    ),
]