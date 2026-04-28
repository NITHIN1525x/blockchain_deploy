from django.urls import path

from .views import (
    ContractInfoView,
    ConnectWalletView,
    SyncOnchainLockPaymentView,
    SyncOnchainApproveView,
)

urlpatterns = [
    path("payments/contract-info/", ContractInfoView.as_view(), name="contract-info"),
    path("payments/connect-wallet/", ConnectWalletView.as_view(), name="connect-wallet"),
    path(
        "projects/<int:pk>/lock-payment/onchain-sync/",
        SyncOnchainLockPaymentView.as_view(),
        name="lock-payment-onchain-sync",
    ),
    path(
        "projects/<int:pk>/approve/onchain-sync/",
        SyncOnchainApproveView.as_view(),
        name="approve-onchain-sync",
    ),
]
