import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Video, VideoOff, MicOff, Users, MessageCircle, 
  Settings, LogOut, Send, MoreVertical, Phone, Pin, PinOff,
  ChevronLeft, ChevronRight, X, AlertTriangle, Wifi, WifiOff,
  Search, Bell, User, Home, UserCircle, MessageSquare, HelpCircle,
  Heart, Star, Maximize2, Trophy, Target, ThumbsUp
} from 'lucide-react'
import { useAuth } from '../App'
import { socketService } from '../lib/socket'
import { webrtcService } from '../lib/webrtc'

import { apiService } from '../lib/api'

// For a subtle fade-in animation on video tiles
// Add this to your tailwind.config.js
// keyframes: {
//   fadeIn: { '0%': { opacity: 0, transform: 'scale(0.95)' }, '100%': { opacity: 1, transform: 'scale(1)' } }
// },
// animation: {
//   fadeIn: 'fadeIn 0.5s ease-out forwards',
// }


const RoomPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const localVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteVideosRef = useRef(new Map())
  
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(false) // Assuming audio is off by default
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [participants, setParticipants] = useState([])
  const [remoteStreams, setRemoteStreams] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Layout & Features State
  const [currentPage, setCurrentPage] = useState(0)

  const [selectedUser, setSelectedUser] = useState(null)
  const [showPinModal, setShowPinModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showPersonalChat, setShowPersonalChat] = useState(false)
  const [personalChatUser, setPersonalChatUser] = useState(null)
  
  // Connection & Retry State
  const [connectionStatus, setConnectionStatus] = useState('connected')
  const [retryCount, setRetryCount] = useState(0)
  
  const USERS_PER_PAGE = 8

  const MAX_RETRY_ATTEMPTS = 3
  const RETRY_DELAY = 2000

  // --- Core Logic & Effects ---

  const initializeRoom = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!id || !user?.id) throw new Error('Missing user or room data.')
      
      // Load room messages only
      try {
        await loadRoomMessages()
      } catch (err) {
        console.warn('Failed to load messages:', err)
      }
      
      setLoading(false)
      setRetryCount(0)

    } catch (err) {
      console.error('Room initialization error:', err)
      handleInitializationError(err)
    }
  }, [id, user]) // Dependencies for useCallback

  // **FIXED**: Added initializeRoom to the dependency array
  useEffect(() => {
    let mounted = true
    
    const initialize = async () => {
      if (mounted) {
        await initializeRoom()
        // Initialize camera after a short delay to ensure DOM is ready
        setTimeout(() => {
          if (mounted) {
            initializeCamera()
          }
        }, 500)
      }
    }
    
    initialize()
    
    const handleOnline = () => setConnectionStatus('connected')
    const handleOffline = () => setConnectionStatus('disconnected')
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notification-dropdown')) {
        setShowNotifications(false)
      }
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      mounted = false
      cleanup()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('click', handleClickOutside)
    }
  }, []) // Correct dependency

  const connectWithRetry = useCallback(async () => {
    // ... (rest of the logic is fine, no changes needed)
    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        socketService.joinRoom({
          roomId: id,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar
        })
        setConnectionStatus('connected')
        return
      } catch (err) {
        console.warn(`Connection attempt ${attempt + 1} failed:`, err)
        if (attempt < MAX_RETRY_ATTEMPTS - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)))
        }
      }
    }
    throw new Error('Failed to connect to the room server.')
  }, [id, user])

  const handleInitializationError = useCallback((err) => {
    setLoading(false)
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      setRetryCount(prev => prev + 1)
      setTimeout(() => initializeRoom(), RETRY_DELAY * (retryCount + 1))
    } else {
      setError(err.message || 'Failed to initialize room after multiple retries.')
    }
  }, [retryCount, initializeRoom])

  const initializeCamera = useCallback(async () => {
    try {
      console.log('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      })
      
      console.log('Camera stream obtained')
      
      // Wait for video element to be ready
      await new Promise((resolve) => {
        const checkVideo = () => {
          if (localVideoRef.current) {
            resolve()
          } else {
            setTimeout(checkVideo, 100)
          }
        }
        checkVideo()
      })
      
      if (localVideoRef.current) {
        localStreamRef.current = stream
        localVideoRef.current.srcObject = stream
        localVideoRef.current.muted = true
        localVideoRef.current.playsInline = true
        localVideoRef.current.autoplay = true
        
        try {
          await localVideoRef.current.play()
          console.log('Video playing successfully')
          setIsVideoOn(true)
        } catch (playErr) {
          console.error('Video play failed:', playErr)
          setTimeout(async () => {
            try {
              if (localVideoRef.current && localStreamRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current
                await localVideoRef.current.play()
                setIsVideoOn(true)
              }
            } catch (retryErr) {
              console.error('Video retry failed:', retryErr)
              setIsVideoOn(false)
            }
          }, 1000)
        }
      }
    } catch (err) {
      console.error('Camera access denied:', err)
      setIsVideoOn(false)
    }
  }, [])

  const initializeVideo = useCallback(async () => {
    // ... (logic is fine, no changes needed)
    try {
      const stream = await webrtcService.initialize(id, user.id)
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      
      webrtcService.setOnRemoteStream((socketId, stream) => {
        setRemoteStreams(prev => new Map(prev).set(socketId, stream))
      })

      webrtcService.setOnRemoteStreamRemoved((socketId) => {
        setRemoteStreams(prev => {
          const newMap = new Map(prev)
          newMap.delete(socketId)
          return newMap
        })
        remoteVideosRef.current.delete(socketId)
      })
    } catch (err) {
      console.error('Error accessing camera:', err)
      setIsVideoOn(false)
      setError('Camera access denied. You can still use chat.')
    }
  }, [id, user.id])

  const setupSocketListeners = useCallback(() => {
    // ... (logic is fine, no changes needed)
    socketService.on('user-joined-room', (userData) => {
      setParticipants(prev => {
        const exists = prev.some(p => p.socketId === userData.socketId)
        return exists ? prev : [...prev, userData]
      })
    })

    socketService.on('user-left-room', (userData) => {
      setParticipants(prev => prev.filter(p => p.socketId !== userData.socketId))
    })

    socketService.on('receive-message', (messageData) => {
      setMessages(prev => [...prev.slice(-100), { ...messageData, id: Date.now() }])
    })

    socketService.on('room-participants', (participantsData) => {
      if (Array.isArray(participantsData)) setParticipants(participantsData)
    })
  }, [])

  const cleanup = useCallback(() => {
    // ... (logic is fine, no changes needed)
    webrtcService.cleanup()
    socketService.leaveRoom({ roomId: id, userId: user.id })
    socketService.off('user-joined-room')
    socketService.off('user-left-room')
    socketService.off('receive-message')
    socketService.off('room-participants')
  }, [id, user.id])
  
  // --- UI Handlers ---

  const loadRoomMessages = useCallback(async () => {
    try {
      setLoadingMessages(true)
      const roomMessages = await apiService.getRoomMessages(id)
      setMessages(roomMessages.map(msg => ({
        id: msg.id,
        message: msg.content,
        userName: msg.sender_name,
        userAvatar: msg.sender_avatar,
        timestamp: msg.created_at
      })))
    } catch (err) {
      console.warn('Failed to load room messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [id])

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault()
    const trimmedMessage = message.trim()
    if (trimmedMessage) {
      try {
        // Send to API first
        const newMessage = await apiService.sendRoomMessage(id, trimmedMessage)
        
        // Also send via socket for real-time updates
        socketService.sendMessage({
          roomId: id,
          message: trimmedMessage,
          userName: user.name,
          userAvatar: user.avatar,
          timestamp: new Date().toISOString()
        })
        
        setMessage('')
      } catch (err) {
        console.error('Failed to send message:', err)
        // Fallback to socket only
        socketService.sendMessage({
          roomId: id,
          message: trimmedMessage,
          userName: user.name,
          userAvatar: user.avatar,
          timestamp: new Date().toISOString()
        })
        setMessage('')
      }
    }
  }, [message, id, user.name, user.avatar])

  const toggleVideo = async () => {
    try {
      if (isVideoOn) {
        // Turn off video
        const stream = localVideoRef.current?.srcObject
        if (stream) {
          stream.getVideoTracks().forEach(track => {
            track.enabled = false
          })
        }
        setIsVideoOn(false)
      } else {
        // Turn on video
        const stream = localStreamRef.current || localVideoRef.current?.srcObject
        if (stream) {
          stream.getVideoTracks().forEach(track => {
            track.enabled = true
          })
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
            localVideoRef.current.play().catch(console.error)
          }
          setIsVideoOn(true)
        } else {
          await initializeCamera()
        }
      }
    } catch (err) {
      console.error('Error toggling video:', err)
      setError('Failed to toggle camera')
    }
  }

  // NOTE: Audio functionality is disabled in the UI, but the hook is here for future use.
  const toggleAudio = () => {
    const newAudioState = webrtcService.toggleAudio()
    setIsAudioOn(newAudioState)
  }


  
  const handleLeaveRoom = () => {
    cleanup()
    navigate('/dashboard')
  }

  // --- Memoized Derived State ---

  const allParticipants = useMemo(() => {
    const localUser = { 
      socketId: 'local-user', 
      userName: user?.name || 'You',
      userAvatar: user?.avatar, 
      isLocal: true 
    }
    return [localUser, ...participants.filter(p => p && p.socketId)]
  }, [user, participants])
  
  const { totalPages, currentPageParticipants } = useMemo(() => {
    const total = Math.ceil(allParticipants.length / USERS_PER_PAGE) || 1
    const safePage = Math.min(currentPage, total - 1)
    const pageParticipants = allParticipants.slice(safePage * USERS_PER_PAGE, (safePage + 1) * USERS_PER_PAGE)
    return { totalPages: total, currentPageParticipants: pageParticipants }
  }, [allParticipants, currentPage])

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="h-screen bg-sky-50 flex items-center justify-center text-sky-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-500 mx-auto mb-4"></div>
          <p className="font-medium text-lg">Connecting to Room...</p>
          {retryCount > 0 && <p className="text-sm text-sky-600">Attempt {retryCount}/{MAX_RETRY_ATTEMPTS}</p>}
        </div>
      </div>
    )
  }

  if (error && retryCount >= MAX_RETRY_ATTEMPTS) {
    return (
      <div className="h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => { setRetryCount(0); initializeRoom(); }}
              className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors font-semibold"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden text-slate-800" style={{backgroundColor: '#ffffff'}}>
      
      {/* --- Custom Study Room Header --- */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm z-20">
        <div className="flex items-center justify-between">
          {/* Left Side - Leave Button */}
          <div className="flex items-center">
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={16} />
              Leave
            </button>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search people..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side - Notifications, Messages, User */}
          <div className="flex items-center space-x-3 relative">
            {/* Notifications */}
            <div className="relative notification-dropdown">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-sky-600 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {messages.slice(-3).map((msg, index) => (
                      <div key={index} className="p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{msg.userName?.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">New message from {msg.userName}</p>
                            <p className="text-xs text-gray-500">"{msg.message.substring(0, 50)}{msg.message.length > 50 ? '...' : ''}"</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <button className="text-sm text-sky-600 hover:text-sky-700 font-medium">View all notifications</button>
                  </div>
                </div>
              )}
            </div>
            
            <Link 
              to="/messages"
              className="p-2 text-gray-600 hover:text-sky-600 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <MessageCircle size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
            </Link>
            
            {/* User Profile Image */}
            <Link 
              to="/profile"
              className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-sky-500 transition-all"
            >
              {user?.avatar && user.avatar !== '👤' ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full bg-sky-500 flex items-center justify-center ${
                  user?.avatar && user.avatar !== '👤' ? 'hidden' : 'flex'
                }`}
              >
                <span className="text-white text-sm font-bold">{user?.name?.charAt(0) || 'U'}</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* --- Vertical Left Sidebar --- */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-3 space-y-4">
          {/* Logo */}
          <Link 
            to="/dashboard"
            className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center justify-center hover:from-sky-600 hover:to-blue-700 transition-all"
          >
            <span className="text-white font-bold text-lg">G</span>
          </Link>
          
          {/* Profile */}
          <Link 
            to="/profile"
            className="w-10 h-10 bg-gray-100 hover:bg-sky-100 rounded-xl flex items-center justify-center transition-colors group"
          >
            <UserCircle size={20} className="text-gray-600 group-hover:text-sky-600" />
          </Link>
          
          {/* Chat */}
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isChatOpen ? 'bg-sky-500 text-white' : 'bg-gray-100 hover:bg-sky-100 text-gray-600 hover:text-sky-600'
            }`}
            title="Toggle Chat"
          >
            <MessageSquare size={20} />
          </button>
          
          {/* Groups */}
          <Link 
            to="/study-groups"
            className="w-10 h-10 bg-gray-100 hover:bg-sky-100 rounded-xl flex items-center justify-center transition-colors group"
            title="Study Groups"
          >
            <Users size={20} className="text-gray-600 group-hover:text-sky-600" />
          </Link>
          
          {/* Feedback */}
          <button 
            onClick={() => alert('Feedback: Great study session! 👍')}
            className="w-10 h-10 bg-gray-100 hover:bg-sky-100 rounded-xl flex items-center justify-center transition-colors group"
            title="Feedback"
          >
            <HelpCircle size={20} className="text-gray-600 group-hover:text-sky-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* --- Main Content: Video Grid & Controls --- */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden ml-20">
          


          {/* Main Video Grid - Fixed 4 columns */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-4 min-h-full auto-rows-fr">
            {currentPageParticipants.map((p) => (
              <VideoTile 
                key={p.socketId} 
                participant={p} 
                stream={p.isLocal ? null : remoteStreams.get(p.socketId)}
                localVideoRef={p.isLocal ? localVideoRef : null}
                isVideoOn={p.isLocal ? isVideoOn : true}
                isAudioOn={p.isLocal ? isAudioOn : true}
                onMessage={(participant) => {
                  setPersonalChatUser(participant)
                  setShowPersonalChat(true)
                }}
                initializeCamera={p.isLocal ? initializeCamera : null}
              />
            ))}
             {/* Empty placeholders */}
            {Array.from({ length: Math.max(0, 8 - currentPageParticipants.length) }).map((_, i) => (
              <div key={`placeholder-${i}`} className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 aspect-video hover:border-sky-300 transition-colors">
                <div className="text-center">
                  <Users size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Waiting for participant</p>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Personal Chat Modal */}
          {showPersonalChat && personalChatUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl w-96 h-[500px] flex flex-col shadow-2xl">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{personalChatUser.userName?.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{personalChatUser.userName}</h3>
                      <p className="text-sm text-green-600">Online</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPersonalChat(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.filter(msg => msg.userName === personalChatUser.userName || msg.userName === user.name).map((msg, index) => (
                      <div key={index} className={`flex ${msg.userName === user.name ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-2xl px-4 py-2 max-w-xs ${
                          msg.userName === user.name ? 'bg-sky-500 text-white' : 'bg-gray-100'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.userName === user.name ? 'text-sky-200' : 'text-gray-500'
                          }`}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {messages.filter(msg => msg.userName === personalChatUser.userName || msg.userName === user.name).length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button className="bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 transition-colors">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- Video Controls (Floating) --- */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-3 flex items-center space-x-3">
              <button 
                onClick={toggleVideo} 
                className={`p-3 rounded-xl transition-colors ${
                  isVideoOn ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              
              <button 
                className="p-3 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed" 
                title="Audio is disabled"
              >
                <MicOff size={20} />
              </button>
              
              {totalPages > 1 && (
                <div className="flex items-center space-x-2 px-3">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
                    disabled={currentPage === 0} 
                    className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={16}/>
                  </button>
                  <span className="text-xs font-medium text-gray-500 px-2">{currentPage + 1}/{totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
                    disabled={currentPage >= totalPages - 1} 
                    className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={16}/>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* --- Chat Sidebar --- */}
        {isChatOpen && (
          <aside className="w-80 border-l border-gray-200 flex flex-col shadow-lg" style={{backgroundColor: '#ffffff'}}>
            <div className="p-4 border-b border-sky-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-sky-900">Room Chat</h3>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-sky-500"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 pt-16">
                        <MessageCircle size={40} className="mx-auto mb-2"/>
                        <p className="text-sm">No messages yet. Say hi! 👋</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-sky-500 rounded-full flex-shrink-0 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{msg.userName?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="flex items-baseline space-x-2">
                            <p className="font-semibold text-sm text-slate-800">{msg.userName}</p>
                            <p className="text-xs text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <p className="text-sm text-slate-600 break-words">{msg.message}</p>
                        </div>
                      </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-sky-100">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 bg-slate-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button type="submit" className="p-2.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors disabled:opacity-50" disabled={!message.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

// --- Enhanced Video Tile Component ---
const VideoTile = React.memo(({ participant, stream, localVideoRef, isVideoOn, onMessage, initializeCamera }) => {
  const videoRef = useRef(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isEnlarged, setIsEnlarged] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (videoRef.current && stream && !videoLoaded) {
      videoRef.current.srcObject = stream
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(console.error)
        setVideoLoaded(true)
      }
    }
  }, [stream, videoLoaded])

  const handleLike = (e) => {
    e.stopPropagation()
    setLiked(!liked)
    // Show like animation
    const likeNotification = document.createElement('div')
    likeNotification.innerHTML = '👍'
    likeNotification.className = 'fixed text-2xl animate-bounce z-50'
    likeNotification.style.left = e.clientX + 'px'
    likeNotification.style.top = e.clientY + 'px'
    document.body.appendChild(likeNotification)
    setTimeout(() => document.body.removeChild(likeNotification), 1000)
    console.log(`${liked ? 'Unliked' : 'Liked'} ${participant.userName}`)
  }

  const handleEnlarge = (e) => {
    e.stopPropagation()
    setIsEnlarged(!isEnlarged)
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    console.log(`${isFavorite ? 'Removed from' : 'Added to'} favorites: ${participant.userName}`)
  }



  const handleMessage = (e) => {
    e.stopPropagation()
    if (onMessage) onMessage(participant)
  }

  return (
    <div 
      className={`relative bg-white rounded-2xl overflow-hidden shadow-xl group transition-all duration-300 ${
        isEnlarged ? 'fixed inset-8 z-50 shadow-2xl' : 'aspect-video'
      } border-2 ${
        isFavorite ? 'border-red-400 shadow-red-200 ring-2 ring-red-200' : 
        'border-gray-200 hover:border-sky-400 hover:shadow-sky-200'
      } hover:shadow-2xl hover:scale-[1.02]`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Content */}
      {participant.isLocal ? (
        <>
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)', display: isVideoOn ? 'block' : 'none' }}
            onLoadedData={() => console.log('Local video loaded')}
            onError={(e) => console.error('Local video error:', e)}
          />
          {!isVideoOn && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
              <div className="w-20 h-20 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                <span className="text-white text-2xl font-bold">{participant.userName?.charAt(0).toUpperCase()}</span>
              </div>
              <p className="font-semibold text-gray-800 text-lg">{participant.userName} (You)</p>
              <div className="flex items-center space-x-2 mt-2 text-gray-600">
                <VideoOff size={18} />
                <span className="text-sm">Camera Off</span>
              </div>
              {initializeCamera && (
                <button 
                  onClick={() => initializeCamera()}
                  className="mt-2 px-3 py-1 bg-sky-500 text-white text-xs rounded-lg hover:bg-sky-600"
                >
                  Enable Camera
                </button>
              )}
            </div>
          )}
        </>

      ) : (
        (stream && isVideoOn) ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
            onError={(e) => console.error('Video error:', e)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
            <div className="w-20 h-20 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <span className="text-white text-2xl font-bold">{participant.userName?.charAt(0).toUpperCase()}</span>
            </div>
            <p className="font-semibold text-gray-800 text-lg">{participant.userName}</p>
            <div className="flex items-center space-x-2 mt-2 text-gray-600">
              <VideoOff size={18} />
              <span className="text-sm">Camera Off</span>
            </div>
          </div>
        )
      )}

      {/* Status Indicators */}
      <div className="absolute top-3 left-3 flex space-x-2">
        {isFavorite && (
          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Heart size={10} /> Favorite
          </div>
        )}
      </div>

      {/* Hidden Top Navbar */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            
            <button 
              onClick={handleFavorite}
              className={`p-2.5 rounded-xl backdrop-blur-md transition-all duration-200 transform hover:scale-110 ${
                isFavorite ? 'bg-red-500 text-white shadow-lg' : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-md'
              }`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
            </button>
            
            <button 
              onClick={handleEnlarge}
              className="p-2.5 rounded-xl bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 transform hover:scale-110"
              title={isEnlarged ? "Minimize" : "Enlarge"}
            >
              <Maximize2 size={16} />
            </button>
          </div>
          
          {isEnlarged && (
            <button 
              onClick={() => setIsEnlarged(false)}
              className="p-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Hidden Bottom Footer */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">{participant.userName?.charAt(0)}</span>
            </div>
            <div className="text-white">
              <p className="text-sm font-semibold">{participant.userName}</p>
              <div className="flex items-center space-x-4 text-xs opacity-90">
                <div className="flex items-center space-x-1">
                  <Target size={12} />
                  <span>Studying Math</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy size={12} />
                  <span>5 day streak</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleLike}
              className={`p-2.5 rounded-xl backdrop-blur-md transition-all duration-200 transform hover:scale-110 ${
                liked ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-md'
              }`}
              title="Send Like"
            >
              <ThumbsUp size={16} className={liked ? 'fill-current' : ''} />
            </button>
            
            <button 
              onClick={handleMessage}
              className="p-2.5 rounded-xl bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 transform hover:scale-110"
              title="Send Message"
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Always Visible User Name */}
      {!showControls && (
        <div className="absolute bottom-3 left-3">
          <div className="bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm font-medium">
            {participant.userName} {participant.isLocal && '(You)'}
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="absolute top-3 right-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Only re-render if essential props change, not pin state
  return (
    prevProps.participant.socketId === nextProps.participant.socketId &&
    prevProps.isVideoOn === nextProps.isVideoOn &&
    prevProps.stream === nextProps.stream
  )
})

export default RoomPage;