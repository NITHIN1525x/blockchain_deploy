// src/pages/RegisterPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Auth.css'

export default function RegisterPage() {
    const [searchParams] = useSearchParams()
    const roleFromURL = searchParams.get('role')

    const [step, setStep] = useState(roleFromURL ? 'form' : 'select')
    const [role, setRole] = useState(roleFromURL || '')
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        bio: '',
        skills: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole)
        setStep('form')
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await API.post('/register/', {
                ...formData,
                role: role,
            })

            const { user, tokens } = res.data

            login(user, tokens.access)
            toast.success(`Account created! Welcome, ${user.username}! 🎉`)

            if (user.role === 'client') {
                navigate('/client/dashboard')
            } else {
                navigate('/freelancer/dashboard')
            }

        } catch (err) {
            const data = err.response?.data
            if (data) {
                // Show first error from DRF
                const firstError = Object.values(data)[0]
                setError(Array.isArray(firstError) ? firstError[0] : firstError)
            } else {
                setError('Registration failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    // ── Step 1: Role Selection ─────────────────
    if (step === 'select') {
        return (
            <div className="role-selector-page">
                <div className="role-selector-box">
                    <h1>Create Account 🎉</h1>
                    <p>Choose how you want to sign up</p>

                    <div className="role-cards">
                        {/* Client */}
                        <div
                            className="role-select-card client-card"
                            onClick={() => handleRoleSelect('client')}
                        >
                            <span className="card-icon">💼</span>
                            <h3>Client</h3>
                            <p>I want to post jobs and hire freelancers</p>
                        </div>

                        {/* Freelancer */}
                        <div
                            className="role-select-card freelancer-card"
                            onClick={() => handleRoleSelect('freelancer')}
                        >
                            <span className="card-icon">🚀</span>
                            <h3>Freelancer</h3>
                            <p>I want to find work and earn money</p>
                        </div>
                    </div>

                    <p className="auth-redirect">
                        Already have an account?{' '}
                        <Link to="/login">Login here</Link>
                    </p>
                </div>
            </div>
        )
    }

    // ── Step 2: Register Form ──────────────────
    return (
        <div className="auth-page">
            <div className="auth-box">

                {/* Back */}
                <span
                    className="auth-back"
                    onClick={() => setStep('select')}
                    style={{ cursor: 'pointer' }}
                >
                    ← Back
                </span>

                {/* Role Badge */}
                <div>
                    <span className={`auth-role-badge ${role}`}>
                        {role === 'client' ? '💼 Client Registration' : '🚀 Freelancer Registration'}
                    </span>
                </div>

                <h2>
                    {role === 'client' ? 'Create Client Account' : 'Create Freelancer Account'}
                </h2>
                <p className="auth-subtitle">
                    {role === 'client'
                        ? 'Post jobs and hire the best freelancers.'
                        : 'Showcase your skills and start earning.'
                    }
                </p>

                {/* Error */}
                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="register-grid">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Min 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            {role === 'client'
                                ? 'About Your Business (optional)'
                                : 'Bio / About You (optional)'
                            }
                        </label>
                        <textarea
                            name="bio"
                            placeholder={
                                role === 'client'
                                    ? 'Tell freelancers about your company or projects...'
                                    : 'Tell clients about yourself and your experience...'
                            }
                            value={formData.bio}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Skills only for freelancers */}
                    {role === 'freelancer' && (
                        <div className="form-group">
                            <label>Skills (comma separated)</label>
                            <input
                                type="text"
                                name="skills"
                                placeholder="React, Django, Python, UI Design..."
                                value={formData.skills}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`btn-auth ${role}`}
                        disabled={loading}
                    >
                        {loading
                            ? 'Creating Account...'
                            : `Create ${role === 'client' ? 'Client' : 'Freelancer'} Account`
                        }
                    </button>
                </form>

                <div className="auth-divider">or</div>

                <p className="auth-redirect">
                    Already have an account?{' '}
                    <Link to={`/login?role=${role}`}>
                        Login as {role === 'client' ? 'Client' : 'Freelancer'}
                    </Link>
                </p>

            </div>
        </div>
    )
}