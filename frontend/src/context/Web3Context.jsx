import React, { createContext, useContext, useEffect, useState } from 'react'
import { BrowserProvider } from 'ethers'

const Web3Context = createContext()

export function Web3Provider({ children }) {
    const [account, setAccount] = useState(localStorage.getItem('wallet_address') || '')
    const [chainId, setChainId] = useState(null)
    const [connecting, setConnecting] = useState(false)

    const isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum

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
            await loadChain()
            return selected
        } finally {
            setConnecting(false)
        }
    }

    const disconnectWallet = () => {
        setAccount('')
        setChainId(null)
        localStorage.removeItem('wallet_address')
    }

    useEffect(() => {
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
                isMetaMaskInstalled,
                connectWallet,
                disconnectWallet,
            }}
        >
            {children}
        </Web3Context.Provider>
    )
}

export const useWeb3 = () => useContext(Web3Context)
