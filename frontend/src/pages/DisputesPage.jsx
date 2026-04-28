// src/pages/DisputesPage.jsx
import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Chat.css'
import '../css/Dashboard.css'
import '../css/Jobs.css'

export default function DisputesPage() {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const projectIdFromURL = searchParams.get('project')

    const [disputes, setDisputes] = useState([])
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [showRaiseForm, setShowRaiseForm] = useState(!!projectIdFromURL)
    const [selectedProject, setSelectedProject] = useState(projectIdFromURL || '')
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Admin resolve state
    const [resolvingId, setResolvingId] = useState(null)
    const [resolveData, setResolveData] = useState({
        resolution: 'pay_freelancer',
        admin_notes: '',
        client_amount: '',
        freelancer_amount: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [disputesRes, projectsRes] = await Promise.all([
                API.get('/disputes/'),
                API.get('/projects/'),
            ])
            setDisputes(disputesRes.data)
            // Only show locked projects for raising dispute
            setProjects(projectsRes.data.filter(
                p => p.payment_status === 'locked' || p.payment_status === 'on_hold'
            ))
        } catch (err) {
            toast.error('Failed to load disputes.')
        } finally {
            setLoading(false)
        }
    }

    const handleRaiseDispute = async (e) => {
        e.preventDefault()
        if (!selectedProject || !reason.trim()) {
            toast.error('Please select a project and enter a reason.')
            return
        }
        setSubmitting(true)
        try {
            await API.post(`/projects/${selectedProject}/raise-dispute/`, { reason })
            toast.success('Dispute raised! Payment is now on hold.')
            setShowRaiseForm(false)
            setReason('')
            setSelectedProject('')
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to raise dispute.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleResolve = async (disputeId) => {
        if (resolveData.resolution === 'split') {
            if (!resolveData.client_amount || !resolveData.freelancer_amount) {
                toast.error('Enter both amounts for split resolution.')
                return
            }
        }
        try {
            await API.post(`/disputes/${disputeId}/resolve/`, resolveData)
            toast.success('Dispute resolved successfully!')
            setResolvingId(null)
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to resolve dispute.')
        }
    }

    const handleMarkReview = async (disputeId) => {
        try {
            await API.post(`/disputes/${disputeId}/under-review/`)
            toast.success('Dispute marked as under review.')
            fetchData()
        } catch (err) {
            toast.error('Failed to update status.')
        }
    }

    const getStatusBadge = (status) => {
        const map = {
            open: 'badge-danger',
            under_review: 'badge-info',
            resolved: 'badge-success',
        }
        return map[status] || 'badge-gray'
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6fc' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

                <div className="dashboard-header">
                    <h1>⚖️ Disputes</h1>
                    <p>
                        {user?.is_staff
                            ? 'Admin panel — review and resolve disputes.'
                            : 'Raise and track disputes for your projects.'
                        }
                    </p>
                </div>

                {/* Raise Dispute Button */}
                {!user?.is_staff && !showRaiseForm && (
                    <button
                        className="btn-danger"
                        style={{
                            padding: '12px 24px',
                            fontSize: '0.95rem',
                            marginBottom: '24px'
                        }}
                        onClick={() => setShowRaiseForm(true)}
                    >
                        ⚖️ Raise New Dispute
                    </button>
                )}

                {/* Raise Dispute Form */}
                {showRaiseForm && (
                    <div className="raise-dispute-form">
                        <h2 style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#c62828',
                            marginBottom: '20px'
                        }}>
                            ⚖️ Raise a Dispute
                        </h2>

                        <form onSubmit={handleRaiseDispute}>
                            <div className="form-group">
                                <label>Select Project *</label>
                                <select
                                    value={selectedProject}
                                    onChange={e => setSelectedProject(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose a project --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.job_details?.title} —
                                            ${p.escrow_amount}
                                            ({user?.role === 'client'
                                                ? p.freelancer_details?.username
                                                : p.client_details?.username
                                            })
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Reason for Dispute *</label>
                                <textarea
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Describe the issue in detail — what went wrong, what was promised vs delivered..."
                                    required
                                    style={{ minHeight: '120px' }}
                                />
                            </div>

                            <div style={{
                                background: '#fff3e0',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                marginBottom: '20px',
                                fontSize: '0.85rem',
                                color: '#e65100'
                            }}>
                                ⚠️ Raising a dispute will put the escrow payment
                                <strong> ON HOLD</strong> immediately until resolved by admin.
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="submit"
                                    className="btn-danger"
                                    style={{ padding: '12px 28px' }}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Raising...' : '⚖️ Submit Dispute'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-outline"
                                    style={{ padding: '12px 20px' }}
                                    onClick={() => setShowRaiseForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Disputes List */}
                {loading ? (
                    <div className="spinner"></div>
                ) : disputes.length === 0 ? (
                    <div className="dashboard-card">
                        <div className="empty-state">
                            <span className="empty-state-icon">⚖️</span>
                            <h3>No disputes found</h3>
                            <p>You have no active or past disputes.</p>
                        </div>
                    </div>
                ) : (
                    disputes.map(dispute => (
                        <div
                            key={dispute.id}
                            className={`dispute-card ${dispute.status}`}
                        >
                            {/* Header */}
                            <div className="dispute-header">
                                <div>
                                    <div className="dispute-project-title">
                                        {dispute.project_details?.job_details?.title}
                                    </div>
                                    <div className="dispute-meta">
                                        Raised by: <strong>
                                            {dispute.raised_by_details?.username}
                                        </strong>
                                        &nbsp;•&nbsp;
                                        {new Date(dispute.created_at).toLocaleDateString()}
                                        &nbsp;•&nbsp;
                                        Escrow: <strong>
                                            ${dispute.project_details?.escrow_amount}
                                        </strong>
                                    </div>
                                </div>
                                <span className={`badge ${getStatusBadge(dispute.status)}`}>
                                    {dispute.status.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Reason */}
                            <div className="dispute-reason">
                                <strong>Reason:</strong> {dispute.reason}
                            </div>

                            {/* Resolution Info */}
                            {dispute.status === 'resolved' && (
                                <div className="dispute-resolution">
                                    <strong>✅ Resolution:</strong> {dispute.resolution?.replace('_', ' ')}
                                    {dispute.admin_notes && (
                                        <div style={{ marginTop: '6px' }}>
                                            <strong>Admin Notes:</strong> {dispute.admin_notes}
                                        </div>
                                    )}
                                    {dispute.resolution === 'split' && (
                                        <div style={{ marginTop: '6px' }}>
                                            Client got: ${dispute.client_amount} |
                                            Freelancer got: ${dispute.freelancer_amount}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Admin Actions */}
                            {user?.is_staff && dispute.status !== 'resolved' && (
                                <div>
                                    {dispute.status === 'open' && (
                                        <button
                                            className="btn-outline"
                                            style={{ marginBottom: '16px' }}
                                            onClick={() => handleMarkReview(dispute.id)}
                                        >
                                            🔍 Mark Under Review
                                        </button>
                                    )}

                                    {resolvingId === dispute.id ? (
                                        <div style={{
                                            background: '#f8f8f8',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            marginTop: '12px'
                                        }}>
                                            <h3 style={{
                                                fontWeight: 700,
                                                marginBottom: '16px',
                                                fontSize: '1rem'
                                            }}>
                                                Resolve Dispute
                                            </h3>

                                            <div className="form-group">
                                                <label>Resolution Type *</label>
                                                <select
                                                    value={resolveData.resolution}
                                                    onChange={e => setResolveData({
                                                        ...resolveData,
                                                        resolution: e.target.value
                                                    })}
                                                >
                                                    <option value="pay_freelancer">
                                                        Pay Freelancer (full amount)
                                                    </option>
                                                    <option value="refund_client">
                                                        Refund Client (full amount)
                                                    </option>
                                                    <option value="split">
                                                        Split Payment
                                                    </option>
                                                </select>
                                            </div>

                                            {resolveData.resolution === 'split' && (
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '16px'
                                                }}>
                                                    <div className="form-group">
                                                        <label>Client Amount ($)</label>
                                                        <input
                                                            type="number"
                                                            value={resolveData.client_amount}
                                                            onChange={e => setResolveData({
                                                                ...resolveData,
                                                                client_amount: e.target.value
                                                            })}
                                                            placeholder="e.g. 200"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Freelancer Amount ($)</label>
                                                        <input
                                                            type="number"
                                                            value={resolveData.freelancer_amount}
                                                            onChange={e => setResolveData({
                                                                ...resolveData,
                                                                freelancer_amount: e.target.value
                                                            })}
                                                            placeholder="e.g. 300"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="form-group">
                                                <label>Admin Notes</label>
                                                <textarea
                                                    value={resolveData.admin_notes}
                                                    onChange={e => setResolveData({
                                                        ...resolveData,
                                                        admin_notes: e.target.value
                                                    })}
                                                    placeholder="Add notes about your decision..."
                                                    style={{ minHeight: '80px' }}
                                                />
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button
                                                    className="btn-success"
                                                    style={{ padding: '10px 24px' }}
                                                    onClick={() => handleResolve(dispute.id)}
                                                >
                                                    ✅ Confirm Resolution
                                                </button>
                                                <button
                                                    className="btn-outline"
                                                    style={{ padding: '10px 16px' }}
                                                    onClick={() => setResolvingId(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn-success"
                                            style={{ marginLeft: '8px' }}
                                            onClick={() => setResolvingId(dispute.id)}
                                        >
                                            ✅ Resolve Dispute
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* View Project Chat */}
                            <div style={{ marginTop: '16px' }}>
                                <Link
                                    to={`/projects/${dispute.project_details?.id}/chat`}
                                    className="btn-outline"
                                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                >
                                    💬 View Project Chat
                                </Link>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    )
}