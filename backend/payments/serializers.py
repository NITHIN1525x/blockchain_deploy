from rest_framework import serializers


class WalletConnectSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=120)

    def validate_wallet_address(self, value):
        value = value.strip()
        if not value.startswith("0x") or len(value) != 42:
            raise serializers.ValidationError("Invalid wallet address format.")
        return value


class OnchainLockSyncSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(max_length=120)
    onchain_project_id = serializers.IntegerField(min_value=1)
    wallet_address = serializers.CharField(max_length=120, required=False, allow_blank=True)


class OnchainApproveSyncSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(max_length=120)
    wallet_address = serializers.CharField(max_length=120, required=False, allow_blank=True)


class OnchainSubmitAndReleaseSyncSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(max_length=120)
    wallet_address = serializers.CharField(max_length=120, required=False, allow_blank=True)
    github_link = serializers.URLField(required=False, allow_blank=True)
    website_url = serializers.URLField(required=False, allow_blank=True)
    file_link = serializers.URLField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not any(
            (attrs.get(field) or "").strip()
            for field in ["github_link", "website_url", "file_link", "notes"]
        ):
            raise serializers.ValidationError(
                "Please fill in at least one submission field."
            )
        return attrs
