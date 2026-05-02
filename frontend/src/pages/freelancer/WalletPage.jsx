// src/pages/freelancer/WalletPage.jsx
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import API from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useWeb3 } from '../../context/Web3Context.jsx'
import FreelancerSidebar from '../../components/FreelancerSidebar.jsx'
import '../../css/Dashboard.css'

export default function WalletPage() {
    const { user } = useAuth()
    const {
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
    } = useWeb3()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [syncingWallet, setSyncingWallet] = useState(false)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const res = await API.get('/projects/')
            setProjects(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const earnedProjects = projects.filter(
        p => p.payment_status === 'released' && p.work_status === 'approved'
    )

    const totalEarned = earnedProjects.reduce(
        (sum, p) => sum + parseFloat(p.escrow_amount), 0
    )

    const shortAddress = account
        ? `${account.slice(0, 6)}...${account.slice(-4)}`
        : 'Not connected'

    const handleConnect = async () => {
        try {
            const selected = await connectWallet()
            if (!selected) return

            setSyncingWallet(true)
            const res = await API.post('/payments/connect-wallet/', {
                wallet_address: selected,
            })
            toast.success(res.data?.message || 'Wallet connected successfully!')
        } catch (err) {
            toast.error(err?.message || 'Failed to connect wallet.')
        } finally {
            setSyncingWallet(false)
        }
    }

    const handleSwitchNetwork = async () => {
        try {
            setSyncingWallet(true)
            await switchToExpectedChain()
            toast.success('MetaMask switched to the local Ethereum network.')
        } catch (err) {
            toast.error(err?.message || 'Failed to switch MetaMask to the local network.')
        } finally {
            setSyncingWallet(false)
        }
    }

    return (
        <div className="dashboard-layout">
            <FreelancerSidebar />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h1>💰 Wallet & Earnings</h1>
                    <p>Track your earnings and payment history.</p>
                </div>

                {/* Balance Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                    borderRadius: '20px',
                    padding: '40px',
                    color: 'white',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div>
                        <p style={{
                            opacity: 0.85,
                            fontSize: '0.9rem',
                            marginBottom: '8px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Total Balance
                        </p>
                        <h1 style={{
                            fontSize: '3rem',
                            fontWeight: 800,
                            lineHeight: 1
                        }}>
                            ${parseFloat(user?.balance || 0).toFixed(2)}
                        </h1>
                        <p style={{ opacity: 0.8, marginTop: '8px', fontSize: '0.88rem' }}>
                            Available in your FreeLance wallet
                        </p>
                    </div>
                    <div style={{ fontSize: '5rem', opacity: 0.3 }}>💰</div>
                </div>

                <div className="dashboard-card" style={{ marginBottom: '28px' }}>
                    <div className="card-header">
                        <h2>MetaMask Wallet</h2>
                    </div>

                    {!isMetaMaskInstalled ? (
                        <p style={{ color: '#b00020', fontWeight: 600 }}>
                            MetaMask is not installed. Install it to enable blockchain escrow actions.
                        </p>
                    ) : (
                        <>
                            <p style={{ marginBottom: '10px', color: '#666' }}>
                                Connected Address: <strong>{shortAddress}</strong>
                            </p>
                            <p style={{ marginBottom: '16px', color: '#666' }}>
                                Chain ID: <strong>{chainId || 'Unknown'}</strong>
                            </p>
                            <p style={{ marginBottom: '10px', color: '#666' }}>
                                Required Local Chain: <strong>{expectedChainId || 'Loading...'}</strong>
                            </p>
                            <p style={{ marginBottom: '16px', color: '#666' }}>
                                Local RPC: <strong>{expectedRpcUrl || 'Loading...'}</strong>
                            </p>
                            {chainId && expectedChainId && !isExpectedChain && (
                                <p style={{ marginBottom: '16px', color: '#b00020', fontWeight: 600 }}>
                                    MetaMask is on the wrong network. Switch to the local Ethereum chain before sending payments.
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {expectedChainId && !isExpectedChain && (
                                    <button
                                        className="btn-outline"
                                        onClick={handleSwitchNetwork}
                                        disabled={syncingWallet}
                                    >
                                        {syncingWallet ? 'Switching...' : 'Switch to Local Network'}
                                    </button>
                                )}
                                {!account ? (
                                    <button
                                        className="btn-primary"
                                        onClick={handleConnect}
                                        disabled={connecting || syncingWallet}
                                    >
                                        {connecting || syncingWallet
                                            ? 'Connecting...'
                                            : '🦊 Connect MetaMask'}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="btn-outline"
                                            onClick={handleConnect}
                                            disabled={syncingWallet}
                                        >
                                            {syncingWallet ? 'Syncing...' : '🔄 Sync Wallet to Profile'}
                                        </button>
                                        <button
                                            className="btn-danger"
                                            onClick={disconnectWallet}
                                        >
                                            Disconnect
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: '28px' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon green">✅</div>
                        <div className="stat-card-info">
                            <h3>{earnedProjects.length}</h3>
                            <p>Completed Projects</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon pink">💵</div>
                        <div className="stat-card-info">
                            <h3>${totalEarned.toFixed(2)}</h3>
                            <p>Total Earned</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon blue">🚀</div>
                        <div className="stat-card-info">
                            <h3>
                                {projects.filter(p =>
                                    p.work_status === 'in_progress'
                                ).length}
                            </h3>
                            <p>In Progress</p>
                        </div>
                    </div>
                </div>

                {/* Earnings History */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Earnings History</h2>
                    </div>

                    {loading ? (
                        <div className="spinner"></div>
                    ) : earnedProjects.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">💸</span>
                            <h3>No earnings yet</h3>
                            <p>Complete projects to start earning!</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Client</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earnedProjects.map(project => (
                                    <tr key={project.id}>
                                        <td>
                                            <strong>{project.job_details?.title}</strong>
                                        </td>
                                        <td>{project.client_details?.username}</td>
                                        <td>
                                            <strong style={{ color: '#2e7d32' }}>
                                                +${project.escrow_amount}
                                            </strong>
                                        </td>
                                        <td>
                                            {new Date(project.updated_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <span className="badge badge-success">
                                                Paid
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </main>
        </div>
    )
}
