// src/pages/client/ReviewSubmission.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../../api/axios.js'
import { useWeb3 } from '../../context/Web3Context.jsx'
import { approveAndReleaseOnChain } from '../../utils/escrowContract.js'
import ClientSidebar from '../../components/ClientSidebar.jsx'
import '../../css/Dashboard.css'
import '../../css/Jobs.css'
import '../../css/Proposals.css'

export default function ReviewSubmission() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { account, connectWallet, isMetaMaskInstalled } = useWeb3()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [revisionNotes, setRevisionNotes] = useState('')
    const [showRevisionForm, setShowRevisionForm] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchProject()
    }, [id])

    const fetchProject = async () => {
        try {
            const res = await API.get(`/projects/${id}/`)
            setProject(res.data)
        } catch (err) {
            toast.error('Failed to load project.')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!window.confirm(
            `Approve work and release $${project.escrow_amount} to ${project.freelancer_details?.username}?`
        )) return

        setActionLoading(true)
        try {
            let res

            // If this project is linked on-chain, run MetaMask tx then sync backend
            if (project?.onchain_project_id) {
                if (!isMetaMaskInstalled) {
                    throw new Error('MetaMask is required for this on-chain project approval.')
                }

                let selectedWallet = account
                if (!selectedWallet) {
                    selectedWallet = await connectWallet()
                }

                const txHash = await approveAndReleaseOnChain(project.onchain_project_id)
                res = await API.post(`/projects/${id}/approve/onchain-sync/`, {
                    tx_hash: txHash,
                    wallet_address: selectedWallet || '',
                })
            } else {
                // Fallback: simulated DB-only approval
                res = await API.post(`/projects/${id}/approve/`)
            }

            toast.success(res.data.message)
            navigate('/client/projects')
        } catch (err) {
            toast.error(err.response?.data?.error || err?.message || 'Failed to approve work.')
        } finally {
            setActionLoading(false)
        }
    }

    const handleRequestRevision = async () => {
        if (!revisionNotes.trim()) {
            toast.error('Please enter revision notes.')
            return
        }
        setActionLoading(true)
        try {
            await API.post(`/projects/${id}/request-revision/`, {
                notes: revisionNotes
            })
            toast.success('Revision requested! Freelancer will be notified.')
            setShowRevisionForm(false)
            setRevisionNotes('')
            fetchProject()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to request revision.')
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return (
        <div className="dashboard-layout">
            <ClientSidebar />
            <main className="dashboard-main">
                <div className="spinner"></div>
            </main>
        </div>
    )

    const submission = project?.latest_submission

    return (
        <div className="dashboard-layout">
            <ClientSidebar />

            <main className="dashboard-main">

                <Link
                    to="/client/projects"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#6c63ff',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        marginBottom: '24px',
                        textDecoration: 'none'
                    }}
                >
                    ← Back to Projects
                </Link>

                <div className="dashboard-header">
                    <h1>Review Submission</h1>
                    <p>Check the freelancer's work and decide to approve or request changes.</p>
                </div>

                {/* Project Info */}
                <div className="dashboard-card">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div>
                            <h2 style={{
                                fontSize: '1.3rem',
                                fontWeight: 700,
                                marginBottom: '6px'
                            }}>
                                {project?.job_details?.title}
                            </h2>
                            <p style={{ color: '#888', fontSize: '0.88rem' }}>
                                Freelancer: <strong>{project?.freelancer_details?.username}</strong>
                                &nbsp;•&nbsp;
                                Escrow: <strong style={{ color: '#6c63ff' }}>
                                    ${project?.escrow_amount}
                                </strong>
                            </p>
                        </div>
                        <span className="badge badge-warning">
                            📨 Work Submitted
                        </span>
                    </div>
                </div>

                {/* Submission Details */}
                {submission ? (
                    <div className="dashboard-card">
                        <h2 style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            marginBottom: '24px'
                        }}>
                            📁 Submitted Work
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {submission.github_link && (
                                <div style={{
                                    background: '#f8f8f8',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px'
                                }}>
                                    <span style={{ fontSize: '1.8rem' }}>🐙</span>
                                    <div>
                                        <div style={{
                                            fontSize: '0.78rem',
                                            color: '#888',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            marginBottom: '4px'
                                        }}>
                                            GitHub Repository
                                        </div>
                                        <a
                                            href={submission.github_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                color: '#6c63ff',
                                                fontWeight: 600,
                                                wordBreak: 'break-all'
                                            }}
                                        >
                                            {submission.github_link}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {submission.website_url && (
                                <div style={{
                                    background: '#f8f8f8',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px'
                                }}>
                                    <span style={{ fontSize: '1.8rem' }}>🌐</span>
                                    <div>
                                        <div style={{
                                            fontSize: '0.78rem',
                                            color: '#888',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            marginBottom: '4px'
                                        }}>
                                            Live Website
                                        </div>
                                        <a
                                            href={submission.website_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                color: '#6c63ff',
                                                fontWeight: 600,
                                                wordBreak: 'break-all'
                                            }}
                                        >
                                            {submission.website_url}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {submission.file_link && (
                                <div style={{
                                    background: '#f8f8f8',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px'
                                }}>
                                    <span style={{ fontSize: '1.8rem' }}>📄</span>
                                    <div>
                                        <div style={{
                                            fontSize: '0.78rem',
                                            color: '#888',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            marginBottom: '4px'
                                        }}>
                                            File / Document
                                        </div>
                                        <a
                                            href={submission.file_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: '#6c63ff', fontWeight: 600 }}
                                        >
                                            View File
                                        </a>
                                    </div>
                                </div>
                            )}

                            {submission.notes && (
                                <div style={{
                                    background: '#f8f8f8',
                                    borderRadius: '12px',
                                    padding: '20px'
                                }}>
                                    <div style={{
                                        fontSize: '0.78rem',
                                        color: '#888',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        marginBottom: '8px'
                                    }}>
                                        📝 Freelancer Notes
                                    </div>
                                    <p style={{
                                        color: '#444',
                                        lineHeight: 1.7,
                                        fontSize: '0.95rem'
                                    }}>
                                        {submission.notes}
                                    </p>
                                </div>
                            )}

                            <div style={{
                                fontSize: '0.8rem',
                                color: '#aaa',
                                textAlign: 'right'
                            }}>
                                Submitted: {new Date(submission.submitted_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="dashboard-card">
                        <div className="empty-state">
                            <span className="empty-state-icon">📭</span>
                            <h3>No submission yet</h3>
                            <p>The freelancer hasn't submitted work yet.</p>
                        </div>
                    </div>
                )}

                {/* Decision Buttons */}
                {project?.work_status === 'submitted' && (
                    <div className="dashboard-card">
                        <h2 style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            marginBottom: '20px'
                        }}>
                            Your Decision
                        </h2>

                        {!showRevisionForm ? (
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <button
                                    className="btn-success"
                                    style={{ padding: '14px 32px', fontSize: '1rem' }}
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? 'Processing...'
                                        : `✅ Approve & Release $${project.escrow_amount}`
                                    }
                                </button>

                                <button
                                    className="btn-danger"
                                    style={{ padding: '14px 32px', fontSize: '1rem' }}
                                    onClick={() => setShowRevisionForm(true)}
                                    disabled={actionLoading}
                                >
                                    🔄 Request Revision
                                </button>

                                <Link
                                    to={`/projects/${id}/chat`}
                                    className="btn-outline"
                                    style={{ padding: '14px 28px', fontSize: '1rem' }}
                                >
                                    💬 Chat with Freelancer
                                </Link>
                            </div>
                        ) : (
                            <div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontWeight: 600,
                                        marginBottom: '8px',
                                        color: '#444',
                                        fontSize: '0.88rem'
                                    }}>
                                        Revision Notes *
                                    </label>
                                    <textarea
                                        style={{
                                            width: '100%',
                                            padding: '13px 16px',
                                            border: '2px solid #e8e8e8',
                                            borderRadius: '10px',
                                            fontSize: '0.95rem',
                                            minHeight: '120px',
                                            resize: 'vertical',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                        placeholder="Describe what needs to be changed or improved..."
                                        value={revisionNotes}
                                        onChange={e => setRevisionNotes(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        className="btn-danger"
                                        style={{ padding: '12px 28px' }}
                                        onClick={handleRequestRevision}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? 'Sending...' : '📨 Send Revision Request'}
                                    </button>
                                    <button
                                        className="btn-outline"
                                        style={{ padding: '12px 20px' }}
                                        onClick={() => setShowRevisionForm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Already Approved */}
                {project?.work_status === 'approved' && (
                    <div className="dashboard-card" style={{
                        background: '#f0fff4',
                        border: '2px solid #00c853',
                        textAlign: 'center',
                        padding: '40px'
                    }}>
                        <span style={{ fontSize: '3rem' }}>🎉</span>
                        <h2 style={{ color: '#2e7d32', margin: '16px 0 8px' }}>
                            Work Approved!
                        </h2>
                        <p style={{ color: '#555' }}>
                            Payment of ${project.escrow_amount} has been
                            released to {project.freelancer_details?.username}.
                        </p>
                    </div>
                )}

            </main>
        </div>
    )
}