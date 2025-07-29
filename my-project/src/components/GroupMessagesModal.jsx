import { useState, useEffect, useRef } from 'react'
import { X, Send, Users } from 'lucide-react'
import { apiService } from '../lib/api'
import LoadingSpinner from './LoadingSpinner'

const GroupMessagesModal = ({ group, onClose }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (group?.id) {
      loadMessages()
    }
  }, [group?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await apiService.getGroupMessages(group.id)
      setMessages(data)
    } catch (err) {
      console.error('Failed to load messages:', err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const message = await apiService.sendGroupMessage(group.id, messageText)
      setMessages(prev => [...prev, message])
    } catch (err) {
      console.error('Failed to send message:', err)
      setNewMessage(messageText) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{group.name}</h2>
              <p className="text-sm text-gray-600">{group.members} members • {group.category}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner text="Loading messages..." />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No messages yet</h3>
              <p className="text-gray-600">Be the first to start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[70%] ${message.isOwn ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {message.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`${message.isOwn ? 'text-right' : ''}`}>
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.isOwn 
                          ? 'bg-sky-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {!message.isOwn && (
                          <p className="font-semibold text-xs mb-1 opacity-75">
                            {message.user.name}
                          </p>
                        )}
                        <p className="break-words">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">Y</span>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled={sending}
                maxLength={1000}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-sky-500 text-white p-3 rounded-full hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 ml-13">
            {newMessage.length}/1000 characters
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupMessagesModal