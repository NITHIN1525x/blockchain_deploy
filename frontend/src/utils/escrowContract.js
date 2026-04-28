import { BrowserProvider, Contract, parseEther } from 'ethers'
import API from '../api/axios.js'

const requireProvider = () => {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed.')
    }
}

const parseProjectCreatedId = (contract, receipt) => {
    for (const log of receipt.logs || []) {
        try {
            const parsed = contract.interface.parseLog(log)
            if (parsed?.name === 'ProjectCreated') {
                return Number(parsed.args.projectId)
            }
        } catch {
            // ignore non-matching logs
        }
    }
    throw new Error('Unable to detect on-chain project ID from transaction logs.')
}

export async function getContractResources() {
    const res = await API.get('/payments/contract-info/')
    const { contract_address, contract_abi } = res.data || {}

    if (!contract_address) {
        throw new Error('Contract address not configured in backend.')
    }
    if (!contract_abi || !Array.isArray(contract_abi) || contract_abi.length === 0) {
        throw new Error('Contract ABI is not available from backend.')
    }

    return { contractAddress: contract_address, contractAbi: contract_abi }
}

export async function getEscrowContractWithSigner() {
    requireProvider()

    const { contractAddress, contractAbi } = await getContractResources()
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new Contract(contractAddress, contractAbi, signer)

    return { contract, signer, contractAddress }
}

export async function createProjectAndLockPaymentOnChain({ freelancerWallet, amount }) {
    const { contract } = await getEscrowContractWithSigner()

    const txCreate = await contract.createProject(freelancerWallet)
    const receiptCreate = await txCreate.wait()
    const onchainProjectId = parseProjectCreatedId(contract, receiptCreate)

    const value = parseEther(String(amount))
    const txLock = await contract.lockPayment(onchainProjectId, { value })
    const receiptLock = await txLock.wait()

    return {
        onchainProjectId,
        txHash: receiptLock.hash,
    }
}

export async function submitWorkOnChain(onchainProjectId) {
    const { contract } = await getEscrowContractWithSigner()
    const tx = await contract.submitWork(onchainProjectId)
    const receipt = await tx.wait()
    return receipt.hash
}

export async function approveAndReleaseOnChain(onchainProjectId) {
    const { contract } = await getEscrowContractWithSigner()
    const tx = await contract.approveAndRelease(onchainProjectId)
    const receipt = await tx.wait()
    return receipt.hash
}
