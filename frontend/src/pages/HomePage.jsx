// src/pages/HomePage.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Home.css'

export default function HomePage() {
    const { user } = useAuth()

    return (
        <div>

            {/* ── Hero ── */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">🔒 Escrow Protected Payments</div>
                    <h1>
                        The Smarter Way to<br />
                        <span>Hire & Get Hired</span>
                    </h1>
                    <p>
                        Connect with top freelancers worldwide.
                        Post jobs, submit proposals, and get paid
                        securely through our escrow system.
                    </p>
                    <div className="hero-buttons">
                        {!user ? (
                            <>
                                <Link to="/register" className="btn-hero-primary">
                                    Get Started Free →
                                </Link>
                                <Link to="/jobs" className="btn-hero-secondary">
                                    Browse Jobs
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to={user.role === 'client'
                                        ? '/client/dashboard'
                                        : '/freelancer/dashboard'}
                                    className="btn-hero-primary"
                                >
                                    Go to Dashboard →
                                </Link>
                                <Link to="/jobs" className="btn-hero-secondary">
                                    Browse Jobs
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="stats-bar">
                <div className="stats-container">
                    <div className="stat-item">
                        <span className="stat-number">10K+</span>
                        <span className="stat-label">Freelancers</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">5K+</span>
                        <span className="stat-label">Projects Completed</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">$2M+</span>
                        <span className="stat-label">Paid Out</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">98%</span>
                        <span className="stat-label">Satisfaction Rate</span>
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="how-it-works">
                <div className="section-header">
                    <h2>How It Works</h2>
                    <p>Simple, secure, and transparent — from job post to payment.</p>
                </div>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Post a Job</h3>
                        <p>Clients post jobs with budget, deadline, and required skills.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Get Proposals</h3>
                        <p>Freelancers apply with their bid, timeline, and message.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Lock Payment</h3>
                        <p>Client deposits into escrow. Freelancer starts working safely.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">4</div>
                        <h3>Get Paid</h3>
                        <p>Client approves work → payment is instantly released.</p>
                    </div>
                </div>
            </section>

            {/* ── Role Cards ── */}
            <section className="role-section">
                <div className="section-header">
                    <h2>Who Are You?</h2>
                    <p>Choose your path and get started today.</p>
                </div>
                <div className="role-grid">

                    {/* Client Card */}
                    <div className="role-card client">
                        <span className="role-icon">💼</span>
                        <h3>I'm a Client</h3>
                        <p>
                            Looking to hire top talent for your project?
                            Post a job and find the perfect freelancer today.
                        </p>
                        <ul className="role-features">
                            <li>Post unlimited jobs</li>
                            <li>Review proposals & profiles</li>
                            <li>Secure escrow payments</li>
                            <li>Request revisions anytime</li>
                        </ul>
                        <Link
                            to={user ? '/client/dashboard' : '/register'}
                            className="btn-role"
                        >
                            Hire a Freelancer →
                        </Link>
                    </div>

                    {/* Freelancer Card */}
                    <div className="role-card freelancer">
                        <span className="role-icon">🚀</span>
                        <h3>I'm a Freelancer</h3>
                        <p>
                            Ready to showcase your skills and earn money?
                            Browse jobs and submit your best proposals.
                        </p>
                        <ul className="role-features">
                            <li>Browse hundreds of jobs</li>
                            <li>Submit custom proposals</li>
                            <li>Guaranteed secure payments</li>
                            <li>Build your reputation</li>
                        </ul>
                        <Link
                            to={user ? '/freelancer/dashboard' : '/register'}
                            className="btn-role"
                        >
                            Find Work →
                        </Link>
                    </div>

                </div>
            </section>

            {/* ── Features ── */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Why Choose FreeLance?</h2>
                    <p>Everything you need to work smarter.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <span className="feature-icon">🔒</span>
                        <h3>Escrow Protection</h3>
                        <p>
                            Client funds are locked safely until work
                            is approved. No more payment disputes.
                        </p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">💬</span>
                        <h3>Built-in Chat</h3>
                        <p>
                            Communicate directly with clients or freelancers
                            within each project. No third-party tools needed.
                        </p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">⚖️</span>
                        <h3>Dispute Resolution</h3>
                        <p>
                            Admin team reviews disputes fairly and
                            resolves them with full refund or split options.
                        </p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">📁</span>
                        <h3>Work Submissions</h3>
                        <p>
                            Freelancers submit GitHub links, live URLs,
                            or file links — all tracked in one place.
                        </p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🔄</span>
                        <h3>Revision Requests</h3>
                        <p>
                            Not happy? Request revisions with notes.
                            Freelancers resubmit until you're satisfied.
                        </p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">💰</span>
                        <h3>Instant Payouts</h3>
                        <p>
                            Once work is approved, payment hits the
                            freelancer's wallet immediately.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <h2>Ready to Get Started?</h2>
                <p>Join thousands of clients and freelancers today.</p>
                <div className="cta-buttons">
                    <Link to="/register" className="btn-cta-white">
                        Create Free Account
                    </Link>
                    <Link to="/jobs" className="btn-cta-outline">
                        Browse Jobs
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="footer">
                <p>
                    © 2025 <span>FreeLance</span> — Decentralized Freelance Marketplace.
                    Built with ❤️
                </p>
            </footer>

        </div>
    )
}