// src/pages/JobsListPage.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Jobs.css'
import '../css/Dashboard.css'

const CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'web_dev', label: 'Web Development' },
    { value: 'mobile_dev', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'writing', label: 'Writing' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'data', label: 'Data Science' },
    { value: 'other', label: 'Other' },
]

export default function JobsListPage() {
    const { user } = useAuth()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [searchInput, setSearchInput] = useState('')

    useEffect(() => {
        fetchJobs()
    }, [search, category])

    const fetchJobs = async () => {
        setLoading(true)
        try {
            let url = '/jobs/?'
            if (search) url += `search=${search}&`
            if (category) url += `category=${category}`
            const res = await API.get(url)
            setJobs(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setSearch(searchInput)
    }

    const handleCategoryChange = (cat) => {
        setCategory(cat)
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6fc' }}>

            {/* Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #6c63ff, #5a52d5)',
                padding: '48px 24px',
                color: 'white',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    marginBottom: '12px'
                }}>
                    Browse Available Jobs
                </h1>
                <p style={{ opacity: 0.9, marginBottom: '28px', fontSize: '1rem' }}>
                    Find your next project from hundreds of opportunities
                </p>

                {/* Search Bar */}
                <form
                    onSubmit={handleSearch}
                    style={{
                        display: 'flex',
                        maxWidth: '560px',
                        margin: '0 auto',
                        gap: '0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}
                >
                    <input
                        type="text"
                        placeholder="Search jobs by title or keyword..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '16px 20px',
                            border: 'none',
                            fontSize: '0.95rem',
                            outline: 'none',
                            background: 'white',
                            color: '#2d2d2d'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '16px 28px',
                            background: '#ffd700',
                            border: 'none',
                            color: '#2d2d2d',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}
                    >
                        Search
                    </button>
                </form>
            </div>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '32px 24px',
                display: 'flex',
                gap: '28px',
                alignItems: 'flex-start'
            }}>

                {/* Sidebar Filters */}
                <div style={{
                    width: '220px',
                    flexShrink: 0,
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    position: 'sticky',
                    top: '90px'
                }}>
                    <h3 style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#aaa',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '16px'
                    }}>
                        Category
                    </h3>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => handleCategoryChange(cat.value)}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px 14px',
                                marginBottom: '4px',
                                borderRadius: '8px',
                                border: 'none',
                                background: category === cat.value ? '#6c63ff' : 'transparent',
                                color: category === cat.value ? 'white' : '#555',
                                fontWeight: category === cat.value ? 700 : 500,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}

                    {/* Post Job CTA for clients */}
                    {user?.role === 'client' && (
                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                            <Link
                                to="/client/post-job"
                                style={{
                                    display: 'block',
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)',
                                    color: 'white',
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.88rem',
                                    textDecoration: 'none'
                                }}
                            >
                                ➕ Post a Job
                            </Link>
                        </div>
                    )}
                </div>

                {/* Jobs List */}
                <div style={{ flex: 1 }}>

                    {/* Results Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                            {loading ? 'Loading...' : `${jobs.length} jobs found`}
                            {search && ` for "${search}"`}
                        </p>
                        {(search || category) && (
                            <button
                                onClick={() => {
                                    setSearch('')
                                    setSearchInput('')
                                    setCategory('')
                                }}
                                style={{
                                    padding: '6px 16px',
                                    background: 'transparent',
                                    border: '1.5px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '0.82rem',
                                    color: '#666',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear Filters ✕
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="spinner"></div>
                    ) : jobs.length === 0 ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '60px',
                            textAlign: 'center',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                            <h3 style={{ color: '#555', marginBottom: '8px' }}>No jobs found</h3>
                            <p style={{ color: '#888' }}>Try different keywords or clear filters</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            {jobs.map(job => (
                                <div
                                    key={job.id}
                                    style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '24px 28px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                        border: '2px solid transparent',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#6c63ff'
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'transparent'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                    }}
                                >
                                    {/* Job Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '12px',
                                        flexWrap: 'wrap',
                                        gap: '8px'
                                    }}>
                                        <div>
                                            <Link
                                                to={`/jobs/${job.id}`}
                                                style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: 700,
                                                    color: '#2d2d2d',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                {job.title}
                                            </Link>
                                            <p style={{
                                                fontSize: '0.82rem',
                                                color: '#888',
                                                marginTop: '4px'
                                            }}>
                                                by <strong>{job.client_details?.username}</strong>
                                                &nbsp;•&nbsp;
                                                Posted {new Date(job.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 800,
                                            color: '#6c63ff'
                                        }}>
                                            ${job.budget}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p style={{
                                        color: '#555',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.6,
                                        marginBottom: '16px',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {job.description}
                                    </p>

                                    {/* Footer */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '8px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            gap: '8px',
                                            flexWrap: 'wrap'
                                        }}>
                                            <span className="badge badge-purple">
                                                {job.category.replace('_', ' ')}
                                            </span>
                                            {job.skills_required && job.skills_required
                                                .split(',')
                                                .slice(0, 3)
                                                .map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="badge badge-gray"
                                                    >
                                                        {skill.trim()}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px'
                                        }}>
                                            <span style={{
                                                fontSize: '0.82rem',
                                                color: '#888'
                                            }}>
                                                📅 {job.deadline}
                                                &nbsp;•&nbsp;
                                                {job.proposal_count} proposals
                                            </span>
                                            <Link
                                                to={`/jobs/${job.id}`}
                                                className="btn-primary"
                                                style={{ padding: '8px 20px' }}
                                            >
                                                View Job
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}