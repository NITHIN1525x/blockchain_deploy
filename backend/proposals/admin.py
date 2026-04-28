# proposals/admin.py
from django.contrib import admin
from .models import Proposal

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ['freelancer', 'job', 'bid_amount', 'delivery_days', 'status']
    list_filter = ['status']
    search_fields = ['freelancer__username', 'job__title']