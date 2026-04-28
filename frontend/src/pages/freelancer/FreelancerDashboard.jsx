// src/pages/freelancer/FreelancerDashboard.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'
import FreelancerSidebar from '../../components/FreelancerSidebar.jsx'
import '../../css/Dashboard.css'

export default function FreelancerDashboard() {
    const { user } = useAuth()
    const [proposals, setProposals] = useState([])
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [proposalsRes, projectsRes] = await Promise.all([
                    API.get('/proposals/my-proposals/'),
                    API.get('/projects/'),
                ])
                setProposals(proposalsRes.data)
                setProjects(projectsRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const pendingProposals = proposals.filter(p => p.status === 'pending').length
    const acceptedProposals = proposals.filter(p => p.status === 'accepted').length
    const activeProjects = projects.filter(p => p.work_status === 'in_progress').length
    const revisionProjects = projects.filter(p => p.work_status === 'revision_requested').length

    return (
        <div className="dashboard-layout">
            <FreelancerSidebar />

            <main className="dashboard-main">
                {/* Header */}
                <div className="dashboard-header">
                    <h1>Welcome, {user?.username}! 🚀</h1>
                    <p>Here's your freelance activity overview.</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-icon pink">📨</div>
                        <div className="stat-card-info">
                            <h3>{pendingProposals}</h3>
                            <p>Pending Proposals</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon green">✅</div>
                        <div className="stat-card-info">
                            <h3>{acceptedProposals}</h3>
                            <p>Accepted Proposals</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon blue">🚀</div>
                        <div className="stat-card-info">
                            <h3>{activeProjects}</h3>
                            <p>Active Projects</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon orange">💰</div>
                        <div className="stat-card-info">
                            <h3>${user?.balance || '0.00'}</h3>
                            <p>Wallet Balance</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <Link to="/jobs" className="quick-action-btn pink">
                        <span className="quick-action-icon">🔍</span>
                        <span>Browse Jobs</span>
                    </Link>
                    <Link to="/freelancer/applications" className="quick-action-btn pink">
                        <span className="quick-action-icon">📨</span>
                        <span>My Applications</span>
                    </Link>
                    <Link to="/freelancer/projects" className="quick-action-btn pink">
                        <span className="quick-action-icon">🚀</span>
                        <span>My Projects</span>
                    </Link>
                    <Link to="/freelancer/wallet" className="quick-action-btn pink">
                        <span className="quick-action-icon">💰</span>
                        <span>My Wallet</span>
                    </Link>
                </div>

                {/* Revision Needed Alert */}
                {revisionProjects > 0 && (
                    <div style={{
                        background: '#fff3e0',
                        border: '2px solid #ffb74d',
                        borderRadius: '14px',
                        padding: '20px 24px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div>
                            <strong style={{ color: '#e65100' }}>
                                🔄 {revisionProjects} project(s) need revision!
                            </strong>
                            <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '4px' }}>
                                Client has requested changes. Please review and resubmit.
                            </p>
                        </div>
                        <Link to="/freelancer/projects" className="btn-primary">
                            View Projects
                        </Link>
                    </div>
                )}

                {/* Recent Proposals */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Recent Proposals</h2>
                        <Link to="/freelancer/applications" className="btn-card-action pink">
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div className="spinner"></div>
                    ) : proposals.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">📭</span>
                            <h3>No proposals yet</h3>
                            <p>Browse jobs and start applying!</p>
                            <Link to="/jobs" className="btn-primary">
                                Browse Jobs
                            </Link>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Bid Amount</th>
                                    <th>Delivery</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proposals.slice(0, 5).map(proposal => (
                                    <tr key={proposal.id}>
                                        <td>
                                            <strong>
                                                {proposal.job_details?.title}
                                            </strong>
                                        </td>
                                        <td>${proposal.bid_amount}</td>
                                        <td>{proposal.delivery_days} days</td>
                                        <td>
                                            <span className={`badge ${
                                                proposal.status === 'pending' ? 'badge-warning' :
                                                proposal.status === 'accepted' ? 'badge-success' :
                                                'badge-danger'
                                            }`}>
                                                {proposal.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Active Projects */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Active Projects</h2>
                        <Link to="/freelancer/projects" className="btn-card-action pink">
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div className="spinner"></div>
                    ) : projects.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">🚀</span>
                            <h3>No active projects</h3>
                            <p>Get a proposal accepted to start a project!</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Client</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Work Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.slice(0, 5).map(project => (
                                    <tr key={project.id}>
                                        <td>
                                            <strong>{project.job_details?.title}</strong>
                                        </td>
                                        <td>{project.client_details?.username}</td>
                                        <td>${project.escrow_amount}</td>
                                        <td>
                                            <span className={`badge ${
                                                project.payment_status === 'locked' ? 'badge-info' :
                                                project.payment_status === 'released' ? 'badge-success' :
                                                project.payment_status === 'on_hold' ? 'badge-danger' :
                                                'badge-warning'
                                            }`}>
                                                {project.payment_status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                project.work_status === 'in_progress' ? 'badge-info' :
                                                project.work_status === 'submitted' ? 'badge-purple' :
                                                project.work_status === 'revision_requested' ? 'badge-warning' :
                                                'badge-success'
                                            }`}>
                                                {project.work_status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/freelancer/projects/${project.id}/submit`}
                                                className="btn-outline"
                                            >
                                                Submit Work
                                            </Link>
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