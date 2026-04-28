// src/pages/client/PostJobPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../../api/axios.js'
import ClientSidebar from '../../components/ClientSidebar.jsx'
import '../../css/Dashboard.css'
import '../../css/Jobs.css'

const CATEGORIES = [
    { value: 'web_dev', label: 'Web Development' },
    { value: 'mobile_dev', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'writing', label: 'Writing' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'data', label: 'Data Science' },
    { value: 'other', label: 'Other' },
]

export default function PostJobPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'web_dev',
        budget: '',
        deadline: '',
        skills_required: '',
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await API.post('/jobs/create/', formData)
            toast.success('Job posted successfully! 🎉')
            navigate('/client/my-jobs')
        } catch (err) {
            const data = err.response?.data
            if (data) {
                const firstError = Object.values(data)[0]
                setError(Array.isArray(firstError) ? firstError[0] : firstError)
            } else {
                setError('Failed to post job. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dashboard-layout">
            <ClientSidebar />

            <main className="dashboard-main">
                <div className="page-header">
                    <h1>Post a New Job</h1>
                    <p>Fill in the details to attract the best freelancers.</p>
                </div>

                <div className="job-form-card">
                    {error && <div className="form-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Title */}
                        <div className="form-group">
                            <label>Job Title *</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Build a React E-commerce Website"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label>Job Description *</label>
                            <textarea
                                name="description"
                                placeholder="Describe the project in detail — what needs to be built, requirements, expectations..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Category + Budget */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Budget (USD) *</label>
                                <input
                                    type="number"
                                    name="budget"
                                    placeholder="e.g. 500"
                                    min="1"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Deadline + Skills */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Deadline *</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Skills Required</label>
                                <input
                                    type="text"
                                    name="skills_required"
                                    placeholder="React, Node.js, Python..."
                                    value={formData.skills_required}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="form-submit-row">
                            <Link to="/client/dashboard" className="btn-cancel">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-submit-job"
                                disabled={loading}
                            >
                                {loading ? 'Posting...' : '🚀 Post Job'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}