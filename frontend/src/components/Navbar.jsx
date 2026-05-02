// src/components/Navbar.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useWeb3 } from '../context/Web3Context.jsx'
import '../css/Navbar.css'

export default function Navbar() {
    const { user, logout } = useAuth()
    const {
        account,
        connectWallet,
        disconnectWallet,
        connecting,
        isMetaMaskInstalled,
        isExpectedChain,
        switchToExpectedChain,
    } = useWeb3()

    const getInitial = () => {
        if (user && user.username) return user.username[0].toUpperCase()
        return '?'
    }

    const shortWallet = account
        ? `${account.slice(0, 6)}...${account.slice(-4)}`
        : ''

    const getDashboardLink = () => {
        if (!user) return '/login'
        return user.role === 'client'
            ? '/client/dashboard'
            : '/freelancer/dashboard'
    }

    const syncWalletToProfile = async (walletAddress) => {
        await API.post('/payments/connect-wallet/', {
            wallet_address: walletAddress,
        })
    }

    const handleConnectWallet = async () => {
        if (!isMetaMaskInstalled) {
            toast.error('MetaMask is not installed.')
            return
        }

        try {
            const selectedWallet = await connectWallet()
            if (!selectedWallet) {
                toast.error('No wallet selected in MetaMask.')
                return
            }

            await syncWalletToProfile(selectedWallet)
            toast.success('MetaMask wallet connected successfully.')
        } catch (err) {
            toast.error(err?.response?.data?.wallet_address?.[0] || err?.message || 'Failed to connect wallet.')
        }
    }

    const handleSwitchNetwork = async () => {
        try {
            await switchToExpectedChain()
            toast.success('Switched MetaMask to the local Ethereum network.')
        } catch (err) {
            toast.error(err?.message || 'Failed to switch MetaMask network.')
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <div className="navbar-logo-icon">F</div>
                    <span className="navbar-logo-text">
                        Free<span>Lance</span>
                    </span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/jobs" className="nav-link">Browse Jobs</Link>
                    {user && <Link to="/profile" className="nav-link">Profile</Link>}
                </div>

                {!user ? (
                    <div className="navbar-links">
                        <Link to="/login" className="btn-nav-login">Login</Link>
                        <Link to="/register" className="btn-nav-register">Sign Up</Link>
                    </div>
                ) : (
                    <div className="navbar-user">
                        <div className="user-avatar">{getInitial()}</div>
                        <div className="user-info">
                            <span className="user-name">{user.username}</span>
                            <span className="user-role">{user.role}</span>
                        </div>
                        {account ? (
                            <button className="btn-wallet-connected" onClick={disconnectWallet}>
                                {shortWallet}
                            </button>
                        ) : (
                            <button
                                className="btn-wallet-connect"
                                onClick={handleConnectWallet}
                                disabled={connecting}
                            >
                                {connecting ? 'Connecting...' : 'Connect MetaMask'}
                            </button>
                        )}
                        {account && !isExpectedChain && (
                            <button className="btn-wallet-network" onClick={handleSwitchNetwork}>
                                Switch Network
                            </button>
                        )}
                        <Link to={getDashboardLink()} className="btn-dashboard">
                            Dashboard
                        </Link>
                        <button className="btn-logout" onClick={logout}>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}
