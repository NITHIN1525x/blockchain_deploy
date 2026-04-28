// src/components/Navbar.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Navbar.css'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    // Get first letter of username for avatar
    const getInitial = () => {
        if (user && user.username) return user.username[0].toUpperCase()
        return '?'
    }

    // Which dashboard to go to based on role
    const getDashboardLink = () => {
        if (!user) return '/login'
        return user.role === 'client'
            ? '/client/dashboard'
            : '/freelancer/dashboard'
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">

                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="navbar-logo-icon">F</div>
                    <span className="navbar-logo-text">
                        Free<span>Lance</span>
                    </span>
                </Link>

                {/* Center Links */}
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/jobs" className="nav-link">Browse Jobs</Link>
                    {user && (
                        <Link to="/profile" className="nav-link">Profile</Link>
                    )}
                </div>

                {/* Right Side */}
                {!user ? (
                    // Not logged in
                    <div className="navbar-links">
                        <Link to="/login" className="btn-nav-login">Login</Link>
                        <Link to="/register" className="btn-nav-register">Sign Up</Link>
                    </div>
                ) : (
                    // Logged in
                    <div className="navbar-user">
                        <div className="user-avatar">{getInitial()}</div>
                        <div className="user-info">
                            <span className="user-name">{user.username}</span>
                            <span className="user-role">{user.role}</span>
                        </div>
                        <Link to={getDashboardLink()} className="btn-dashboard">
                            Dashboard
                        </Link>
                        <button className="btn-logout" onClick={logout}>
                            Logout
                        </button>
                    </div>
                )}

            </div>
        </nav>
    )
}