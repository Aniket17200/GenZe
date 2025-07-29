import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, Clock, Calendar, Video, MessageCircle, TrendingUp, RefreshCw, AlertCircle, Trophy, Brain, Flame, Target } from 'lucide-react'
import { useAuth } from '../App'
import Navbar from './Navbar'
import LoadingSpinner from './LoadingSpinner'

const DashboardPage = () => {
  const { user } = useAuth()
  const [activeRooms, setActiveRooms] = useState([])
  const [stats, setStats] = useState({
    totalHours: 0,
    sessionsJoined: 0,
    sessionsHosted: 0,
    studyStreak: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Use direct API calls instead of hooks
      const [roomsResult, statsResult] = await Promise.allSettled([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/study-rooms`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.ok ? res.json() : []),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users/profile`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.ok ? res.json() : { stats: { totalHours: 0, sessionsJoined: 0, sessionsHosted: 0, studyStreak: 0 } })
      ])
      
      setActiveRooms(
        roomsResult.status === 'fulfilled' && Array.isArray(roomsResult.value) 
          ? roomsResult.value 
          : []
      )
      
      setStats(
        statsResult.status === 'fulfilled' && statsResult.value?.stats
          ? statsResult.value.stats
          : { totalHours: 0, sessionsJoined: 0, sessionsHosted: 0, studyStreak: 0 }
      )
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Failed to load dashboard data')
      setActiveRooms([])
      setStats({ totalHours: 0, sessionsJoined: 0, sessionsHosted: 0, studyStreak: 0 })
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id, loadDashboardData])



  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to GenZce, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600">The world's #1 online study community - Ready to focus?</p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="bg-sky-500 text-white p-3 rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                <Clock className="text-sky-500" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Global Rank</p>
                <p className="text-2xl font-bold text-gray-900">#{stats.globalRank || '-'}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Trophy className="text-yellow-500" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                  <Flame className="text-orange-500" size={20} />
                  {stats.studyStreak}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-orange-500" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Partners</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sessionsHosted}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="text-purple-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* StudyStream Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/focus-rooms" className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl p-6 text-white hover:scale-105 transition-all shadow-lg">
            <Video size={32} className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">24/7 Focus Rooms</h3>
            <p className="text-blue-100 text-sm">Join live study sessions with students worldwide</p>
            <div className="mt-4 text-sm bg-white/20 rounded-lg px-3 py-1 inline-block">
              {activeRooms.reduce((sum, room) => sum + (room.participants || 0), 0)} active now
            </div>
          </Link>

          <Link to="/leaderboard" className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white hover:scale-105 transition-all shadow-lg">
            <Trophy size={32} className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
            <p className="text-yellow-100 text-sm">Compete with students globally and climb ranks</p>
            <div className="mt-4 text-sm bg-white/20 rounded-lg px-3 py-1 inline-block">
              You're #{stats.globalRank || '-'} this week
            </div>
          </Link>

          <Link to="/ai-tools" className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white hover:scale-105 transition-all shadow-lg">
            <Brain size={32} className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Study Tools</h3>
            <p className="text-purple-100 text-sm">Generate notes, quizzes, and summaries instantly</p>
            <div className="mt-4 text-sm bg-white/20 rounded-lg px-3 py-1 inline-block">
              Try AI assistant
            </div>
          </Link>

          <Link to="/social" className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white hover:scale-105 transition-all shadow-lg">
            <MessageCircle size={32} className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">Social Feed</h3>
            <p className="text-green-100 text-sm">Connect with the study community</p>
            <div className="mt-4 text-sm bg-white/20 rounded-lg px-3 py-1 inline-block">
              Connect with community
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Rooms */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Active Study Rooms</h2>
                <Link
                  to="/create-room"
                  className="bg-sky-500 text-white px-4 py-2 rounded-xl hover:bg-sky-600 transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Create Room</span>
                </Link>
              </div>

              {loading ? (
                <div className="py-8">
                  <LoadingSpinner text="Loading active rooms..." />
                </div>
              ) : activeRooms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎥</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No active rooms</h3>
                  <p className="text-gray-600 mb-6">Be the first to start a study session!</p>
                  <Link
                    to="/create-room"
                    className="inline-flex items-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors"
                  >
                    <Plus size={18} />
                    Create Room
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRooms.map((room) => (
                    <div key={room.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{room.name}</h3>
                            {room.is_active && (
                              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span>LIVE</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Users size={14} />
                              <span>0/{room.max_participants}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{new Date(room.created_at).toLocaleTimeString()}</span>
                            </span>
                            {room.subject && (
                              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs">
                                {room.subject}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/room/${room.id}`}
                          className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                        >
                          Join
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
                <TrendingUp size={20} className="text-green-500" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Study Hours</span>
                  <span className="font-semibold text-gray-900">{stats.totalHours}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sessions Joined</span>
                  <span className="font-semibold text-gray-900">{stats.sessionsJoined}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Study Streak</span>
                  <span className="font-semibold text-gray-900">{stats.studyStreak} days</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/tasks"
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Target size={20} className="text-sky-500" />
                  <span className="text-gray-700">Manage Tasks</span>
                </Link>
                <Link
                  to="/study-groups"
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Users size={20} className="text-green-500" />
                  <span className="text-gray-700">Study Groups</span>
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle size={20} className="text-purple-500" />
                  <span className="text-gray-700">Messages</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Users size={20} className="text-orange-500" />
                  <span className="text-gray-700">Edit Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="mt-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">GenZce Global Community</h2>
            <p className="text-sky-100">Join the world's largest online study community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50,000+</div>
              <div className="text-sky-100">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-sky-100">Study Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">1M+</div>
              <div className="text-sky-100">Study Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">150+</div>
              <div className="text-sky-100">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage