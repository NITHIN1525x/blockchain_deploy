// src/pages/ProfilePage.jsx
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import API from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Chat.css'
import '../css/Dashboard.css'
import '../css/Jobs.css'

export default function ProfilePage() {
    const { user, login, token } = useAuth()
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        username: user?.username || '',
        bio: user?.bio || '',
        skills: user?.skills || '',
        wallet_address: user?.wallet_address || '',
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await API.put('/profile/', formData)
            // Update context with new user data
            login(res.data, token)
            toast.success('Profile updated successfully! ✅')
            setEditing(false)
        } catch (err) {
            toast.error('Failed to update profile.')
        } finally {
            setSaving(false)
        }
    }

    const isFreelancer = user?.role === 'freelancer'

    return (
        <div className="profile-page">

            {/* Profile Header */}
            <div className={`profile-header-card ${isFreelancer ? 'freelancer' : ''}`}
                style={{
                    background: isFreelancer
                        ? 'linear-gradient(135deg, #f093fb, #f5576c)'
                        : 'linear-gradient(135deg, #6c63ff, #5a52d5)'
                }}
            >
                <div className={`profile-avatar-large ${isFreelancer ? 'freelancer' : ''}`}>
                    {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="profile-header-info">
                    <h1>{user?.username}</h1>
                    <p>{user?.email}</p>
                    <span className="profile-role-tag">
                        {isFreelancer ? '🚀' : '💼'} {user?.role}
                    </span>
                    {isFreelancer && (
                        <div style={{
                            marginTop: '10px',
                            fontSize: '1.1rem',
                            fontWeight: 700
                        }}>
                            💰 Balance: ${parseFloat(user?.balance || 0).toFixed(2)}
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Info Card */}
            <div className="dashboard-card">
                <div className="card-header">
                    <h2>Profile Information</h2>
                    {!editing && (
                        <button
                            className="btn-card-action"
                            onClick={() => setEditing(true)}
                            style={{
                                background: isFreelancer
                                    ? 'linear-gradient(135deg, #f093fb, #f5576c)'
                                    : undefined
                            }}
                        >
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                {!editing ? (
                    /* View Mode */
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <div>
                            <p style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#aaa',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '6px'
                            }}>
                                Username
                            </p>
                            <p style={{ color: '#2d2d2d', fontWeight: 600 }}>
                                {user?.username}
                            </p>
                        </div>

                        <div>
                            <p style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#aaa',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '6px'
                            }}>
                                Email
                            </p>
                            <p style={{ color: '#2d2d2d', fontWeight: 600 }}>
                                {user?.email}
                            </p>
                        </div>

                        <div>
                            <p style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#aaa',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '6px'
                            }}>
                                Bio
                            </p>
                            <p style={{ color: '#555', lineHeight: 1.7 }}>
                                {user?.bio || 'No bio added yet.'}
                            </p>
                        </div>

                        {isFreelancer && (
                            <div>
                                <p style={{
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    color: '#aaa',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '10px'
                                }}>
                                    Skills
                                </p>
                                {user?.skills ? (
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {user.skills.split(',').map((skill, i) => (
                                            <span key={i} className="badge badge-purple">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#888' }}>No skills added yet.</p>
                                )}
                            </div>
                        )}

                        <div>
                            <p style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#aaa',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '6px'
                            }}>
                                Wallet Address (Optional)
                            </p>
                            <p style={{
                                color: '#555',
                                fontFamily: 'monospace',
                                fontSize: '0.88rem'
                            }}>
                                {user?.wallet_address || 'Not set'}
                            </p>
                        </div>

                        <div>
                            <p style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#aaa',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '6px'
                            }}>
                                Member Since
                            </p>
                            <p style={{ color: '#555' }}>
                                {new Date(user?.date_joined).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Edit Mode */
                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                {isFreelancer
                                    ? 'Bio / About You'
                                    : 'About Your Business'
                                }
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell others about yourself..."
                            />
                        </div>

                        {isFreelancer && (
                            <div className="form-group">
                                <label>Skills (comma separated)</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    placeholder="React, Django, Python..."
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Wallet Address (Optional)</label>
                            <input
                                type="text"
                                name="wallet_address"
                                value={formData.wallet_address}
                                onChange={handleChange}
                                placeholder="0x..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{
                                    padding: '12px 28px',
                                    background: isFreelancer
                                        ? 'linear-gradient(135deg, #f093fb, #f5576c)'
                                        : undefined
                                }}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : '💾 Save Changes'}
                            </button>
                            <button
                                type="button"
                                className="btn-outline"
                                style={{ padding: '12px 20px' }}
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}