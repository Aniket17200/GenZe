import { useState, useEffect, useRef } from 'react'
import { Camera, Edit, Save, X, Calendar, Clock, Users, Award, AlertCircle, Upload, MessageCircle, Heart, Share2, Plus } from 'lucide-react'
import { useAuth } from '../App'
import { apiService } from '../lib/api'
import Navbar from './Navbar'

const ProfilePage = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalHours: 0,
    sessionsJoined: 0,
    sessionsHosted: 0,
    studyStreak: 0
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    university: '',
    major: '',
    year: '',
    interests: [],
    avatar: ''
  })
  const [thoughts, setThoughts] = useState([])
  const [newThought, setNewThought] = useState('')
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageText, setMessageText] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const [profileData, statsData] = await Promise.all([
        apiService.getUserProfile().catch(() => ({})),
        apiService.getUserStats().catch(() => ({ totalHours: 0, sessionsJoined: 0, sessionsHosted: 0, studyStreak: 0 }))
      ])
      
      setProfile(profileData || {})
      setStats(statsData || { totalHours: 0, sessionsJoined: 0, sessionsHosted: 0, studyStreak: 0 })
      setFormData({
        name: profileData?.name || user?.name || '',
        email: profileData?.email || user?.email || '',
        bio: profileData?.bio || '',
        university: profileData?.university || '',
        major: profileData?.major || '',
        year: profileData?.year || '',
        interests: Array.isArray(profileData?.interests) ? profileData.interests : [],
        avatar: profileData?.avatar || user?.avatar || ''
      })
      
      // Load user thoughts (sample data)
      setThoughts([
        {
          id: 1,
          text: 'Just finished a great study session on calculus! 📚',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 5
        },
        {
          id: 2,
          text: 'Looking for study partners for physics lab next week 🔬',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          likes: 3
        }
      ])
    } catch (err) {
      console.error('Failed to load profile data:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleInterestChange = (interest) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest]
    
    setFormData({
      ...formData,
      interests: newInterests
    })
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Name is required')
      return
    }
    
    try {
      setLoading(true)
      await apiService.updateUserProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        university: formData.university.trim(),
        major: formData.major.trim(),
        year: formData.year.trim(),
        interests: Array.isArray(formData.interests) ? formData.interests : [],
        avatar: formData.avatar
      })
      setIsEditing(false)
      await loadProfileData()
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, avatar: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddThought = () => {
    const trimmedThought = newThought.trim()
    if (trimmedThought && trimmedThought.length <= 280) {
      const thought = {
        id: Date.now(),
        text: trimmedThought,
        timestamp: new Date().toISOString(),
        likes: 0
      }
      setThoughts(prev => [thought, ...prev.slice(0, 9)]) // Keep only 10 thoughts
      setNewThought('')
    }
  }

  const handleLikeThought = (thoughtId) => {
    setThoughts(prev => prev.map(thought => 
      thought.id === thoughtId 
        ? { ...thought, likes: thought.likes + 1 }
        : thought
    ))
  }

  const handleSendMessage = () => {
    const trimmedMessage = messageText.trim()
    if (trimmedMessage && trimmedMessage.length <= 500) {
      // In a real app, this would send a message via API
      alert('Message sent successfully!')
      setMessageText('')
      setShowMessageModal(false)
    }
  }

  const availableInterests = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Literature', 'Psychology', 'Economics', 'Art', 'Music'
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              {formData.avatar || user?.avatar ? (
                <img
                  src={formData.avatar || user?.avatar}
                  alt={user?.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center">
                  <Users className="text-gray-500" size={48} />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 transition-colors"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-sky-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-sky-500"
                  />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full text-gray-700 bg-transparent border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-sky-500"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.name}</h1>
                  <p className="text-gray-600 mb-4">{formData.email}</p>
                  <p className="text-gray-700 mb-6">{formData.bio}</p>
                </>
              )}

              {/* Academic Info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {formData.university}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {formData.major}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {formData.year}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center md:justify-start space-x-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-sky-500 text-white px-6 py-2 rounded-xl hover:bg-sky-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save size={16} />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-sky-500 text-white px-6 py-2 rounded-xl hover:bg-sky-600 transition-colors flex items-center space-x-2"
                  >
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Send Message Button */}
          {!isEditing && (
            <div className="lg:col-span-3 flex justify-center mb-6">
              <button
                onClick={() => setShowMessageModal(true)}
                className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors flex items-center space-x-2"
              >
                <MessageCircle size={20} />
                <span>Send Message</span>
              </button>
            </div>
          )}
          {/* Stats */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-sky-500" size={16} />
                    <span className="text-gray-700">Total Hours</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.totalHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="text-green-500" size={16} />
                    <span className="text-gray-700">Sessions Joined</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.sessionsJoined}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="text-purple-500" size={16} />
                    <span className="text-gray-700">Sessions Hosted</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.sessionsHosted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-orange-500" size={16} />
                    <span className="text-gray-700">Study Streak</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.studyStreak} days</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Study Goal</span>
                    <span className="text-gray-900">{stats.totalHours}/100h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-sky-500 h-2 rounded-full" 
                      style={{width: `${Math.min((stats.totalHours / 100) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Sessions This Month</span>
                    <span className="text-gray-900">{stats.sessionsJoined}/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{width: `${Math.min((stats.sessionsJoined / 20) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Interests */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Interests</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <p className="text-gray-600">Select your study interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableInterests.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleInterestChange(interest)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.interests.includes(interest)
                            ? 'bg-sky-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Thoughts Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thoughts & Updates</h2>
              
              {/* Add New Thought */}
              <div className="mb-6">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newThought}
                      onChange={(e) => setNewThought(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleAddThought}
                        disabled={!newThought.trim()}
                        className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Plus size={16} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thoughts List */}
              <div className="space-y-4">
                {thoughts.map((thought) => (
                  <div key={thought.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{user?.name}</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(thought.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{thought.text}</p>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLikeThought(thought.id)}
                            className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Heart size={16} />
                            <span>{thought.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-sky-500 transition-colors">
                            <Share2 size={16} />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-4">
                  {formData.avatar || user?.avatar ? (
                    <img
                      src={formData.avatar || user?.avatar}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <Users className="text-gray-500" size={20} />
                    </div>
                  )}
                  <span className="font-medium text-gray-900">To: {user?.name}</span>
                </div>
                
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <MessageCircle size={16} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage