import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from './lib/api'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import DashboardPage from './components/DashboardPage'
import CreateRoomPage from './components/CreateRoomPage'
import RoomPage from './components/RoomPage'
import MessagesPage from './components/MessagesPage'
import ProfilePage from './components/ProfilePage'
import SettingsPage from './components/SettingsPage'
import NotFoundPage from './components/NotFoundPage'
import FocusRoomsPage from './components/FocusRoomsPage'
import LeaderboardPage from './components/LeaderboardPage'
import AIToolsPage from './components/AIToolsPage'
import SocialFeedPage from './components/SocialFeedPage'
import StudyGroupsPage from './components/StudyGroupsPage'
import TasksPage from './components/TasksPage'
import HowItWorksPage from './components/HowItWorksPage'
import RulesPage from './components/RulesPage'
import BlogPage from './components/BlogPage'
import ContactPage from './components/ContactPage'
import MobileAppPage from './components/MobileAppPage'

// Auth Context
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

function AppContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      apiService.setToken(savedToken)
      apiService.getUserProfile()
        .then(userData => {
          setUser(userData)
        })
        .catch(() => {
          localStorage.removeItem('token')
          apiService.setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    apiService.setToken(token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    apiService.setToken(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-500"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
          <Routes>
            <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} />
            
            {/* Public Pages */}
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mobile" element={<MobileAppPage />} />
            
            <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
            <Route path="/create-room" element={user ? <CreateRoomPage /> : <Navigate to="/login" />} />
            <Route path="/room/:id" element={user ? <RoomPage /> : <Navigate to="/login" />} />
            <Route path="/messages" element={user ? <MessagesPage /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
            <Route path="/focus-rooms" element={user ? <FocusRoomsPage /> : <Navigate to="/login" />} />
            <Route path="/leaderboard" element={user ? <LeaderboardPage /> : <Navigate to="/login" />} />
            <Route path="/ai-tools" element={user ? <AIToolsPage /> : <Navigate to="/login" />} />
            <Route path="/social" element={user ? <SocialFeedPage /> : <Navigate to="/login" />} />
            <Route path="/study-groups" element={user ? <StudyGroupsPage /> : <Navigate to="/login" />} />
            <Route path="/tasks" element={user ? <TasksPage /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}

export default App