const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  constructor() {
    this.baseURL = API_URL
    this.token = localStorage.getItem('token')
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')
      
      if (!response.ok) {
        let errorMessage = 'Request failed'
        
        if (response.status === 401) {
          this.logout()
          throw new Error('Session expired. Please login again.')
        }
        
        if (isJson) {
          try {
            const error = await response.json()
            errorMessage = error.error || error.message || `Error ${response.status}`
          } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`
          }
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      return isJson ? await response.json() : { success: true }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Connection failed. Check your internet connection.')
      }
      throw err
    }
  }

  // Auth endpoints
  async register(userData) {
    if (!userData?.name || !userData?.email || !userData?.password) {
      throw new Error('Name, email, and password are required')
    }
    
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
    })
    
    if (response?.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async verifyEmail(data) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: data,
    })
  }

  async resendOtp(data) {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: data,
    })
  }

  async login(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('Email and password are required')
    }
    
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    })
    
    if (response?.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  logout() {
    this.setToken(null)
  }

  // Study Rooms endpoints (primary)
  async getStudyRooms() {
    return this.request('/study-rooms')
  }

  async createStudyRoom(roomData) {
    return this.request('/study-rooms', {
      method: 'POST',
      body: roomData
    })
  }

  async joinStudyRoom(roomId) {
    return this.request(`/study-rooms/${roomId}/join`, {
      method: 'POST'
    })
  }

  async leaveStudyRoom(roomId) {
    return this.request(`/study-rooms/${roomId}/leave`, {
      method: 'POST'
    })
  }

  // Legacy Room endpoints (for backward compatibility)
  async getRooms() {
    return this.getStudyRooms()
  }

  async createRoom(roomData) {
    return this.createStudyRoom(roomData)
  }

  async joinRoom(roomId) {
    return this.joinStudyRoom(roomId)
  }

  async leaveRoom(roomId) {
    return this.leaveStudyRoom(roomId)
  }

  // User endpoints
  async getUserProfile() {
    try {
      return await this.request('/users/profile')
    } catch (err) {
      console.error('Failed to get user profile:', err)
      throw err
    }
  }

  async updateUserProfile(userData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: userData,
    })
  }

  async getUserStats() {
    try {
      const response = await this.request('/users/stats')
      return response?.data || response || { totalHours: 0, sessionsJoined: 0, sessionsHosted: 0, studyStreak: 0 }
    } catch (err) {
      console.error('Failed to get user stats:', err)
      return { totalHours: 0, sessionsJoined: 0, sessionsHosted: 0, studyStreak: 0 }
    }
  }

  // Focus Rooms endpoints
  async getFocusRooms() {
    return this.request('/focus-rooms')
  }

  async joinFocusRoom(roomId) {
    return this.request(`/focus-rooms/${roomId}/join`, { method: 'POST' })
  }

  async leaveFocusRoom(roomId) {
    return this.request(`/focus-rooms/${roomId}/leave`, { method: 'POST' })
  }

  // Leaderboard endpoints
  async getLeaderboard(period = 'weekly') {
    return this.request(`/leaderboard?period=${period}`)
  }

  async getUserRank(period = 'weekly') {
    return this.request(`/leaderboard/rank?period=${period}`)
  }

  // AI Tools endpoints
  async generateNotes(content) {
    return this.request('/ai/generate-notes', {
      method: 'POST',
      body: { content }
    })
  }

  async generateQuiz(content) {
    return this.request('/ai/generate-quiz', {
      method: 'POST',
      body: { content }
    })
  }

  async generateSummary(content) {
    return this.request('/ai/generate-summary', {
      method: 'POST',
      body: { content }
    })
  }

  // Social Feed endpoints
  async getFeedPosts(page = 1, limit = 10) {
    return this.request(`/social/feed?page=${page}&limit=${limit}`)
  }

  async createPost(content, type = 'general') {
    return this.request('/social/posts', {
      method: 'POST',
      body: { content, type }
    })
  }

  async likePost(postId) {
    return this.request(`/social/posts/${postId}/like`, { method: 'POST' })
  }

  async unlikePost(postId) {
    return this.request(`/social/posts/${postId}/unlike`, { method: 'DELETE' })
  }

  async pinPost(postId) {
    return this.request(`/social/posts/${postId}/pin`, { method: 'POST' })
  }

  async getPostComments(postId) {
    return this.request(`/social/posts/${postId}/comments`)
  }

  async addComment(postId, content) {
    return this.request(`/social/posts/${postId}/comments`, {
      method: 'POST',
      body: { content }
    })
  }

  async sharePost(postId) {
    return this.request(`/social/posts/${postId}/share`, { method: 'POST' })
  }

  async likeComment(commentId) {
    return this.request(`/social/comments/${commentId}/like`, { method: 'POST' })
  }

  async bookmarkPost(postId) {
    return this.request(`/social/posts/${postId}/bookmark`, { method: 'POST' })
  }

  async repostPost(postId, content = '') {
    return this.request(`/social/posts/${postId}/repost`, {
      method: 'POST',
      body: { content }
    })
  }

  async getPostLikers(postId) {
    return this.request(`/social/posts/${postId}/likers`)
  }

  async getTrendingPosts() {
    return this.request('/social/trending')
  }

  async getGroupMessages(groupId) {
    return this.request(`/study-groups/${groupId}/messages`)
  }

  async sendGroupMessage(groupId, content) {
    return this.request(`/study-groups/${groupId}/messages`, {
      method: 'POST',
      body: { content }
    })
  }

  // Study Groups endpoints
  async getStudyGroups(search = '') {
    return this.request(`/study-groups?search=${encodeURIComponent(search)}`)
  }

  async getUserGroups() {
    return this.request('/study-groups/my-groups')
  }

  async createStudyGroup(groupData) {
    return this.request('/study-groups', {
      method: 'POST',
      body: groupData
    })
  }

  async joinStudyGroup(groupId) {
    return this.request(`/study-groups/${groupId}/join`, { method: 'POST' })
  }

  async leaveStudyGroup(groupId) {
    return this.request(`/study-groups/${groupId}/leave`, { method: 'DELETE' })
  }

  // Tasks endpoints
  async getTasks() {
    return this.request('/tasks')
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: taskData
    })
  }

  async updateTask(taskId, taskData) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: taskData
    })
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, { method: 'DELETE' })
  }

  async toggleTaskComplete(taskId) {
    return this.request(`/tasks/${taskId}/toggle`, { method: 'POST' })
  }



  // Room Messages endpoints
  async getRoomMessages(roomId) {
    return this.request(`/study-rooms/${roomId}/messages`)
  }

  async sendRoomMessage(roomId, content) {
    return this.request(`/study-rooms/${roomId}/messages`, {
      method: 'POST',
      body: { content }
    })
  }

  // Direct Messages endpoints
  async getDirectMessages(userId) {
    return this.request(`/messages/${userId}`)
  }

  async sendDirectMessage(userId, content) {
    return this.request('/messages', {
      method: 'POST',
      body: { userId, content }
    })
  }

  // Messages endpoints (legacy)
  async getMessages(conversationId) {
    return this.request(`/messages/${conversationId}`)
  }

  async sendMessage(conversationId, content) {
    return this.request('/messages', {
      method: 'POST',
      body: { conversationId, content }
    })
  }

  async getConversations() {
    return this.request('/conversations')
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

export const apiService = new ApiService()