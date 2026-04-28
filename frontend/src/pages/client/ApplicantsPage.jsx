// src/pages/client/ApplicantsPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../../api/axios.js'
import ClientSidebar from '../../components/ClientSidebar.jsx'
import '../../css/Dashboard.css'
import '../../css/Proposals.css'

export default function ApplicantsPage() {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const [job, setJob] = useState(null)
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)

    useEffect(() => {
        fetchData()
    }, [jobId])

    const fetchData = async () => {
        try {
            const [jobRes, proposalsRes] = await Promise.all([
                API.get(`/jobs/${jobId}/`),
                API.get(`/jobs/${jobId}/proposals/`),
            ])
            setJob(jobRes.data)
            setProposals(proposalsRes.data)
        } catch (err) {
            toast.error('Failed to load proposals.')
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (proposalId) => {
        if (!window.confirm('Accept this proposal? A project will be created automatically.')) return
        setActionLoading(proposalId)
        try {
            const res = await API.post(`/proposals/${proposalId}/accept/`)
            toast.success('Proposal accepted! Project created. 🎉')
            // Refresh proposals
            fetchData()
            // Go to projects
            setTimeout(() => navigate('/client/projects'), 1500)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to accept proposal.')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (proposalId) => {
        if (!window.confirm('Reject this proposal?')) return
        setActionLoading(proposalId)
        try {
            await API.post(`/proposals/${proposalId}/reject/`)
            toast.success('Proposal rejected.')
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to reject proposal.')
        } finally {
            setActionLoading(null)
        }
    }

    const getStatusBadge = (status) => {
        const map = {
            pending: 'badge-warning',
            accepted: 'badge-success',
            rejected: 'badge-danger',
        }
        return map[status] || 'badge-gray'
    }

    return (
        <div className="dashboard-layout">
            <ClientSidebar />

            <main className="dashboard-main">
                {/* Back */}
                <Link
                    to="/client/my-jobs"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#6c63ff',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        marginBottom: '20px',
                        textDecoration: 'none'
                    }}
                >
                    ← Back to My Jobs
                </Link>

                {loading ? (
                    <div className="spinner"></div>
                ) : (
                    <>
                        {/* Job Info Banner */}
                        {job && (
                            <div className="job-info-banner">
                                <div>
                                    <h2>{job.title}</h2>
                                    <p>
                                        {job.category.replace('_', ' ')} •
                                        Deadline: {job.deadline}
                                    </p>
                                </div>
                                <div className="job-info-stats">
                                    <div className="job-info-stat">
                                        <strong>${job.budget}</strong>
                                        <span>Budget</span>
                                    </div>
                                    <div className="job-info-stat">
                                        <strong>{proposals.length}</strong>
                                        <span>Proposals</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Proposals */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>
                                    Proposals Received ({proposals.length})
                                </h2>
                            </div>

                            {proposals.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-state-icon">📭</span>
                                    <h3>No proposals yet</h3>
                                    <p>
                                        Freelancers haven't applied yet.
                                        Check back soon!
                                    </p>
                                </div>
                            ) : (
                                <div className="proposals-list">
                                    {proposals.map(proposal => (
                                        <div
                                            key={proposal.id}
                                            className={`proposal-card ${proposal.status}`}
                                        >
                                            {/* Header */}
                                            <div className="proposal-header">
                                                <div className="proposer-info">
                                                    <div className="proposer-avatar">
                                                        {proposal.freelancer_details?.username?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="proposer-name">
                                                            {proposal.freelancer_details?.username}
                                                        </div>
                                                        <div className="proposer-skills">
                                                            {proposal.freelancer_details?.skills || 'No skills listed'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`badge ${getStatusBadge(proposal.status)}`}>
                                                    {proposal.status}
                                                </span>
                                            </div>

                                            {/* Meta */}
                                            <div className="proposal-meta">
                                                <div className="meta-item">
                                                    <span className="meta-label">Bid Amount</span>
                                                    <span className="meta-value green">
                                                        ${proposal.bid_amount}
                                                    </span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Delivery</span>
                                                    <span className="meta-value blue">
                                                        {proposal.delivery_days} days
                                                    </span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Applied</span>
                                                    <span className="meta-value">
                                                        {new Date(proposal.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Message */}
                                            <div className="proposal-message">
                                                "{proposal.message}"
                                            </div>

                                            {/* Actions */}
                                            {proposal.status === 'pending' && (
                                                <div className="proposal-actions">
                                                    <button
                                                        className="btn-success"
                                                        onClick={() => handleAccept(proposal.id)}
                                                        disabled={actionLoading === proposal.id}
                                                    >
                                                        {actionLoading === proposal.id
                                                            ? 'Processing...'
                                                            : '✅ Accept Proposal'
                                                        }
                                                    </button>
                                                    <button
                                                        className="btn-danger"
                                                        onClick={() => handleReject(proposal.id)}
                                                        disabled={actionLoading === proposal.id}
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            )}

                                            {proposal.status === 'accepted' && (
                                                <div style={{
                                                    color: '#2e7d32',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    ✅ Accepted — Project has been created!
                                                </div>
                                            )}

                                            {proposal.status === 'rejected' && (
                                                <div style={{
                                                    color: '#888',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    ❌ Rejected
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}