// src/pages/client/ClientProjects.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../../api/axios.js'
import { useWeb3 } from '../../context/Web3Context.jsx'
import { createProjectAndLockPaymentOnChain } from '../../utils/escrowContract.js'
import ClientSidebar from '../../components/ClientSidebar.jsx'
import '../../css/Dashboard.css'
import '../../css/Jobs.css'
import '../../css/Proposals.css'

export default function ClientProjects() {
    const { account, connectWallet, isMetaMaskInstalled } = useWeb3()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [lockingId, setLockingId] = useState(null)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const res = await API.get('/projects/')
            setProjects(res.data)
        } catch (err) {
            toast.error('Failed to load projects.')
        } finally {
            setLoading(false)
        }
    }

    const handleLockPayment = async (project) => {
        if (!window.confirm('Lock payment into local MetaMask escrow?')) return

        if (!isMetaMaskInstalled) {
            toast.error('MetaMask is required for local on-chain lock payment.')
            return
        }

        if (!project?.freelancer_details?.wallet_address) {
            toast.error('Freelancer has no wallet address in profile. Ask them to connect MetaMask first.')
            return
        }

        let selectedWallet = account
        if (!selectedWallet) {
            try {
                selectedWallet = await connectWallet()
            } catch (err) {
                toast.error(err?.message || 'Failed to connect MetaMask.')
                return
            }
        }

        if (!selectedWallet) {
            toast.error('No wallet selected in MetaMask.')
            return
        }

        if (
            selectedWallet.toLowerCase() ===
            project.freelancer_details.wallet_address.toLowerCase()
        ) {
            toast.error('Client and freelancer must use different MetaMask accounts.')
            return
        }

        setLockingId(project.id)
        try {
            const { onchainProjectId, txHash } = await createProjectAndLockPaymentOnChain({
                freelancerWallet: project.freelancer_details.wallet_address,
                amount: project.escrow_amount,
            })

            const res = await API.post(`/projects/${project.id}/lock-payment/onchain-sync/`, {
                tx_hash: txHash,
                onchain_project_id: onchainProjectId,
                wallet_address: selectedWallet,
            })

            toast.success(res.data.message || 'Payment locked successfully on local MetaMask.')
            fetchProjects()
        } catch (err) {
            toast.error(err.response?.data?.error || err?.message || 'Failed to lock payment on-chain.')
        } finally {
            setLockingId(null)
        }
    }

    const handleSimulateLockPayment = async (projectId) => {
        if (!window.confirm('Lock payment in local demo mode instead?')) return
        setLockingId(projectId)
        try {
            const res = await API.post(`/projects/${projectId}/lock-payment/`)
            toast.success(res.data.message)
            fetchProjects()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to lock payment.')
        } finally {
            setLockingId(null)
        }
    }

    const getPaymentBadge = (status) => {
        const map = {
            pending: 'badge-warning',
            locked: 'badge-info',
            on_hold: 'badge-danger',
            released: 'badge-success',
            refunded: 'badge-gray',
        }
        return map[status] || 'badge-gray'
    }

    const getWorkBadge = (status) => {
        const map = {
            in_progress: 'badge-info',
            submitted: 'badge-warning',
            revision_requested: 'badge-danger',
            approved: 'badge-success',
        }
        return map[status] || 'badge-gray'
    }

    return (
        <div className="dashboard-layout">
            <ClientSidebar />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h1>Active Projects</h1>
                    <p>Use local MetaMask escrow, with a demo-only fallback if needed.</p>
                </div>

                {loading ? (
                    <div className="spinner"></div>
                ) : projects.length === 0 ? (
                    <div className="dashboard-card">
                        <div className="empty-state">
                            <span className="empty-state-icon">🚀</span>
                            <h3>No projects yet</h3>
                            <p>Accept a proposal to start a project!</p>
                            <Link to="/client/my-jobs" className="btn-primary">
                                View My Jobs
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {projects.map(project => (
                            <div key={project.id} className="dashboard-card">
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '20px',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                }}>
                                    <div>
                                        <h2 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: 700,
                                            color: '#2d2d2d',
                                            marginBottom: '6px',
                                        }}>
                                            {project.job_details?.title}
                                        </h2>
                                        <p style={{ color: '#888', fontSize: '0.85rem' }}>
                                            Freelancer: <strong>{project.freelancer_details?.username}</strong>
                                            {' • '}
                                            Started: {new Date(project.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <span className={`badge ${getPaymentBadge(project.payment_status)}`}>
                                            💰 {project.payment_status.replace('_', ' ')}
                                        </span>
                                        <span className={`badge ${getWorkBadge(project.work_status)}`}>
                                            🔧 {project.work_status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div style={{
                                    background: '#f8f7ff',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                }}>
                                    <span style={{ fontSize: '1.5rem' }}>🔒</span>
                                    <div>
                                        <div style={{
                                            fontSize: '0.78rem',
                                            color: '#888',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                        }}>
                                            Escrow Amount
                                        </div>
                                        <div style={{
                                            fontSize: '1.4rem',
                                            fontWeight: 800,
                                            color: '#6c63ff',
                                        }}>
                                            ${project.escrow_amount}
                                        </div>
                                    </div>
                                </div>

                                {project.latest_submission && (
                                    <div style={{
                                        background: '#f0fff4',
                                        border: '1px solid #b2dfdb',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        marginBottom: '20px',
                                    }}>
                                        <div style={{
                                            fontWeight: 700,
                                            color: '#2e7d32',
                                            marginBottom: '10px',
                                            fontSize: '0.9rem',
                                        }}>
                                            Latest Submission
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '16px',
                                            flexWrap: 'wrap',
                                            fontSize: '0.85rem',
                                        }}>
                                            {project.latest_submission.github_link && (
                                                <a
                                                    href={project.latest_submission.github_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ color: '#6c63ff', fontWeight: 600 }}
                                                >
                                                    GitHub
                                                </a>
                                            )}
                                            {project.latest_submission.website_url && (
                                                <a
                                                    href={project.latest_submission.website_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ color: '#6c63ff', fontWeight: 600 }}
                                                >
                                                    Live URL
                                                </a>
                                            )}
                                            {project.latest_submission.notes && (
                                                <span style={{ color: '#555' }}>
                                                    Notes: {project.latest_submission.notes}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {project.revision_notes && (
                                    <div style={{
                                        background: '#fff3e0',
                                        border: '1px solid #ffcc80',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        marginBottom: '20px',
                                        fontSize: '0.88rem',
                                        color: '#e65100',
                                    }}>
                                        <strong>Revision Requested:</strong> {project.revision_notes}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {project.payment_status === 'pending' && (
                                        <>
                                            <button
                                                className="btn-primary"
                                                onClick={() => handleLockPayment(project)}
                                                disabled={lockingId === project.id}
                                            >
                                                {lockingId === project.id
                                                    ? 'Locking...'
                                                    : 'Lock Payment (Local MetaMask)'}
                                            </button>

                                            <button
                                                className="btn-outline"
                                                onClick={() => handleSimulateLockPayment(project.id)}
                                                disabled={lockingId === project.id}
                                            >
                                                Fallback Demo Lock
                                            </button>
                                        </>
                                    )}

                                    {project.work_status === 'submitted' && (
                                        <Link
                                            to={`/client/projects/${project.id}/review`}
                                            className="btn-primary"
                                        >
                                            Review Submission
                                        </Link>
                                    )}

                                    <Link
                                        to={`/projects/${project.id}/chat`}
                                        className="btn-outline"
                                    >
                                        Chat
                                    </Link>

                                    {project.payment_status === 'locked' && (
                                        <Link
                                            to={`/disputes?project=${project.id}`}
                                            className="btn-danger"
                                        >
                                            Raise Dispute
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
