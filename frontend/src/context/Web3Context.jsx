import React, { createContext, useContext, useEffect, useState } from 'react'
import { BrowserProvider } from 'ethers'
import { ensureExpectedChain } from '../utils/escrowContract.js'

const DEFAULT_LOCAL_CHAIN_ID = 31337
const DEFAULT_LOCAL_RPC_URL = 'http://127.0.0.1:8545'
const defaultWeb3ContextValue = {
    account: '',
    chainId: null,
    connecting: false,
    expectedChainId: DEFAULT_LOCAL_CHAIN_ID,
    expectedRpcUrl: DEFAULT_LOCAL_RPC_URL,
    isExpectedChain: false,
    isMetaMaskInstalled: false,
    connectWallet: async () => {
        throw new Error('MetaMask provider is not ready.')
    },
    disconnectWallet: () => {},
    switchToExpectedChain: async () => {
        throw new Error('MetaMask provider is not ready.')
    },
}
const Web3Context = createContext(defaultWeb3ContextValue)

export function Web3Provider({ children }) {
    const [account, setAccount] = useState(localStorage.getItem('wallet_address') || '')
    const [chainId, setChainId] = useState(null)
    const [connecting, setConnecting] = useState(false)
    const [expectedChainId, setExpectedChainId] = useState(null)
    const [expectedRpcUrl, setExpectedRpcUrl] = useState('')

    const isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum
    const isExpectedChain = chainId !== null && expectedChainId !== null && chainId === expectedChainId

    const loadChain = async () => {
        if (!window.ethereum) return
        try {
            const provider = new BrowserProvider(window.ethereum)
            const network = await provider.getNetwork()
            setChainId(Number(network.chainId))
        } catch (err) {
            console.error('Failed to load chain info', err)
        }
    }

    const connectWallet = async () => {
        if (!window.ethereum) throw new Error('MetaMask is not installed.')

        setConnecting(true)
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            })
            const selected = accounts?.[0] || ''
            setAccount(selected)
            if (selected) {
                localStorage.setItem('wallet_address', selected)
            }
            await ensureExpectedChain()
            await loadChain()
            return selected
        } finally {
            setConnecting(false)
        }
    }

    const switchToExpectedChain = async () => {
        await ensureExpectedChain()
        await loadChain()
    }

    const disconnectWallet = () => {
        setAccount('')
        setChainId(null)
        localStorage.removeItem('wallet_address')
    }

    useEffect(() => {
        setExpectedChainId(DEFAULT_LOCAL_CHAIN_ID)
        setExpectedRpcUrl(DEFAULT_LOCAL_RPC_URL)
        loadChain()

        if (!window.ethereum) return

        const onAccountsChanged = (accounts) => {
            const selected = accounts?.[0] || ''
            setAccount(selected)
            if (selected) {
                localStorage.setItem('wallet_address', selected)
            } else {
                localStorage.removeItem('wallet_address')
            }
        }

        const onChainChanged = (chainHex) => {
            setChainId(parseInt(chainHex, 16))
        }

        window.ethereum.on('accountsChanged', onAccountsChanged)
        window.ethereum.on('chainChanged', onChainChanged)

        return () => {
            window.ethereum.removeListener('accountsChanged', onAccountsChanged)
            window.ethereum.removeListener('chainChanged', onChainChanged)
        }
    }, [])

    return (
        <Web3Context.Provider
            value={{
                account,
                chainId,
                connecting,
                expectedChainId,
                expectedRpcUrl,
                isExpectedChain,
                isMetaMaskInstalled,
                connectWallet,
                disconnectWallet,
                switchToExpectedChain,
            }}
        >
            {children}
        </Web3Context.Provider>
    )
}

export const useWeb3 = () => useContext(Web3Context) || defaultWeb3ContextValue
