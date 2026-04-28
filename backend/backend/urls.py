# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('jobs.urls')),
    path('api/', include('proposals.urls')),
    path('api/', include('projects.urls')),
    path('api/', include('payments.urls')),
    path('api/', include('chat.urls')),
    path('api/', include('disputes.urls')),   # ✅ final one
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)