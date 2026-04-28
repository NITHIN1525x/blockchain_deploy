// src/pages/JobDetailPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Jobs.css'
import '../css/Dashboard.css'
import '../css/Proposals.css'

export default function JobDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showApplyForm, setShowApplyForm] = useState(false)
    const [applying, setApplying] = useState(false)
    const [alreadyApplied, setAlreadyApplied] = useState(false)
    const [formData, setFormData] = useState({
        message: '',
        bid_amount: '',
        delivery_days: '',
    })

    useEffect(() => {
        fetchJob()
    }, [id])

    const fetchJob = async () => {
        try {
            const res = await API.get(`/jobs/${id}/`)
            setJob(res.data)

            // Check if freelancer already applied
            if (user?.role === 'freelancer') {
                try {
                    const proposalsRes = await API.get('/proposals/my-proposals/')
                    const applied = proposalsRes.data.some(
                        p => p.job === parseInt(id)
                    )
                    setAlreadyApplied(applied)
                } catch (err) {
                    console.error(err)
                }
            }
        } catch (err) {
            toast.error('Failed to load job.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleApply = async (e) => {
        e.preventDefault()
        if (!user) {
            navigate('/login?role=freelancer')
            return
        }
        setApplying(true)
        try {
            await API.post(`/jobs/${id}/apply/`, formData)
            toast.success('Proposal submitted successfully! 🎉')
            setAlreadyApplied(true)
            setShowApplyForm(false)
        } catch (err) {
            toast.error(
                err.response?.data?.error ||
                err.response?.data?.non_field_errors?.[0] ||
                'Failed to submit proposal.'
            )
        } finally {
            setApplying(false)
        }
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#f4f6fc' }}>
            <div className="spinner"></div>
        </div>
    )

    if (!job) return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <h2>Job not found.</h2>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6fc', padding: '32px 24px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* Back */}
                <Link
                    to="/jobs"
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
                    ← Back to Jobs
                </Link>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* Main Content */}
                    <div style={{ flex: 1, minWidth: '300px' }}>

                        {/* Job Header Card */}
                        <div style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '32px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '16px',
                                flexWrap: 'wrap',
                                gap: '12px'
                            }}>
                                <div>
                                    <span className="badge badge-purple" style={{ marginBottom: '10px' }}>
                                        {job.category.replace('_', ' ')}
                                    </span>
                                    <h1 style={{
                                        fontSize: '1.6rem',
                                        fontWeight: 800,
                                        color: '#2d2d2d',
                                        lineHeight: 1.3
                                    }}>
                                        {job.title}
                                    </h1>
                                </div>
                                <span className={`badge ${
                                    job.status === 'open' ? 'badge-success' : 'badge-gray'
                                }`}>
                                    {job.status}
                                </span>
                            </div>

                            <p style={{
                                fontSize: '0.85rem',
                                color: '#888',
                                marginBottom: '20px'
                            }}>
                                Posted by <strong>{job.client_details?.username}</strong>
                                &nbsp;•&nbsp;
                                {new Date(job.created_at).toLocaleDateString()}
                            </p>

                            <p style={{
                                color: '#444',
                                lineHeight: 1.8,
                                fontSize: '0.95rem',
                                marginBottom: '24px'
                            }}>
                                {job.description}
                            </p>

                            {/* Skills */}
                            {job.skills_required && (
                                <div style={{ marginBottom: '20px' }}>
                                    <p style={{
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        color: '#aaa',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '10px'
                                    }}>
                                        Skills Required
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {job.skills_required.split(',').map((skill, i) => (
                                            <span key={i} className="badge badge-gray">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Apply Section */}
                        {user?.role === 'freelancer' && job.status === 'open' && (
                            <div style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '28px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                marginBottom: '20px'
                            }}>
                                {alreadyApplied ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '20px'
                                    }}>
                                        <span style={{ fontSize: '2.5rem' }}>✅</span>
                                        <h3 style={{
                                            color: '#2e7d32',
                                            margin: '12px 0 8px',
                                            fontWeight: 700
                                        }}>
                                            Proposal Submitted!
                                        </h3>
                                        <p style={{ color: '#888', fontSize: '0.9rem' }}>
                                            You've already applied to this job.
                                            Check your applications for updates.
                                        </p>
                                        <Link
                                            to="/freelancer/applications"
                                            className="btn-primary"
                                            style={{ marginTop: '16px', display: 'inline-block' }}
                                        >
                                            View My Applications
                                        </Link>
                                    </div>
                                ) : !showApplyForm ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <h3 style={{
                                            fontWeight: 700,
                                            marginBottom: '8px',
                                            color: '#2d2d2d'
                                        }}>
                                            Interested in this job?
                                        </h3>
                                        <p style={{
                                            color: '#888',
                                            fontSize: '0.9rem',
                                            marginBottom: '20px'
                                        }}>
                                            Submit your proposal with your bid and timeline.
                                        </p>
                                        <button
                                            className="btn-apply"
                                            onClick={() => setShowApplyForm(true)}
                                        >
                                            🚀 Apply Now
                                        </button>
                                    </div>
                                ) : (
                                    /* Apply Form */
                                    <div>
                                        <h3 style={{
                                            fontWeight: 700,
                                            marginBottom: '20px',
                                            color: '#2d2d2d'
                                        }}>
                                            Submit Your Proposal
                                        </h3>
                                        <form onSubmit={handleApply}>
                                            <div className="apply-form-row">
                                                <div className="form-group">
                                                    <label>Your Bid Amount (USD) *</label>
                                                    <input
                                                        type="number"
                                                        name="bid_amount"
                                                        placeholder="e.g. 450"
                                                        min="1"
                                                        value={formData.bid_amount}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Delivery Time (days) *</label>
                                                    <input
                                                        type="number"
                                                        name="delivery_days"
                                                        placeholder="e.g. 7"
                                                        min="1"
                                                        value={formData.delivery_days}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Your Proposal Message *</label>
                                                <textarea
                                                    name="message"
                                                    placeholder="Describe your approach, relevant experience, and why you're the best fit for this job..."
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                    style={{ minHeight: '130px' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button
                                                    type="submit"
                                                    className="btn-apply"
                                                    disabled={applying}
                                                >
                                                    {applying ? 'Submitting...' : '📨 Submit Proposal'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-cancel"
                                                    onClick={() => setShowApplyForm(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Not logged in CTA */}
                        {!user && (
                            <div style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '28px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ marginBottom: '12px', color: '#2d2d2d' }}>
                                    Want to apply for this job?
                                </h3>
                                <p style={{
                                    color: '#888',
                                    marginBottom: '20px',
                                    fontSize: '0.9rem'
                                }}>
                                    Create a freelancer account to submit proposals.
                                </p>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <Link
                                        to="/register?role=freelancer"
                                        className="btn-apply"
                                    >
                                        Sign Up as Freelancer
                                    </Link>
                                    <Link
                                        to="/login?role=freelancer"
                                        className="btn-outline"
                                    >
                                        Login
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div style={{ width: '260px', flexShrink: 0 }}>

                        {/* Job Stats Card */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}>
                                <div>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#aaa',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '4px'
                                    }}>
                                        Budget
                                    </p>
                                    <p style={{
                                        fontSize: '1.6rem',
                                        fontWeight: 800,
                                        color: '#6c63ff'
                                    }}>
                                        ${job.budget}
                                    </p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#aaa',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '4px'
                                    }}>
                                        Deadline
                                    </p>
                                    <p style={{
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        color: '#2d2d2d'
                                    }}>
                                        📅 {job.deadline}
                                    </p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#aaa',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '4px'
                                    }}>
                                        Proposals
                                    </p>
                                    <p style={{
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        color: '#2d2d2d'
                                    }}>
                                        📨 {job.proposal_count} submitted
                                    </p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#aaa',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '4px'
                                    }}>
                                        Status
                                    </p>
                                    <span className={`badge ${
                                        job.status === 'open' ? 'badge-success' : 'badge-gray'
                                    }`}>
                                        {job.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Client Card */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                        }}>
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#aaa',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '14px'
                            }}>
                                About the Client
                            </p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                }}>
                                    {job.client_details?.username?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, color: '#2d2d2d' }}>
                                        {job.client_details?.username}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: '#888' }}>
                                        Client
                                    </p>
                                </div>
                            </div>
                            {job.client_details?.bio && (
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: '#666',
                                    lineHeight: 1.6
                                }}>
                                    {job.client_details.bio}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}