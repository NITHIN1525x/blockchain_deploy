from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project
from projects.models import Submission
from projects.serializers import ProjectSerializer
from .serializers import (
	WalletConnectSerializer,
	OnchainLockSyncSerializer,
	OnchainApproveSyncSerializer,
	OnchainSubmitAndReleaseSyncSerializer,
)
from .blockchain import contract_info

User = get_user_model()


def wallet_belongs_to_another_user(wallet_address: str, current_user) -> bool:
	wallet = (wallet_address or "").strip()
	if not wallet:
		return False

	return User.objects.filter(
		wallet_address__iexact=wallet,
	).exclude(pk=current_user.pk).exists()


class ContractInfoView(APIView):
	"""
	GET /api/payments/contract-info/
	Returns contract metadata used by frontend MetaMask integration.
	"""
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		info = contract_info()
		return Response(info, status=status.HTTP_200_OK)


class ConnectWalletView(APIView):
	"""
	POST /api/payments/connect-wallet/
	Persist user's wallet address in profile.
	"""
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		serializer = WalletConnectSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		wallet_address = serializer.validated_data["wallet_address"]
		if wallet_belongs_to_another_user(wallet_address, request.user):
			return Response(
				{"wallet_address": ["This wallet is already connected to another user."]},
				status=status.HTTP_400_BAD_REQUEST,
			)

		request.user.wallet_address = wallet_address
		request.user.save(update_fields=["wallet_address"])

		return Response(
			{
				"message": "Wallet connected successfully.",
				"wallet_address": request.user.wallet_address,
			},
			status=status.HTTP_200_OK,
		)


class SyncOnchainLockPaymentView(APIView):
	"""
	POST /api/projects/{id}/lock-payment/onchain-sync/
	Sync successful on-chain lock payment tx into Django state.
	"""
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, pk):
		if request.user.role != "client":
			return Response(
				{"error": "Only clients can sync lock payment."},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			project = Project.objects.get(pk=pk, client=request.user)
		except Project.DoesNotExist:
			return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

		serializer = OnchainLockSyncSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		if project.payment_status != "pending":
			return Response(
				{"error": f"Payment is already {project.payment_status}."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		data = serializer.validated_data
		wallet = (data.get("wallet_address") or "").strip()
		info = contract_info()

		if wallet_belongs_to_another_user(wallet, request.user):
			return Response(
				{"error": "This wallet is already connected to another user."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		with transaction.atomic():
			project.payment_status = "locked"
			project.onchain_project_id = data["onchain_project_id"]
			project.last_tx_hash = data["tx_hash"]
			project.contract_address = info.get("contract_address") or project.contract_address
			project.save()

			if wallet:
				request.user.wallet_address = wallet
				request.user.save(update_fields=["wallet_address"])

		return Response(
			{
				"message": "On-chain lock payment synced successfully.",
				"project": ProjectSerializer(project).data,
			},
			status=status.HTTP_200_OK,
		)


class SyncOnchainApproveView(APIView):
	"""
	POST /api/projects/{id}/approve/onchain-sync/
	Sync successful on-chain approve/release tx into Django state and balance.
	"""
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, pk):
		if request.user.role != "client":
			return Response(
				{"error": "Only clients can sync approval."},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			project = Project.objects.select_related("freelancer", "job").get(
				pk=pk,
				client=request.user,
			)
		except Project.DoesNotExist:
			return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

		serializer = OnchainApproveSyncSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		if project.work_status != "submitted":
			return Response(
				{"error": "No submitted work to approve."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		if project.payment_status != "locked":
			return Response(
				{"error": "Payment must be locked before approval sync."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		wallet = (serializer.validated_data.get("wallet_address") or "").strip()

		if wallet_belongs_to_another_user(wallet, request.user):
			return Response(
				{"error": "This wallet is already connected to another user."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		with transaction.atomic():
			project.payment_status = "released"
			project.work_status = "approved"
			project.last_tx_hash = serializer.validated_data["tx_hash"]
			project.save()

			freelancer = project.freelancer
			freelancer.balance += project.escrow_amount
			freelancer.save(update_fields=["balance"])

			project.job.status = "completed"
			project.job.save(update_fields=["status"])

			if wallet:
				request.user.wallet_address = wallet
				request.user.save(update_fields=["wallet_address"])

		return Response(
			{
				"message": "On-chain approval synced and freelancer balance updated.",
				"project": ProjectSerializer(project).data,
			},
			status=status.HTTP_200_OK,
		)


class SyncOnchainSubmitAndReleaseView(APIView):
	"""
	POST /api/projects/{id}/submit-work/onchain-sync/
	Sync freelancer submit-work tx that also auto-releases payment on-chain.
	"""
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, pk):
		if request.user.role != "freelancer":
			return Response(
				{"error": "Only freelancers can sync submit work."},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			project = Project.objects.select_related("freelancer", "job").get(
				pk=pk,
				freelancer=request.user,
			)
		except Project.DoesNotExist:
			return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

		serializer = OnchainSubmitAndReleaseSyncSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		if project.payment_status != "locked":
			return Response(
				{"error": "Client has not locked payment yet."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		if project.work_status not in ["in_progress", "revision_requested"]:
			return Response(
				{"error": "Work cannot be submitted at this stage."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		wallet = (serializer.validated_data.get("wallet_address") or "").strip()
		if wallet_belongs_to_another_user(wallet, request.user):
			return Response(
				{"error": "This wallet is already connected to another user."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		with transaction.atomic():
			Submission.objects.create(
				project=project,
				github_link=serializer.validated_data.get("github_link") or "",
				website_url=serializer.validated_data.get("website_url") or "",
				file_link=serializer.validated_data.get("file_link") or "",
				notes=serializer.validated_data.get("notes") or "",
			)

			project.payment_status = "released"
			project.work_status = "approved"
			project.revision_notes = ""
			project.last_tx_hash = serializer.validated_data["tx_hash"]
			project.save()

			freelancer = project.freelancer
			freelancer.balance += project.escrow_amount
			if wallet:
				freelancer.wallet_address = wallet
				freelancer.save(update_fields=["balance", "wallet_address"])
			else:
				freelancer.save(update_fields=["balance"])

			project.job.status = "completed"
			project.job.save(update_fields=["status"])

		return Response(
			{
				"message": "Work submitted and payment released on-chain.",
				"project": ProjectSerializer(project).data,
			},
			status=status.HTTP_200_OK,
		)
