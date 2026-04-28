// src/pages/client/MyPostedJobs.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../../api/axios.js'
import ClientSidebar from '../../components/ClientSidebar.jsx'
import '../../css/Dashboard.css'
import '../../css/Jobs.css'

export default function MyPostedJobs() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            const res = await API.get('/jobs/my-jobs/')
            setJobs(res.data)
        } catch (err) {
            toast.error('Failed to load jobs.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return
        try {
            await API.delete(`/jobs/${jobId}/delete/`)
            toast.success('Job deleted successfully.')
            setJobs(jobs.filter(j => j.id !== jobId))
        } catch (err) {
            toast.error('Failed to delete job.')
        }
    }

    const getStatusBadge = (status) => {
        const map = {
            open: 'badge-success',
            assigned: 'badge-info',
            completed: 'badge-purple',
            closed: 'badge-gray',
        }
        return map[status] || 'badge-gray'
    }

    return (
        <div className="dashboard-layout">
            <ClientSidebar />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h1>My Posted Jobs</h1>
                    <p>Manage all your job postings here.</p>
                </div>

                {/* Top Action */}
                <div style={{ marginBottom: '24px' }}>
                    <Link to="/client/post-job" className="btn-primary">
                        ➕ Post New Job
                    </Link>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>All Jobs ({jobs.length})</h2>
                    </div>

                    {loading ? (
                        <div className="spinner"></div>
                    ) : jobs.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">📭</span>
                            <h3>No jobs posted yet</h3>
                            <p>Start by posting your first job!</p>
                            <Link to="/client/post-job" className="btn-primary">
                                Post a Job
                            </Link>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Budget</th>
                                    <th>Deadline</th>
                                    <th>Proposals</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(job => (
                                    <tr key={job.id}>
                                        <td>
                                            <strong>{job.title}</strong>
                                            <div style={{
                                                fontSize: '0.78rem',
                                                color: '#888',
                                                marginTop: '2px'
                                            }}>
                                                {job.skills_required}
                                            </div>
                                        </td>
                                        <td style={{ textTransform: 'capitalize' }}>
                                            {job.category.replace('_', ' ')}
                                        </td>
                                        <td><strong>${job.budget}</strong></td>
                                        <td>{job.deadline}</td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>
                                                {job.proposal_count}
                                            </span> proposals
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <Link
                                                    to={`/client/applicants/${job.id}`}
                                                    className="btn-outline"
                                                >
                                                    Proposals
                                                </Link>
                                                {job.status === 'open' && (
                                                    <button
                                                        className="btn-danger"
                                                        onClick={() => handleDelete(job.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
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