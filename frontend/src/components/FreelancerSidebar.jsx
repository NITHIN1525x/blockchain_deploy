// src/components/FreelancerSidebar.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Dashboard.css'

export default function FreelancerSidebar() {
    const { user } = useAuth()
    const location = useLocation()

    const isActive = (path) => location.pathname === path
        ? 'sidebar-link active freelancer-link'
        : 'sidebar-link freelancer-link'

    return (
        <aside className="sidebar">
            {/* User Info */}
            <div className="sidebar-header">
                <div className="sidebar-avatar freelancer">
                    {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="sidebar-name">{user?.username}</div>
                <div className="sidebar-role freelancer">Freelancer</div>
            </div>

            <nav className="sidebar-nav">
                {/* Main */}
                <div className="sidebar-section-title">Main</div>
                <Link to="/freelancer/dashboard" className={isActive('/freelancer/dashboard')}>
                    <span className="sidebar-icon">🏠</span> Dashboard
                </Link>

                {/* Jobs */}
                <div className="sidebar-section-title">Jobs</div>
                <Link to="/jobs" className={isActive('/jobs')}>
                    <span className="sidebar-icon">🔍</span> Browse Jobs
                </Link>
                <Link to="/freelancer/applications" className={isActive('/freelancer/applications')}>
                    <span className="sidebar-icon">📨</span> My Applications
                </Link>

                {/* Projects */}
                <div className="sidebar-section-title">Projects</div>
                <Link to="/freelancer/projects" className={isActive('/freelancer/projects')}>
                    <span className="sidebar-icon">🚀</span> My Projects
                </Link>
                <Link to="/disputes" className={isActive('/disputes')}>
                    <span className="sidebar-icon">⚖️</span> Disputes
                </Link>

                {/* Account */}
                <div className="sidebar-section-title">Account</div>
                <Link to="/freelancer/wallet" className={isActive('/freelancer/wallet')}>
                    <span className="sidebar-icon">💰</span> Wallet & Balance
                </Link>
                <Link to="/profile" className={isActive('/profile')}>
                    <span className="sidebar-icon">👤</span> My Profile
                </Link>
            </nav>
        </aside>
    )
}