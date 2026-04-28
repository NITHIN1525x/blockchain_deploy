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
