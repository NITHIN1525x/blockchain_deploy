// src/pages/freelancer/MyApplications.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../../api/axios.js'
import FreelancerSidebar from '../../components/FreelancerSidebar.jsx'
import '../../css/Dashboard.css'
import '../../css/Proposals.css'

export default function MyApplications() {
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchProposals()
    }, [])

    const fetchProposals = async () => {
        try {
            const res = await API.get('/proposals/my-proposals/')
            setProposals(res.data)
        } catch (err) {
            toast.error('Failed to load proposals.')
        } finally {
            setLoading(false)
        }
    }

    const filtered = filter === 'all'
        ? proposals
        : proposals.filter(p => p.status === filter)

    return (
        <div className="dashboard-layout">
            <FreelancerSidebar />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h1>My Applications</h1>
                    <p>Track all your job proposals here.</p>
                </div>

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '24px',
                    flexWrap: 'wrap'
                }}>
                    {['all', 'pending', 'accepted', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '20px',
                                border: '2px solid',
                                borderColor: filter === f ? '#f5576c' : '#e0e0e0',
                                background: filter === f ? '#f5576c' : 'white',
                                color: filter === f ? 'white' : '#666',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {f} ({f === 'all'
                                ? proposals.length
                                : proposals.filter(p => p.status === f).length
                            })
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="spinner"></div>
                ) : filtered.length === 0 ? (
                    <div className="dashboard-card">
                        <div className="empty-state">
                            <span className="empty-state-icon">📭</span>
                            <h3>No proposals found</h3>
                            <p>Browse jobs and start applying!</p>
                            <Link to="/jobs" className="btn-primary">
                                Browse Jobs
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="proposals-list">
                        {filtered.map(proposal => (
                            <div
                                key={proposal.id}
                                className={`proposal-card ${proposal.status}`}
                            >
                                {/* Header */}
                                <div className="proposal-header">
                                    <div>
                                        <h3 style={{
                                            fontSize: '1.05rem',
                                            fontWeight: 700,
                                            color: '#2d2d2d',
                                            marginBottom: '4px'
                                        }}>
                                            {proposal.job_details?.title}
                                        </h3>
                                        <p style={{
                                            fontSize: '0.82rem',
                                            color: '#888'
                                        }}>
                                            Budget: ${proposal.job_details?.budget}
                                            &nbsp;•&nbsp;
                                            Applied: {new Date(proposal.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`badge ${
                                        proposal.status === 'pending' ? 'badge-warning' :
                                        proposal.status === 'accepted' ? 'badge-success' :
                                        'badge-danger'
                                    }`}>
                                        {proposal.status}
                                    </span>
                                </div>

                                {/* Meta */}
                                <div className="proposal-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">Your Bid</span>
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
                                </div>

                                {/* Message */}
                                <div className="proposal-message">
                                    {proposal.message}
                                </div>

                                {/* If accepted, show project link */}
                                {proposal.status === 'accepted' && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <span style={{
                                            color: '#2e7d32',
                                            fontWeight: 600,
                                            fontSize: '0.9rem'
                                        }}>
                                            ✅ Accepted! Project has started.
                                        </span>
                                        <Link
                                            to="/freelancer/projects"
                                            className="btn-outline"
                                        >
                                            View Project
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}