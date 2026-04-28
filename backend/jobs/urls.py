# jobs/urls.py
from django.urls import path
from .views import (
    JobListView,
    JobCreateView,
    JobDetailView,
    JobDeleteView,
    MyPostedJobsView
)

urlpatterns = [
    path('jobs/', JobListView.as_view(), name='job-list'),
    path('jobs/create/', JobCreateView.as_view(), name='job-create'),
    path('jobs/my-jobs/', MyPostedJobsView.as_view(), name='my-jobs'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('jobs/<int:pk>/delete/', JobDeleteView.as_view(), name='job-delete'),
]