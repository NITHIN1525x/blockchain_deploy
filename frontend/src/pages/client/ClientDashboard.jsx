// src/pages/client/ClientDashboard.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'
import ClientSidebar from '../../components/ClientSidebar.jsx'
import '../../css/Dashboard.css'

export default function ClientDashboard() {
    const { user } = useAuth()
    const [jobs, setJobs] = useState([])
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, projectsRes] = await Promise.all([
                    API.get('/jobs/my-jobs/'),
                    API.get('/projects/'),
                ])
                setJobs(jobsRes.data)
                setProjects(projectsRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Count stats
    const openJobs = jobs.filter(j => j.status === 'open').length
    const activeProjects = projects.filter(p => p.work_status === 'in_progress').length
    const pendingReview = projects.filter(p => p.work_status === 'submitted').length
    const completed = projects.filter(p => p.work_status === 'approved').length

    return (
        <div className="dashboard-layout">
            <ClientSidebar />

            <main className="dashboard-main">
                {/* Header */}
                <div className="dashboard-header">
                    <h1>Welcome back, {user?.username}! 👋</h1>
                    <p>Here's what's happening with your projects today.</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-icon purple">📋</div>
                        <div className="stat-card-info">
                            <h3>{openJobs}</h3>
                            <p>Open Jobs</p>
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
                        <div className="stat-card-icon orange">👀</div>
                        <div className="stat-card-info">
                            <h3>{pendingReview}</h3>
                            <p>Pending Review</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon green">✅</div>
                        <div className="stat-card-info">
                            <h3>{completed}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <Link to="/client/post-job" className="quick-action-btn">
                        <span className="quick-action-icon">➕</span>
                        <span>Post New Job</span>
                    </Link>
                    <Link to="/client/my-jobs" className="quick-action-btn">
                        <span className="quick-action-icon">📋</span>
                        <span>View My Jobs</span>
                    </Link>
                    <Link to="/client/projects" className="quick-action-btn">
                        <span className="quick-action-icon">🚀</span>
                        <span>My Projects</span>
                    </Link>
                    <Link to="/disputes" className="quick-action-btn">
                        <span className="quick-action-icon">⚖️</span>
                        <span>Disputes</span>
                    </Link>
                </div>

                {/* Recent Jobs */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Recent Jobs</h2>
                        <Link to="/client/my-jobs" className="btn-card-action">
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div className="spinner"></div>
                    ) : jobs.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">📭</span>
                            <h3>No jobs posted yet</h3>
                            <p>Post your first job and start receiving proposals!</p>
                            <Link to="/client/post-job" className="btn-primary">
                                Post a Job
                            </Link>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Budget</th>
                                    <th>Proposals</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.slice(0, 5).map(job => (
                                    <tr key={job.id}>
                                        <td><strong>{job.title}</strong></td>
                                        <td>${job.budget}</td>
                                        <td>{job.proposal_count} proposals</td>
                                        <td>
                                            <span className={`badge badge-${
                                                job.status === 'open' ? 'success' :
                                                job.status === 'assigned' ? 'info' :
                                                job.status === 'completed' ? 'purple' : 'gray'
                                            }`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/client/applicants/${job.id}`}
                                                className="btn-outline"
                                            >
                                                View Proposals
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Projects Needing Review */}
                {pendingReview > 0 && (
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2>🔔 Work Submitted — Needs Your Review</h2>
                            <Link to="/client/projects" className="btn-card-action">
                                View All
                            </Link>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Freelancer</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects
                                    .filter(p => p.work_status === 'submitted')
                                    .map(p => (
                                        <tr key={p.id}>
                                            <td><strong>{p.job_details?.title}</strong></td>
                                            <td>{p.freelancer_details?.username}</td>
                                            <td>${p.escrow_amount}</td>
                                            <td>
                                                <Link
                                                    to={`/client/projects/${p.id}/review`}
                                                    className="btn-primary"
                                                >
                                                    Review Work
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                )}

            </main>
        </div>
    )
}