import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect(user) {
    if (this.socket?.connected) {
      return this.socket
    }

    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found for socket connection')
      return null
    }

    try {
      this.socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001', {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      })

      this.setupEventListeners()
      return this.socket
    } catch (error) {
      console.error('Socket connection error:', error)
      return null
    }
  }

  setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id)
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.disconnect()
      }
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    // Room events
    this.socket.on('user-joined', (userData) => {
      console.log('User joined room:', userData)
      this.emit('userJoined', userData)
    })

    this.socket.on('user-left', (userData) => {
      console.log('User left room:', userData)
      this.emit('userLeft', userData)
    })

    this.socket.on('room-participants', (participants) => {
      console.log('Room participants:', participants)
      this.emit('roomParticipants', participants)
    })

    this.socket.on('new-message', (messageData) => {
      console.log('New message:', messageData)
      this.emit('newMessage', messageData)
    })

    this.socket.on('message-pinned', (pinnedData) => {
      console.log('Message pinned:', pinnedData)
      this.emit('messagePinned', pinnedData)
    })

    // WebRTC events
    this.socket.on('webrtc-signal', (data) => {
      console.log('WebRTC signal received:', data)
      this.emit('webrtcSignal', data)
    })
  }

  // Event emitter functionality
  emit(event, data) {
    if (this.eventListeners && this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data))
    }
  }

  on(event, callback) {
    if (!this.eventListeners) {
      this.eventListeners = {}
    }
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  off(event, callback) {
    if (this.eventListeners && this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
    }
  }

  // Room methods
  joinRoom(roomId, accessCode = null) {
    if (!this.socket?.connected) {
      console.error('Socket not connected')
      return false
    }

    console.log('Joining room:', roomId)
    this.socket.emit('join-room', { roomId, accessCode })
    return true
  }

  leaveRoom() {
    if (!this.socket?.connected) return false

    console.log('Leaving current room')
    this.socket.disconnect()
    this.connect() // Reconnect without room
    return true
  }

  sendMessage(content) {
    if (!this.socket?.connected) {
      console.error('Socket not connected')
      return false
    }

    if (!content?.trim()) {
      console.error('Message content is empty')
      return false
    }

    console.log('Sending message:', content)
    this.socket.emit('send-message', { content: content.trim() })
    return true
  }

  pinMessage(messageId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected')
      return false
    }

    console.log('Pinning message:', messageId)
    this.socket.emit('pin-message', { messageId })
    return true
  }

  // WebRTC methods
  sendWebRTCSignal(signal, targetSocketId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected')
      return false
    }

    console.log('Sending WebRTC signal to:', targetSocketId)
    this.socket.emit('webrtc-signal', { signal, targetSocketId })
    return true
  }

  // Connection status
  isSocketConnected() {
    return this.socket?.connected || false
  }

  getSocketId() {
    return this.socket?.id || null
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket')
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.eventListeners = {}
    }
  }

  // Reconnect
  reconnect() {
    this.disconnect()
    const token = localStorage.getItem('token')
    if (token) {
      setTimeout(() => {
        this.connect()
      }, 1000)
    }
  }
}

export const socketService = new SocketService()
export default socketService