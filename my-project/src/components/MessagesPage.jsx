import { useState, useEffect } from 'react'
import { Search, Plus, Send, MoreVertical, Users, Video, MessageCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { socketService } from '../lib/socket'
import { apiService } from '../lib/api'
import Navbar from './Navbar'

const MessagesPage = () => {
  const { user } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [conversations, setConversations] = useState([])
  const [currentMessages, setCurrentMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadConversations()
    setupSocketListeners()
    return () => {
      socketService.off('receive-message')
      socketService.off('conversation-updated')
    }
  }, [])

  const setupSocketListeners = () => {
    socketService.on('receive-message', (messageData) => {
      if (selectedChat && messageData.roomId === selectedChat.id) {
        setCurrentMessages(prev => [...prev, messageData])
      }
      updateConversationLastMessage(messageData)
    })

    socketService.on('conversation-updated', (conversationData) => {
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === conversationData.id ? conversationData : conv
        )
        return updated.some(conv => conv.id === conversationData.id) 
          ? updated 
          : [...updated, conversationData]
      })
    })
  }

  const loadConversations = async () => {
    try {
      setLoading(true)
      
      // Load both study rooms and direct message conversations
      const [rooms, conversations] = await Promise.all([
        apiService.getStudyRooms().catch(() => []),
        apiService.getConversations().catch(() => [])
      ])
      
      const roomConversations = Array.isArray(rooms) ? rooms.map(room => ({
        id: room.id,
        name: room.name || 'Unnamed Room',
        type: 'room',
        lastMessage: 'Join to start chatting',
        timestamp: room.created_at ? new Date(room.created_at).toLocaleTimeString() : 'Now',
        unread: 0,
        avatar: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=50&h=50&fit=crop`,
        participants: room.capacity || 10
      })) : []
      
      const directConversations = Array.isArray(conversations) ? conversations.map(conv => ({
        id: conv.id,
        name: conv.name || 'Direct Message',
        type: 'direct',
        lastMessage: conv.lastMessage || 'Start chatting',
        timestamp: conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString() : 'Now',
        unread: 0,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop`,
        userId: conv.other_user_id
      })) : []
      
      setConversations([...roomConversations, ...directConversations])
    } catch (err) {
      setError('Failed to load conversations')
      setConversations([])
      console.error('Failed to load conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateConversationLastMessage = (messageData) => {
    setConversations(prev => prev.map(conv => 
      conv.id === messageData.roomId 
        ? { ...conv, lastMessage: messageData.message, timestamp: new Date().toLocaleTimeString() }
        : conv
    ))
  }

  const loadChatMessages = async (chat) => {
    if (!chat?.id || !user?.id) return
    
    try {
      setCurrentMessages([])
      
      if (chat.type === 'room') {
        // Load room messages
        const roomMessages = await apiService.getRoomMessages(chat.id)
        setCurrentMessages(roomMessages.map(msg => ({
          id: msg.id,
          message: msg.content,
          userName: msg.sender_name,
          userAvatar: msg.sender_avatar,
          timestamp: msg.created_at
        })))
        
        // Join room for real-time updates
        socketService.joinRoom({
          roomId: chat.id,
          userId: user.id,
          userName: user.name || 'Unknown User',
          userAvatar: user.avatar || ''
        })
      } else if (chat.type === 'direct' && chat.userId) {
        // Load direct messages
        const directMessages = await apiService.getDirectMessages(chat.userId)
        setCurrentMessages(directMessages.map(msg => ({
          id: msg.id,
          message: msg.content,
          userName: msg.sender_name,
          userAvatar: msg.sender_avatar,
          timestamp: msg.created_at
        })))
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
    loadChatMessages(chat)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const trimmedMessage = message.trim()
    
    if (trimmedMessage && selectedChat?.id && user?.name) {
      try {
        if (selectedChat.type === 'room') {
          // Send room message
          await apiService.sendRoomMessage(selectedChat.id, trimmedMessage)
          
          // Also send via socket for real-time updates
          socketService.sendMessage({
            roomId: selectedChat.id,
            message: trimmedMessage,
            userName: user.name,
            userAvatar: user.avatar || '',
            timestamp: new Date().toISOString()
          })
        } else if (selectedChat.type === 'direct' && selectedChat.userId) {
          // Send direct message
          const newMessage = await apiService.sendDirectMessage(selectedChat.userId, trimmedMessage)
          
          // Add to current messages
          setCurrentMessages(prev => [...prev, {
            id: newMessage.id,
            message: newMessage.content,
            userName: user.name,
            userAvatar: user.avatar,
            timestamp: newMessage.created_at
          }])
        }
        
        setMessage('')
      } catch (err) {
        console.error('Failed to send message:', err)
        // Fallback to socket only for room messages
        if (selectedChat.type === 'room') {
          socketService.sendMessage({
            roomId: selectedChat.id,
            message: trimmedMessage,
            userName: user.name,
            userAvatar: user.avatar || '',
            timestamp: new Date().toISOString()
          })
          setMessage('')
        }
      }
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
          <div className="flex h-full">
            {/* Chat List Sidebar */}
            <div className="w-full sm:w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h1>
                  <Link to="/create-room" className="bg-sky-500 text-white p-2 rounded-xl hover:bg-sky-600 transition-colors">
                    <Plus size={20} />
                  </Link>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="space-y-2 p-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 mb-2">No conversations yet</p>
                    <p className="text-gray-400 text-sm">Start chatting in study rooms to see conversations here</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleChatSelect(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat?.id === conversation.id ? 'bg-sky-50 border-r-2 border-r-sky-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={conversation.avatar}
                            alt={conversation.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {conversation.type === 'room' && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              <Users size={10} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.timestamp}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unread > 0 && (
                              <span className="bg-sky-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                          
                          {conversation.type === 'room' && (
                            <p className="text-xs text-gray-500 mt-1">
                              {conversation.participants} max participants
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="hidden sm:flex flex-1 flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedChat.avatar}
                          alt={selectedChat.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h2 className="font-semibold text-gray-900">
                            {selectedChat.name}
                          </h2>
                          {selectedChat.type === 'room' && (
                            <p className="text-sm text-gray-500">
                              Study Room • {selectedChat.participants} max
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/room/${selectedChat.id}`}
                          className="bg-sky-500 text-white p-2 rounded-xl hover:bg-sky-600 transition-colors"
                        >
                          <Video size={16} />
                        </Link>
                        <button className="text-gray-400 hover:text-gray-600 p-2">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {currentMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-gray-400 text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      currentMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.userName === user.name ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex space-x-2 max-w-xs lg:max-w-md ${msg.userName === user.name ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <img
                              src={msg.userAvatar}
                              alt={msg.userName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className={`px-4 py-2 rounded-2xl ${
                                msg.userName === user.name 
                                  ? 'bg-sky-500 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{msg.message}</p>
                              </div>
                              <p className={`text-xs text-gray-500 mt-1 ${msg.userName === user.name ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex space-x-4">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors flex items-center space-x-2"
                      >
                        <Send size={16} />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {conversations.length === 0 ? 'No conversations yet' : 'Select a conversation'}
                    </h3>
                    <p className="text-gray-500">
                      {conversations.length === 0 
                        ? 'Join study rooms to start conversations with other students'
                        : 'Choose a chat from the sidebar to start messaging'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagesPage