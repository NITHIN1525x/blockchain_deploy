import json
import os
from pathlib import Path

from django.conf import settings


def _blockchain_dir() -> Path:
    # workspace/marketplace/backend -> workspace/marketplace/blockchain
    return settings.BASE_DIR.parent / "blockchain"


def load_contract_address() -> str:
    env_address = os.getenv("ESCROW_CONTRACT_ADDRESS", "").strip()
    if env_address:
        return env_address

    deployment_file = _blockchain_dir() / "deployment.json"
    if deployment_file.exists():
        try:
            data = json.loads(deployment_file.read_text(encoding="utf-8"))
            return data.get("contractAddress", "")
        except Exception:
            return ""

    return ""


def load_contract_abi() -> list:
    artifact = (
        _blockchain_dir()
        / "artifacts"
        / "contracts"
        / "FreelanceEscrow.sol"
        / "FreelanceEscrow.json"
    )
    if artifact.exists():
        try:
            data = json.loads(artifact.read_text(encoding="utf-8"))
            return data.get("abi", [])
        except Exception:
            return []
    return []


def contract_info() -> dict:
    return {
        "contract_address": load_contract_address(),
        "contract_abi": load_contract_abi(),
        "rpc_url": os.getenv("WEB3_RPC_URL", "http://127.0.0.1:8545"),
        "chain_id": int(os.getenv("WEB3_CHAIN_ID", "31337")),
    }
