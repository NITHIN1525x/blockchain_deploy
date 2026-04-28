// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './context/AuthContext.jsx'

// Pages - Public
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import JobsListPage from './pages/JobsListPage.jsx'
import JobDetailPage from './pages/JobDetailPage.jsx'

// Pages - Client
import ClientDashboard from './pages/client/ClientDashboard.jsx'
import PostJobPage from './pages/client/PostJobPage.jsx'
import MyPostedJobs from './pages/client/MyPostedJobs.jsx'
import ApplicantsPage from './pages/client/ApplicantsPage.jsx'
import ClientProjects from './pages/client/ClientProjects.jsx'
import ReviewSubmission from './pages/client/ReviewSubmission.jsx'

// Pages - Freelancer
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard.jsx'
import MyApplications from './pages/freelancer/MyApplications.jsx'
import FreelancerProjects from './pages/freelancer/FreelancerProjects.jsx'
import SubmitWorkPage from './pages/freelancer/SubmitWorkPage.jsx'
import WalletPage from './pages/freelancer/WalletPage.jsx'

// Pages - Shared
import ChatPage from './pages/ChatPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import DisputesPage from './pages/DisputesPage.jsx'

// Components
import Navbar from './components/Navbar.jsx'

// ── Route Guards ────────────────────────────────────────────

// Any logged in user
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="loading">Loading...</div>
    return user ? children : <Navigate to="/login" />
}

// Only clients
const ClientRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="loading">Loading...</div>
    if (!user) return <Navigate to="/login" />
    if (user.role !== 'client') return <Navigate to="/freelancer/dashboard" />
    return children
}

// Only freelancers
const FreelancerRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="loading">Loading...</div>
    if (!user) return <Navigate to="/login" />
    if (user.role !== 'freelancer') return <Navigate to="/client/dashboard" />
    return children
}

function App() {
    return (
        <Router>
            <Navbar />
            <ToastContainer position="top-right" autoClose={3000} />

            <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/jobs" element={<JobsListPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />

                {/* Client */}
                <Route path="/client/dashboard" element={
                    <ClientRoute><ClientDashboard /></ClientRoute>
                } />
                <Route path="/client/post-job" element={
                    <ClientRoute><PostJobPage /></ClientRoute>
                } />
                <Route path="/client/my-jobs" element={
                    <ClientRoute><MyPostedJobs /></ClientRoute>
                } />
                <Route path="/client/applicants/:jobId" element={
                    <ClientRoute><ApplicantsPage /></ClientRoute>
                } />
                <Route path="/client/projects" element={
                    <ClientRoute><ClientProjects /></ClientRoute>
                } />
                <Route path="/client/projects/:id/review" element={
                    <ClientRoute><ReviewSubmission /></ClientRoute>
                } />

                {/* Freelancer */}
                <Route path="/freelancer/dashboard" element={
                    <FreelancerRoute><FreelancerDashboard /></FreelancerRoute>
                } />
                <Route path="/freelancer/applications" element={
                    <FreelancerRoute><MyApplications /></FreelancerRoute>
                } />
                <Route path="/freelancer/projects" element={
                    <FreelancerRoute><FreelancerProjects /></FreelancerRoute>
                } />
                <Route path="/freelancer/projects/:id/submit" element={
                    <FreelancerRoute><SubmitWorkPage /></FreelancerRoute>
                } />
                <Route path="/freelancer/wallet" element={
                    <FreelancerRoute><WalletPage /></FreelancerRoute>
                } />

                {/* Shared */}
                <Route path="/projects/:id/chat" element={
                    <PrivateRoute><ChatPage /></PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute><ProfilePage /></PrivateRoute>
                } />
                <Route path="/disputes" element={
                    <PrivateRoute><DisputesPage /></PrivateRoute>
                } />
            </Routes>
        </Router>
    )
}

export default App