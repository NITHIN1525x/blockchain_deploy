// src/pages/ChatPage.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/Chat.css'

export default function ChatPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const [project, setProject] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        fetchData()
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000)
        return () => clearInterval(interval)
    }, [id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchData = async () => {
        try {
            const [projectRes, messagesRes] = await Promise.all([
                API.get(`/projects/${id}/`),
                API.get(`/projects/${id}/messages/`),
            ])
            setProject(projectRes.data)
            setMessages(messagesRes.data.messages || [])
        } catch (err) {
            toast.error('Failed to load chat.')
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async () => {
        try {
            const res = await API.get(`/projects/${id}/messages/`)
            setMessages(res.data.messages || [])
        } catch (err) {
            console.error(err)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        setSending(true)
        try {
            await API.post(`/projects/${id}/messages/send/`, { text })
            setText('')
            fetchMessages()
            inputRef.current?.focus()
        } catch (err) {
            toast.error('Failed to send message.')
        } finally {
            setSending(false)
        }
    }

    const handleKeyDown = (e) => {
        // Send on Enter (not Shift+Enter)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend(e)
        }
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const isMyMessage = (msg) => msg.sender === user?.id

    // Get back link based on role
    const backLink = user?.role === 'client'
        ? '/client/projects'
        : '/freelancer/projects'

    return (
        <div className="chat-layout">
            <div className="chat-container">

                {/* Back Link */}
                <Link
                    to={backLink}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#6c63ff',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        marginBottom: '16px',
                        textDecoration: 'none'
                    }}
                >
                    ← Back to Projects
                </Link>

                <div className="chat-card">

                    {/* Chat Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <h2>
                                💬 {project?.job_details?.title || 'Project Chat'}
                            </h2>
                            <p>
                                {user?.role === 'client'
                                    ? `Chatting with ${project?.freelancer_details?.username}`
                                    : `Chatting with ${project?.client_details?.username}`
                                }
                                &nbsp;•&nbsp;
                                Escrow: ${project?.escrow_amount}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span className={`badge ${
                                project?.work_status === 'approved'
                                    ? 'badge-success'
                                    : 'badge-info'
                            }`}>
                                {project?.work_status?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Messages */}
                    {loading ? (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="chat-messages">
                            {messages.length === 0 ? (
                                <div className="chat-empty">
                                    <span className="chat-empty-icon">💬</span>
                                    <p style={{ fontWeight: 600, color: '#888' }}>
                                        No messages yet
                                    </p>
                                    <p style={{ fontSize: '0.85rem' }}>
                                        Start the conversation!
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const mine = isMyMessage(msg)
                                    const isFreelancer =
                                        msg.sender_details?.role === 'freelancer'
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`message-row ${mine ? 'mine' : ''}`}
                                        >
                                            {/* Avatar */}
                                            {!mine && (
                                                <div className={`message-avatar ${isFreelancer ? 'freelancer' : ''}`}>
                                                    {msg.sender_details?.username?.[0]?.toUpperCase()}
                                                </div>
                                            )}

                                            <div>
                                                {/* Sender name for others */}
                                                {!mine && (
                                                    <div className="message-sender">
                                                        {msg.sender_details?.username}
                                                    </div>
                                                )}
                                                <div className="message-bubble">
                                                    {msg.text}
                                                    {/* Attachment */}
                                                    {msg.attachment && (
                                                        <div style={{ marginTop: '8px' }}>
                                                            <a
                                                                href={msg.attachment}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                style={{
                                                                    color: mine
                                                                        ? 'rgba(255,255,255,0.8)'
                                                                        : '#6c63ff',
                                                                    fontSize: '0.82rem',
                                                                    textDecoration: 'underline'
                                                                }}
                                                            >
                                                                📎 Attachment
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="message-time">
                                                    {formatTime(msg.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="chat-input-area">
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={handleSend}
                            disabled={sending || !text.trim()}
                        >
                            ➤
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}