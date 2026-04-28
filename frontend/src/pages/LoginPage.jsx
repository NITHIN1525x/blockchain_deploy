// src/pages/LoginPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Auth.css'

export default function LoginPage() {
    const [searchParams] = useSearchParams()
    // Get role from URL: /login?role=client or /login?role=freelancer
    const roleFromURL = searchParams.get('role')

    const [step, setStep] = useState(roleFromURL ? 'form' : 'select')
    const [role, setRole] = useState(roleFromURL || '')
    const [formData, setFormData] = useState({ email: '', password: '' })
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
            const res = await API.post('/login/', formData)
            const { user, tokens } = res.data

            // Check role matches
            if (user.role !== role) {
                setError(`This account is registered as a ${user.role}, not a ${role}.`)
                setLoading(false)
                return
            }

            // Save to context + localStorage
            login(user, tokens.access)
            toast.success(`Welcome back, ${user.username}! 🎉`)

            // Redirect based on role
            if (user.role === 'client') {
                navigate('/client/dashboard')
            } else {
                navigate('/freelancer/dashboard')
            }

        } catch (err) {
            const msg = err.response?.data?.error || 'Login failed. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    // ── Step 1: Role Selection ─────────────────
    if (step === 'select') {
        return (
            <div className="role-selector-page">
                <div className="role-selector-box">
                    <h1>Welcome Back! 👋</h1>
                    <p>Choose how you want to log in</p>

                    <div className="role-cards">
                        {/* Client Login */}
                        <div
                            className="role-select-card client-card"
                            onClick={() => handleRoleSelect('client')}
                        >
                            <span className="card-icon">💼</span>
                            <h3>Client</h3>
                            <p>Login to post jobs and manage projects</p>
                        </div>

                        {/* Freelancer Login */}
                        <div
                            className="role-select-card freelancer-card"
                            onClick={() => handleRoleSelect('freelancer')}
                        >
                            <span className="card-icon">🚀</span>
                            <h3>Freelancer</h3>
                            <p>Login to find work and submit proposals</p>
                        </div>
                    </div>

                    <p className="auth-redirect">
                        Don't have an account?{' '}
                        <Link to="/register">Sign up free</Link>
                    </p>
                </div>
            </div>
        )
    }

    // ── Step 2: Login Form ─────────────────────
    return (
        <div className="auth-page">
            <div className="auth-box">

                {/* Back button */}
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
                        {role === 'client' ? '💼 Client Login' : '🚀 Freelancer Login'}
                    </span>
                </div>

                <h2>
                    {role === 'client' ? 'Client Login' : 'Freelancer Login'}
                </h2>
                <p className="auth-subtitle">
                    {role === 'client'
                        ? 'Manage your projects and hired freelancers.'
                        : 'Find jobs and track your active projects.'
                    }
                </p>

                {/* Error */}
                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit}>
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

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn-auth ${role}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : `Login as ${role === 'client' ? 'Client' : 'Freelancer'}`}
                    </button>
                </form>

                <div className="auth-divider">or</div>

                <p className="auth-redirect">
                    Don't have an account?{' '}
                    <Link to={`/register?role=${role}`}>
                        Register as {role === 'client' ? 'Client' : 'Freelancer'}
                    </Link>
                </p>

            </div>
        </div>
    )
}