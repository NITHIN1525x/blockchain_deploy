// src/pages/freelancer/FreelancerProjects.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../../api/axios.js'
import FreelancerSidebar from '../../components/FreelancerSidebar.jsx'
import '../../css/Dashboard.css'
import '../../css/Proposals.css'

export default function FreelancerProjects() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

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
            submitted: 'badge-purple',
            revision_requested: 'badge-warning',
            approved: 'badge-success',
        }
        return map[status] || 'badge-gray'
    }

    return (
        <div className="dashboard-layout">
            <FreelancerSidebar />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h1>My Projects</h1>
                    <p>Manage all your active and completed projects.</p>
                </div>

                {loading ? (
                    <div className="spinner"></div>
                ) : projects.length === 0 ? (
                    <div className="dashboard-card">
                        <div className="empty-state">
                            <span className="empty-state-icon">🚀</span>
                            <h3>No projects yet</h3>
                            <p>Get a proposal accepted to start working!</p>
                            <Link to="/jobs" className="btn-primary">
                                Browse Jobs
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        {projects.map(project => (
                            <div key={project.id} className="dashboard-card">

                                {/* Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '20px',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                }}>
                                    <div>
                                        <h2 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: 700,
                                            color: '#2d2d2d',
                                            marginBottom: '6px'
                                        }}>
                                            {project.job_details?.title}
                                        </h2>
                                        <p style={{
                                            color: '#888',
                                            fontSize: '0.85rem'
                                        }}>
                                            Client: <strong>
                                                {project.client_details?.username}
                                            </strong>
                                            &nbsp;•&nbsp;
                                            Started: {new Date(project.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span className={`badge ${getPaymentBadge(project.payment_status)}`}>
                                            💰 {project.payment_status.replace('_', ' ')}
                                        </span>
                                        <span className={`badge ${getWorkBadge(project.work_status)}`}>
                                            🔧 {project.work_status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Escrow */}
                                <div style={{
                                    background: '#fdf4ff',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <span style={{ fontSize: '1.5rem' }}>💰</span>
                                    <div>
                                        <div style={{
                                            fontSize: '0.78rem',
                                            color: '#888',
                                            fontWeight: 600,
                                            textTransform: 'uppercase'
                                        }}>
                                            Your Earning
                                        </div>
                                        <div style={{
                                            fontSize: '1.4rem',
                                            fontWeight: 800,
                                            color: '#f5576c'
                                        }}>
                                            ${project.escrow_amount}
                                        </div>
                                    </div>
                                </div>

                                {/* Revision Notes Alert */}
                                {project.work_status === 'revision_requested' &&
                                    project.revision_notes && (
                                    <div style={{
                                        background: '#fff3e0',
                                        border: '2px solid #ffb74d',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{
                                            fontWeight: 700,
                                            color: '#e65100',
                                            marginBottom: '8px',
                                            fontSize: '0.9rem'
                                        }}>
                                            🔄 Revision Requested by Client
                                        </div>
                                        <p style={{
                                            color: '#555',
                                            fontSize: '0.88rem',
                                            lineHeight: 1.6
                                        }}>
                                            {project.revision_notes}
                                        </p>
                                    </div>
                                )}

                                {/* Latest Submission */}
                                {project.latest_submission && (
                                    <div style={{
                                        background: '#f0fff4',
                                        border: '1px solid #b2dfdb',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{
                                            fontWeight: 700,
                                            color: '#2e7d32',
                                            marginBottom: '8px',
                                            fontSize: '0.88rem'
                                        }}>
                                            ✅ Your Last Submission
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '16px',
                                            fontSize: '0.85rem',
                                            flexWrap: 'wrap'
                                        }}>
                                            {project.latest_submission.github_link && (
                                                <a
                                                    href={project.latest_submission.github_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        color: '#6c63ff',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    🐙 GitHub
                                                </a>
                                            )}
                                            {project.latest_submission.website_url && (
                                                <a
                                                    href={project.latest_submission.website_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        color: '#6c63ff',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    🌐 Live URL
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Approved Banner */}
                                {project.work_status === 'approved' && (
                                    <div style={{
                                        background: '#f0fff4',
                                        border: '2px solid #00c853',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        marginBottom: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <strong style={{ color: '#2e7d32' }}>
                                            🎉 Work Approved! ${project.escrow_amount} credited to your wallet.
                                        </strong>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    flexWrap: 'wrap'
                                }}>
                                    {/* Submit Work button */}
                                    {project.payment_status === 'locked' &&
                                        project.work_status !== 'approved' && (
                                        <Link
                                            to={`/freelancer/projects/${project.id}/submit`}
                                            className="btn-primary"
                                            style={{
                                                background: 'linear-gradient(135deg, #f093fb, #f5576c)'
                                            }}
                                        >
                                            {project.work_status === 'revision_requested'
                                                ? '🔄 Resubmit Work'
                                                : '📤 Submit Work'
                                            }
                                        </Link>
                                    )}

                                    {/* Payment not locked yet */}
                                    {project.payment_status === 'pending' && (
                                        <div style={{
                                            padding: '10px 16px',
                                            background: '#fff3e0',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            color: '#e65100',
                                            fontWeight: 600
                                        }}>
                                            ⏳ Waiting for client to lock payment
                                        </div>
                                    )}

                                    {/* Chat */}
                                    <Link
                                        to={`/projects/${project.id}/chat`}
                                        className="btn-outline"
                                    >
                                        💬 Chat with Client
                                    </Link>

                                    {/* Raise Dispute */}
                                    {project.payment_status === 'locked' && (
                                        <Link
                                            to={`/disputes?project=${project.id}`}
                                            className="btn-danger"
                                        >
                                            ⚖️ Raise Dispute
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