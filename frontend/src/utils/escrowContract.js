import { BrowserProvider, Contract, parseEther } from 'ethers'
import API from '../api/axios.js'

let contractInfoPromise = null

const requireProvider = () => {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed.')
    }
}

const toHexChainId = (chainId) => `0x${Number(chainId).toString(16)}`

const buildLocalChainConfig = ({ chain_id, rpc_url }) => ({
    chainId: toHexChainId(chain_id),
    chainName: 'Localhost 8545',
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: [rpc_url],
})

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
    if (!contractInfoPromise) {
        contractInfoPromise = API.get('/payments/contract-info/')
            .then((res) => res.data || {})
            .catch((err) => {
                contractInfoPromise = null
                throw err
            })
    }

    const {
        contract_address,
        contract_abi,
        rpc_url,
        chain_id,
    } = await contractInfoPromise

    if (!contract_address) {
        throw new Error('Contract address not configured in backend.')
    }
    if (!contract_abi || !Array.isArray(contract_abi) || contract_abi.length === 0) {
        throw new Error('Contract ABI is not available from backend.')
    }

    return {
        contractAddress: contract_address,
        contractAbi: contract_abi,
        rpcUrl: rpc_url,
        chainId: Number(chain_id),
    }
}

export async function getExpectedChainConfig() {
    const res = await API.get('/payments/contract-info/')
    const data = res.data || {}

    return {
        chainId: Number(data.chain_id),
        rpcUrl: data.rpc_url,
        networkParams: buildLocalChainConfig(data),
    }
}

export async function ensureExpectedChain() {
    requireProvider()

    const { chainId, networkParams } = await getExpectedChainConfig()
    const provider = new BrowserProvider(window.ethereum)
    const network = await provider.getNetwork()

    if (Number(network.chainId) === chainId) {
        return chainId
    }

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkParams.chainId }],
        })
    } catch (err) {
        if (err?.code !== 4902) {
            throw new Error('Please switch MetaMask to your local Hardhat network.')
        }

        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams],
        })
    }

    return chainId
}

export async function getEscrowContractWithSigner() {
    requireProvider()

    await ensureExpectedChain()
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
