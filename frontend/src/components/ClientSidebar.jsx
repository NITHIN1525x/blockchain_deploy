// src/components/ClientSidebar.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Dashboard.css'

export default function ClientSidebar() {
    const { user } = useAuth()
    const location = useLocation()

    const isActive = (path) => location.pathname === path ? 'sidebar-link active' : 'sidebar-link'

    return (
        <aside className="sidebar">
            {/* User Info */}
            <div className="sidebar-header">
                <div className="sidebar-avatar">
                    {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="sidebar-name">{user?.username}</div>
                <div className="sidebar-role">Client</div>
            </div>

            <nav className="sidebar-nav">
                {/* Main */}
                <div className="sidebar-section-title">Main</div>
                <Link to="/client/dashboard" className={isActive('/client/dashboard')}>
                    <span className="sidebar-icon">🏠</span> Dashboard
                </Link>
                <Link to="/client/post-job" className={isActive('/client/post-job')}>
                    <span className="sidebar-icon">➕</span> Post a Job
                </Link>

                {/* Jobs */}
                <div className="sidebar-section-title">Jobs</div>
                <Link to="/client/my-jobs" className={isActive('/client/my-jobs')}>
                    <span className="sidebar-icon">📋</span> My Posted Jobs
                </Link>
                <Link to="/jobs" className={isActive('/jobs')}>
                    <span className="sidebar-icon">🔍</span> Browse Jobs
                </Link>

                {/* Projects */}
                <div className="sidebar-section-title">Projects</div>
                <Link to="/client/projects" className={isActive('/client/projects')}>
                    <span className="sidebar-icon">🚀</span> Active Projects
                </Link>
                <Link to="/disputes" className={isActive('/disputes')}>
                    <span className="sidebar-icon">⚖️</span> Disputes
                </Link>

                {/* Account */}
                <div className="sidebar-section-title">Account</div>
                <Link to="/profile" className={isActive('/profile')}>
                    <span className="sidebar-icon">👤</span> My Profile
                </Link>
            </nav>
        </aside>
    )
}