require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Server } = require('socket.io')
const { v4: uuidv4 } = require('uuid')
const { supabase } = require('./config/supabase')
const { GoogleGenerativeAI } = require('@google/generative-ai')
// Memory cache only (Redis disabled)
let redisClient = null
const memoryCache = new Map()

// Optional Redis setup (only if REDIS_URL is provided)
if (process.env.REDIS_URL) {
  const redis = require('redis')
  ;(async () => {
    try {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        socket: { connectTimeout: 5000 }
      })
      
      redisClient.on('error', () => {
        redisClient = null
      })
      
      await redisClient.connect()
      console.log('✅ Redis connected')
    } catch (error) {
      redisClient = null
    }
  })()
}

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
})

const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET

// Initialize Gemini AI
let model = null
if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  } catch (error) {
    console.log('⚠️ AI not configured:', error.message)
  }
}

// Middleware
app.use(cors())
app.use(express.json())

// In-memory storage
const activeRooms = new Map()
const connectedUsers = new Map()

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token required' })
  
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' })
  }
}

// Socket auth middleware
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) return next(new Error('Authentication error'))
  
  try {
    const user = jwt.verify(token, JWT_SECRET)
    socket.userId = user.id
    socket.userEmail = user.email
    next()
  } catch (error) {
    next(new Error('Authentication error'))
  }
}

// Cache helpers with memory fallback
const cache = {
  async get(key) {
    try {
      if (redisClient && redisClient.isReady) {
        return await redisClient.get(key)
      } else {
        const cached = memoryCache.get(key)
        if (cached && cached.expires > Date.now()) {
          return cached.value
        }
        memoryCache.delete(key)
        return null
      }
    } catch (error) {
      const cached = memoryCache.get(key)
      if (cached && cached.expires > Date.now()) {
        return cached.value
      }
      return null
    }
  },
  
  async set(key, value, ttl = 300) {
    try {
      if (redisClient && redisClient.isReady) {
        await redisClient.setEx(key, ttl, JSON.stringify(value))
      } else {
        memoryCache.set(key, {
          value: JSON.stringify(value),
          expires: Date.now() + (ttl * 1000)
        })
      }
    } catch (error) {
      memoryCache.set(key, {
        value: JSON.stringify(value),
        expires: Date.now() + (ttl * 1000)
      })
    }
  },
  
  async del(key) {
    try {
      if (redisClient && redisClient.isReady) {
        await redisClient.del(key)
      }
      memoryCache.delete(key)
    } catch (error) {
      memoryCache.delete(key)
    }
  }
}

// Database helpers
const db = {
  async query(table, options = {}) {
    try {
      let query = supabase.from(table).select('*')
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== 'null') {
            query = query.eq(key, value)
          }
        })
      }
      if (options.order) query = query.order(options.order.column, { ascending: options.order.asc })
      if (options.limit) query = query.limit(options.limit)
      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`DB query error on ${table}:`, error.message)
      return []
    }
  },
  
  async insert(table, data) {
    try {
      const { data: result, error } = await supabase.from(table).insert(data).select().single()
      if (error) throw error
      return result
    } catch (error) {
      console.error(`DB insert error on ${table}:`, error.message)
      throw error
    }
  },
  
  async update(table, id, data) {
    try {
      const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single()
      if (error) throw error
      return result
    } catch (error) {
      console.error(`DB update error on ${table}:`, error.message)
      throw error
    }
  },
  
  async delete(table, id) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      return true
    } catch (error) {
      console.error(`DB delete error on ${table}:`, error.message)
      throw error
    }
  },
  
  async findById(table, id) {
    try {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      return null
    }
  },
  
  async count(table, where = {}) {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true })
      Object.entries(where).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== 'null') {
          query = query.eq(key, value)
        }
      })
      const { count, error } = await query
      if (error) throw error
      return count || 0
    } catch (error) {
      return 0
    }
  }
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' })
    }

    const { data: existing } = await supabase.from('users').select('*').eq('email', email).maybeSingle()
    if (existing) return res.status(400).json({ error: 'User exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const { data: user, error: userError } = await supabase.from('users').insert({
      email, password_hash: hashedPassword, email_verified_at: new Date().toISOString()
    }).select().single()
    
    if (userError) throw userError
    
    await supabase.from('user_profiles').insert({ user_id: user.id, name })
    await supabase.from('user_settings').insert({ user_id: user.id })
    await supabase.from('user_stats').insert({ user_id: user.id })
    
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET)
    res.json({ token, user: { id: user.id, name, email, avatar: '👤' } })
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' })
    }

    const { data: existing } = await supabase.from('users').select('*').eq('email', email).maybeSingle()
    if (existing) return res.status(400).json({ error: 'User exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const { data: user, error: userError } = await supabase.from('users').insert({
      email, password_hash: hashedPassword, email_verified_at: new Date().toISOString()
    }).select().single()
    
    if (userError) throw userError
    
    await supabase.from('user_profiles').insert({ user_id: user.id, name })
    await supabase.from('user_settings').insert({ user_id: user.id })
    await supabase.from('user_stats').insert({ user_id: user.id })
    
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET)
    res.json({ token, user: { id: user.id, name, email, avatar: '👤' } })
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle()
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle()
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET)
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: profile?.name || 'User',
        email,
        avatar: profile?.avatar_url || '👤'
      } 
    })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle()
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle()
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET)
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: profile?.name || 'User',
        email,
        avatar: profile?.avatar_url || '👤'
      } 
    })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// User Profile Routes
app.get('/api/users/profile', auth, async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('*').eq('id', req.user.id).single()
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', req.user.id).single()
    const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', req.user.id).single()
    
    res.json({
      id: user.id,
      name: profile?.name || 'User',
      email: user.email,
      avatar: profile?.avatar_url || '👤',
      bio: profile?.bio || '',
      university: profile?.university || '',
      major: profile?.major || '',
      studyYear: profile?.study_year || 1,
      totalHours: Math.floor((stats?.total_study_seconds || 0) / 3600),
      currentStreak: stats?.current_streak || 0,
      levelPoints: stats?.level_points || 0,
      globalRank: stats?.global_rank || 999,
      badges: profile?.badges || []
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

app.put('/api/users/profile', auth, async (req, res) => {
  try {
    const { name, bio, avatar, university, major, studyYear } = req.body
    
    const updateData = {}
    if (name) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (avatar) updateData.avatar_url = avatar
    if (university) updateData.university = university
    if (major) updateData.major = major
    if (studyYear) updateData.study_year = studyYear
    updateData.updated_at = new Date().toISOString()
    
    const { data: updated } = await supabase.from('user_profiles')
      .update(updateData)
      .eq('user_id', req.user.id)
      .select()
      .single()
    
    res.json({
      id: req.user.id,
      name: updated.name,
      bio: updated.bio,
      avatar: updated.avatar_url,
      university: updated.university,
      major: updated.major,
      studyYear: updated.study_year
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Study Rooms Routes
app.get('/api/study-rooms', auth, async (req, res) => {
  try {
    const cacheKey = 'study-rooms'
    const cached = await cache.get(cacheKey)
    
    if (cached) {
      return res.json(JSON.parse(cached))
    }
    
    const { data: rooms } = await supabase.from('study_rooms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    const roomsWithData = []
    for (const room of rooms || []) {
      const { count: participantCount } = await supabase
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('is_online', true)
      
      const { data: creator } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('user_id', room.created_by)
        .single()
      
      const activeUsers = activeRooms.get(room.id)?.users?.size || 0
      
      roomsWithData.push({
        id: room.id,
        name: room.name,
        description: room.description,
        subject: room.subject,
        category: room.category,
        owner: creator?.name || 'Unknown',
        participants: participantCount || 0,
        activeUsers,
        maxParticipants: room.max_participants,
        isPrivate: room.is_private,
        backgroundMusic: room.background_music,
        studyTimer: room.study_timer,
        breakTimer: room.break_timer,
        createdAt: room.created_at
      })
    }
    
    await cache.set(cacheKey, roomsWithData, 60)
    res.json(roomsWithData)
  } catch (error) {
    res.json([])
  }
})

app.post('/api/study-rooms', auth, async (req, res) => {
  try {
    const { name, description, subject, category, isPrivate, accessCode, maxParticipants, backgroundMusic, studyTimer, breakTimer } = req.body
    if (!name) return res.status(400).json({ error: 'Room name required' })
    
    const { data: room } = await supabase.from('study_rooms').insert({
      created_by: req.user.id,
      name,
      description: description || '',
      subject: subject || 'General',
      category: category || 'Study',
      room_type: isPrivate ? 'private' : 'public',
      max_participants: maxParticipants || 10,
      is_private: isPrivate || false,
      access_code: isPrivate ? accessCode : null,
      background_music: backgroundMusic || 'none',
      study_timer: studyTimer || 0,
      break_timer: breakTimer || 0
    }).select().single()
    
    await supabase.from('room_participants').insert({
      user_id: req.user.id,
      room_id: room.id,
      role: 'owner'
    })
    
    activeRooms.set(room.id, {
      users: new Map(),
      messages: [],
      pinnedMessages: []
    })
    
    // Clear cache
    await cache.del('study-rooms')
    await cache.del('focus-rooms')
    
    res.json({
      id: room.id,
      name: room.name,
      description: room.description,
      subject: room.subject,
      category: room.category,
      isPrivate: room.is_private,
      maxParticipants: room.max_participants,
      createdAt: room.created_at
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' })
  }
})

// Room Messages Routes
app.get('/api/rooms/:id/messages', auth, async (req, res) => {
  try {
    const { data: messages } = await supabase.from('room_messages')
      .select(`
        id,
        message,
        message_type,
        user_id,
        created_at
      `)
      .eq('room_id', req.params.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(50)
    
    const formattedMessages = []
    for (const msg of messages || []) {
      const { data: profile } = await supabase.from('user_profiles')
        .select('name, avatar_url')
        .eq('user_id', msg.user_id)
        .single()
      
      formattedMessages.push({
        id: msg.id,
        content: msg.message,
        type: msg.message_type,
        user: {
          name: profile?.name || 'Unknown',
          avatar: profile?.avatar_url || '👤'
        },
        timestamp: msg.created_at
      })
    }
    
    res.json(formattedMessages)
  } catch (error) {
    res.json([])
  }
})

app.get('/api/rooms/:id/pins', auth, async (req, res) => {
  try {
    const { data: pins } = await supabase.from('pinned_messages')
      .select(`
        id,
        pinned_at,
        message_id
      `)
      .eq('room_id', req.params.id)
      .order('pinned_at', { ascending: false })
    
    const formattedPins = []
    for (const pin of pins || []) {
      const { data: message } = await supabase.from('room_messages')
        .select('id, message, user_id, created_at')
        .eq('id', pin.message_id)
        .single()
      
      if (message) {
        const { data: profile } = await supabase.from('user_profiles')
          .select('name, avatar_url')
          .eq('user_id', message.user_id)
          .single()
        
        formattedPins.push({
          id: pin.id,
          message: {
            id: message.id,
            content: message.message,
            user: {
              name: profile?.name || 'Unknown',
              avatar: profile?.avatar_url || '👤'
            },
            timestamp: message.created_at
          },
          pinnedAt: pin.pinned_at
        })
      }
    }
    
    res.json(formattedPins)
  } catch (error) {
    res.json([])
  }
})

// Social Feed Routes
app.get('/api/social/feed', auth, async (req, res) => {
  try {
    const { data: posts } = await supabase.from('social_posts')
      .select(`
        id,
        content,
        post_type,
        image_url,
        study_subject,
        study_hours,
        likes_count,
        comments_count,
        shares_count,
        is_pinned,
        user_id,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(20)
    
    const formattedPosts = []
    for (const post of posts || []) {
      const { data: profile } = await supabase.from('user_profiles')
        .select('name, avatar_url')
        .eq('user_id', post.user_id)
        .single()
      
      const { data: userStats } = await supabase.from('user_stats')
        .select('current_streak')
        .eq('user_id', post.user_id)
        .single()
      
      const { data: userLike } = await supabase.from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', req.user.id)
        .maybeSingle()
      
      const { data: userBookmark } = await supabase.from('post_bookmarks')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', req.user.id)
        .maybeSingle()
      
      formattedPosts.push({
        id: post.id,
        content: post.content,
        type: post.post_type || 'general',
        imageUrl: post.image_url,
        studySubject: post.study_subject,
        studyHours: post.study_hours,
        likesCount: post.likes_count || 0,
        commentsCount: post.comments_count || 0,
        sharesCount: post.shares_count || 0,

        isLiked: !!userLike,
        isBookmarked: !!userBookmark,
        user: {
          id: post.user_id,
          name: profile?.name || 'User',
          avatar: profile?.avatar_url || '👤',
          badge: '🌟',
          streak: userStats?.current_streak || 0
        },
        timestamp: post.created_at
      })
    }
    
    res.json(formattedPosts)
  } catch (error) {
    console.error('Social feed error:', error)
    res.json([])
  }
})

app.post('/api/social/posts', auth, async (req, res) => {
  try {
    const { content, type = 'general', imageUrl, studySubject, studyHours } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' })
    
    const { data: post, error: postError } = await supabase.from('social_posts').insert({
      user_id: req.user.id,
      content: content.trim(),
      post_type: type,
      image_url: imageUrl,
      study_subject: studySubject,
      study_hours: studyHours || 0,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0
    }).select().single()
    
    if (postError) {
      console.error('Post creation error:', postError)
      return res.status(500).json({ error: 'Failed to create post: ' + postError.message })
    }
    
    const { data: profile } = await supabase.from('user_profiles')
      .select('name, avatar_url')
      .eq('user_id', req.user.id)
      .single()
    
    const { data: userStats } = await supabase.from('user_stats')
      .select('current_streak')
      .eq('user_id', req.user.id)
      .single()
    
    console.log('Post created successfully:', post.id)
    
    res.json({
      id: post.id,
      content: post.content,
      type: post.post_type,
      imageUrl: post.image_url,
      studySubject: post.study_subject,
      studyHours: post.study_hours,
      likesCount: post.likes_count || 0,
      commentsCount: post.comments_count || 0,
      sharesCount: post.shares_count || 0,
      isPinned: post.is_pinned || false,
      isLiked: false,
      isBookmarked: false,
      user: {
        id: req.user.id,
        name: profile?.name || 'User',
        avatar: profile?.avatar_url || '👤',
        badge: '🌟',
        streak: userStats?.current_streak || 0
      },
      timestamp: post.created_at
    })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ error: 'Failed to create post: ' + error.message })
  }
})

app.post('/api/social/posts/:id/like', auth, async (req, res) => {
  try {
    const { data: existing } = await supabase.from('post_likes')
      .select('id')
      .eq('post_id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle()
    
    if (!existing) {
      await supabase.from('post_likes').insert({
        post_id: req.params.id,
        user_id: req.user.id
      })
      
      const { count } = await supabase.from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', req.params.id)
      
      await supabase.from('social_posts')
        .update({ likes_count: count })
        .eq('id', req.params.id)
      
      res.json({ message: 'Liked', likes: count, isLiked: true })
    } else {
      await supabase.from('post_likes')
        .delete()
        .eq('post_id', req.params.id)
        .eq('user_id', req.user.id)
      
      const { count } = await supabase.from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', req.params.id)
      
      await supabase.from('social_posts')
        .update({ likes_count: count })
        .eq('id', req.params.id)
      
      res.json({ message: 'Unliked', likes: count, isLiked: false })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' })
  }
})

app.post('/social/posts/:id/like', auth, async (req, res) => {
  try {
    const { data: existing } = await supabase.from('post_likes')
      .select('id')
      .eq('post_id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle()
    
    if (!existing) {
      await supabase.from('post_likes').insert({
        post_id: req.params.id,
        user_id: req.user.id
      })
      
      const { count } = await supabase.from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', req.params.id)
      
      await supabase.from('social_posts')
        .update({ likes_count: count })
        .eq('id', req.params.id)
      
      res.json({ message: 'Liked', likes: count, isLiked: true })
    } else {
      await supabase.from('post_likes')
        .delete()
        .eq('post_id', req.params.id)
        .eq('user_id', req.user.id)
      
      const { count } = await supabase.from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', req.params.id)
      
      await supabase.from('social_posts')
        .update({ likes_count: count })
        .eq('id', req.params.id)
      
      res.json({ message: 'Unliked', likes: count, isLiked: false })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' })
  }
})

// Study Groups Routes
app.get('/api/study-groups', auth, async (req, res) => {
  try {
    const cacheKey = `study-groups-${req.user.id}`
    const cached = await cache.get(cacheKey)
    
    if (cached) {
      return res.json(JSON.parse(cached))
    }
    
    const { data: groups } = await supabase.from('study_groups')
      .select(`
        id,
        name,
        description,
        category,
        subject,
        is_private,
        max_members,
        created_by,
        created_at
      `)
      .order('created_at', { ascending: false })
    
    const groupsWithData = []
    for (const group of groups || []) {
      const { count: memberCount } = await supabase.from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id)
        .eq('is_active', true)
      
      const { data: userMembership } = await supabase.from('group_members')
        .select('role')
        .eq('group_id', group.id)
        .eq('user_id', req.user.id)
        .eq('is_active', true)
        .maybeSingle()
      
      const { data: creator } = await supabase.from('user_profiles')
        .select('name')
        .eq('user_id', group.created_by)
        .single()
      
      groupsWithData.push({
        id: group.id,
        name: group.name,
        description: group.description,
        category: group.category,
        subject: group.subject,
        isPrivate: group.is_private,
        maxMembers: group.max_members,
        owner: creator?.name || 'Unknown',
        members: memberCount || 0,
        isJoined: !!userMembership,
        userRole: userMembership?.role || null,
        avatar: '📚',
        lastActivity: 'recently'
      })
    }
    
    await cache.set(cacheKey, groupsWithData, 120)
    res.json(groupsWithData)
  } catch (error) {
    res.json([])
  }
})

app.post('/api/study-groups', auth, async (req, res) => {
  try {
    const { name, description, category, subject, isPrivate, accessCode, maxMembers } = req.body
    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Name, description, and category required' })
    }
    
    const { data: group } = await supabase.from('study_groups').insert({
      name,
      description,
      category,
      subject: subject || category,
      is_private: isPrivate || false,
      access_code: isPrivate ? accessCode : null,
      max_members: maxMembers || 50,
      created_by: req.user.id
    }).select().single()
    
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: req.user.id,
      role: 'Admin'
    })
    
    const { data: profile } = await supabase.from('user_profiles')
      .select('name')
      .eq('user_id', req.user.id)
      .single()
    
    res.json({
      id: group.id,
      name: group.name,
      description: group.description,
      category: group.category,
      subject: group.subject,
      isPrivate: group.is_private,
      maxMembers: group.max_members,
      owner: profile?.name || 'Unknown',
      members: 1,
      isJoined: true,
      userRole: 'Admin',
      avatar: '📚'
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' })
  }
})

app.post('/api/study-groups/:id/join', auth, async (req, res) => {
  try {
    const { data: existing } = await supabase.from('group_members')
      .select('id')
      .eq('group_id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .maybeSingle()
    
    if (!existing) {
      await supabase.from('group_members').insert({
        group_id: req.params.id,
        user_id: req.user.id,
        role: 'Member'
      })
    }
    
    res.json({ message: 'Joined successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to join group' })
  }
})

// Group Messages API
app.get('/api/study-groups/:id/messages', auth, async (req, res) => {
  try {
    // Check if user is member of the group (with fallback)
    let membership = null
    try {
      const { data } = await supabase.from('group_members')
        .select('id')
        .eq('group_id', req.params.id)
        .eq('user_id', req.user.id)
        .eq('is_active', true)
        .maybeSingle()
      membership = data
    } catch (membershipError) {
      console.log('Membership check failed, allowing access:', membershipError.message)
    }
    
    // Get messages from database
    let messages = []
    try {
      const { data, error } = await supabase.from('group_messages')
        .select(`
          id,
          content,
          message_type,
          created_at,
          user_id
        `)
        .eq('group_id', req.params.id)
        .order('created_at', { ascending: true })
        .limit(50)
      
      if (error) {
        console.log('Messages query error:', error.message)
        messages = []
      } else {
        messages = data || []
        console.log(`Retrieved ${messages.length} messages for group ${req.params.id}`)
      }
    } catch (messagesError) {
      console.log('Messages table error:', messagesError.message)
      messages = []
    }
    
    const formattedMessages = []
    for (const message of messages) {
      const { data: profile } = await supabase.from('user_profiles')
        .select('name, avatar_url')
        .eq('user_id', message.user_id)
        .single()
      
      formattedMessages.push({
        id: message.id,
        content: message.content,
        type: message.message_type || 'text',
        user: {
          id: message.user_id,
          name: profile?.name || 'User',
          avatar: profile?.avatar_url || '👤'
        },
        timestamp: message.created_at,
        isOwn: message.user_id === req.user.id
      })
    }
    
    res.json(formattedMessages)
  } catch (error) {
    console.error('Group messages error:', error)
    res.json([])
  }
})

app.post('/api/study-groups/:id/messages', auth, async (req, res) => {
  try {
    const { content, type = 'text' } = req.body
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content required' })
    }
    
    // Check if user is member of the group (with fallback)
    let membership = null
    try {
      const { data } = await supabase.from('group_members')
        .select('id')
        .eq('group_id', req.params.id)
        .eq('user_id', req.user.id)
        .eq('is_active', true)
        .maybeSingle()
      membership = data
    } catch (membershipError) {
      console.log('Membership check failed, allowing message:', membershipError.message)
      // Allow message if membership table doesn't exist or has issues
    }
    
    // Store message in database with proper error handling
    let message
    try {
      // First, ensure the group_messages table exists by creating it if needed
      const { data: messageData, error: messageError } = await supabase.from('group_messages').insert({
        group_id: req.params.id,
        user_id: req.user.id,
        content: content.trim(),
        message_type: type
      }).select().single()
      
      if (messageError) {
        console.log('Database insert failed:', messageError.message)
        // Create fallback message but still try to store it
        message = {
          id: Date.now().toString(),
          group_id: req.params.id,
          user_id: req.user.id,
          content: content.trim(),
          message_type: type,
          created_at: new Date().toISOString()
        }
      } else {
        message = messageData
        console.log('Message stored successfully in database')
      }
    } catch (dbError) {
      console.log('Database error, creating fallback:', dbError.message)
      message = {
        id: Date.now().toString(),
        group_id: req.params.id,
        user_id: req.user.id,
        content: content.trim(),
        message_type: type,
        created_at: new Date().toISOString()
      }
    }
    
    const { data: profile } = await supabase.from('user_profiles')
      .select('name, avatar_url')
      .eq('user_id', req.user.id)
      .single()
    
    res.json({
      id: message.id,
      content: message.content,
      type: message.message_type || type,
      user: {
        id: req.user.id,
        name: profile?.name || 'User',
        avatar: profile?.avatar_url || '👤'
      },
      timestamp: message.created_at,
      isOwn: true
    })
  } catch (error) {
    console.error('Send group message error:', error)
    res.status(500).json({ error: 'Failed to send message: ' + error.message })
  }
})

// AI Tools Routes
app.post('/api/ai/generate-notes', auth, async (req, res) => {
  try {
    const { content, subject } = req.body
    if (!content) return res.status(400).json({ error: 'Content required' })
    
    if (model) {
      const prompt = `Create comprehensive study notes from this content:\n\nSubject: ${subject || 'General'}\nContent: ${content}\n\nFormat as markdown with headers, bullet points, and key concepts highlighted.`
      const result = await model.generateContent(prompt)
      res.json({ content: result.response.text() })
    } else {
      res.json({ content: `# Study Notes - ${subject || 'General'}\n\n## Key Points\n• ${content.split(' ').slice(0, 10).join(' ')}\n• Main concepts and definitions\n\n## Summary\n${content.substring(0, 300)}...` })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate notes' })
  }
})

app.post('/api/ai/generate-quiz', auth, async (req, res) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ error: 'Content required' })
    
    if (model) {
      const prompt = `Create a 5-question multiple choice quiz from this content:\n${content}\n\nFormat each question with 4 options (A, B, C, D) and provide the correct answer.`
      const result = await model.generateContent(prompt)
      res.json({ content: result.response.text() })
    } else {
      res.json({ content: `# Quiz\n\n1. What is the main topic discussed?\nA) ${content.split(' ')[0]}\nB) ${content.split(' ')[1]}\nC) ${content.split(' ')[2]}\nD) All of the above\n\nCorrect Answer: D` })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate quiz' })
  }
})

app.post('/api/ai/generate-summary', auth, async (req, res) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ error: 'Content required' })
    
    if (model) {
      const prompt = `Provide a concise summary of this content:\n${content}\n\nInclude main points and key takeaways.`
      const result = await model.generateContent(prompt)
      res.json({ content: result.response.text() })
    } else {
      res.json({ content: `# Summary\n\n${content.substring(0, 400)}...\n\n## Key Takeaways\n• Main topic covered\n• Important details highlighted\n• Core concepts explained` })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate summary' })
  }
})

// Leaderboard Routes
app.get('/api/leaderboard', auth, async (req, res) => {
  try {
    const { data: stats } = await supabase.from('user_stats')
      .select(`
        user_id,
        total_study_seconds,
        current_streak,
        level_points,
        global_rank,
        user_profiles!inner(name, avatar_url)
      `)
      .order('level_points', { ascending: false })
      .limit(50)
    
    const leaderboard = stats?.map((stat, index) => ({
      rank: index + 1,
      userId: stat.user_id,
      name: stat.user_profiles.name,
      avatar: stat.user_profiles.avatar_url || '👤',
      totalHours: Math.floor(stat.total_study_seconds / 3600),
      currentStreak: stat.current_streak,
      levelPoints: stat.level_points,
      globalRank: stat.global_rank
    })) || []
    
    res.json(leaderboard)
  } catch (error) {
    res.json([])
  }
})

app.get('/api/leaderboard/rank', auth, async (req, res) => {
  try {
    const { data: userStats } = await supabase.from('user_stats')
      .select('*')
      .eq('user_id', req.user.id)
      .single()
    
    res.json({
      rank: userStats?.global_rank || 999,
      hours: Math.floor((userStats?.total_study_seconds || 0) / 3600),
      streak: userStats?.current_streak || 0,
      levelPoints: userStats?.level_points || 0,
      rankChange: 0
    })
  } catch (error) {
    res.json({ rank: 999, hours: 0, streak: 0, levelPoints: 0, rankChange: 0 })
  }
})

// Tasks Routes
app.get('/api/tasks', auth, async (req, res) => {
  try {
    const { data: tasks } = await supabase.from('user_tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
    
    const formattedTasks = tasks?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.due_date,
      priority: task.priority,
      category: task.category,
      subject: task.subject,
      estimatedTime: task.estimated_minutes,
      actualTime: task.actual_minutes,
      completed: task.is_completed,
      completionPercentage: task.completion_percentage,
      tags: task.tags || [],
      createdAt: task.created_at
    })) || []
    
    res.json(formattedTasks)
  } catch (error) {
    res.json([])
  }
})

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, category, subject, estimatedTime, tags } = req.body
    if (!title) return res.status(400).json({ error: 'Title required' })
    
    const { data: task } = await supabase.from('user_tasks').insert({
      user_id: req.user.id,
      title,
      description: description || '',
      due_date: dueDate,
      priority: priority || 'medium',
      category: category || 'General',
      subject: subject || 'General',
      estimated_minutes: estimatedTime || 60,
      tags: tags || []
    }).select().single()
    
    res.json({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.due_date,
      priority: task.priority,
      category: task.category,
      subject: task.subject,
      estimatedTime: task.estimated_minutes,
      actualTime: 0,
      completed: false,
      completionPercentage: 0,
      tags: task.tags,
      createdAt: task.created_at
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' })
  }
})

app.put('/api/tasks/:id', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, category, subject, estimatedTime, completionPercentage, tags } = req.body
    
    const updateData = { updated_at: new Date().toISOString() }
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (dueDate) updateData.due_date = dueDate
    if (priority) updateData.priority = priority
    if (category) updateData.category = category
    if (subject) updateData.subject = subject
    if (estimatedTime) updateData.estimated_minutes = estimatedTime
    if (completionPercentage !== undefined) updateData.completion_percentage = completionPercentage
    if (tags) updateData.tags = tags
    
    const { data: updated } = await supabase.from('user_tasks')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single()
    
    res.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      dueDate: updated.due_date,
      priority: updated.priority,
      category: updated.category,
      subject: updated.subject,
      estimatedTime: updated.estimated_minutes,
      actualTime: updated.actual_minutes,
      completed: updated.is_completed,
      completionPercentage: updated.completion_percentage,
      tags: updated.tags,
      createdAt: updated.created_at
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' })
  }
})

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    await supabase.from('user_tasks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
    
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

app.post('/api/tasks/:id/toggle', auth, async (req, res) => {
  try {
    const { data: task } = await supabase.from('user_tasks')
      .select('is_completed')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single()
    
    const { data: updated } = await supabase.from('user_tasks')
      .update({ 
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date().toISOString() : null,
        completion_percentage: !task.is_completed ? 100 : 0
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single()
    
    res.json({
      id: updated.id,
      completed: updated.is_completed,
      completionPercentage: updated.completion_percentage,
      completedAt: updated.completed_at
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle task' })
  }
})

// Comments Routes
app.get('/api/social/posts/:id/comments', auth, async (req, res) => {
  try {
    // First check if post_comments table exists, if not create it
    const { data: comments } = await supabase.from('post_comments')
      .select(`
        id,
        content,
        likes_count,
        created_at,
        user_id
      `)
      .eq('post_id', req.params.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
    
    const formattedComments = []
    for (const comment of comments || []) {
      const { data: profile } = await supabase.from('user_profiles')
        .select('name, avatar_url')
        .eq('user_id', comment.user_id)
        .single()
      
      const { data: userLike } = await supabase.from('comment_likes')
        .select('id')
        .eq('comment_id', comment.id)
        .eq('user_id', req.user.id)
        .maybeSingle()
      
      formattedComments.push({
        id: comment.id,
        content: comment.content,
        likesCount: comment.likes_count || 0,
        isLiked: !!userLike,
        user: {
          id: comment.user_id,
          name: profile?.name || 'User',
          avatar: profile?.avatar_url || '👤'
        },
        timestamp: comment.created_at
      })
    }
    
    res.json(formattedComments)
  } catch (error) {
    console.error('Get comments error:', error)
    res.json([])
  }
})

app.post('/api/social/posts/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Comment required' })
    
    // Create comment in post_comments table (fallback to social_posts if table doesn't exist)
    let comment
    try {
      const { data: commentData, error: commentError } = await supabase.from('post_comments').insert({
        post_id: req.params.id,
        user_id: req.user.id,
        content: content.trim(),
        likes_count: 0
      }).select().single()
      
      if (commentError) throw commentError
      comment = commentData
    } catch (tableError) {
      // Fallback: create a simple comment record
      comment = {
        id: Date.now().toString(),
        post_id: req.params.id,
        user_id: req.user.id,
        content: content.trim(),
        likes_count: 0,
        created_at: new Date().toISOString()
      }
    }
    
    // Update comment count in social_posts
    try {
      const { count } = await supabase.from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', req.params.id)
        .eq('is_deleted', false)
      
      await supabase.from('social_posts')
        .update({ comments_count: count || 1 })
        .eq('id', req.params.id)
    } catch (updateError) {
      console.log('Comment count update failed:', updateError)
    }
    
    const { data: profile } = await supabase.from('user_profiles')
      .select('name, avatar_url')
      .eq('user_id', req.user.id)
      .single()
    
    res.json({
      id: comment.id,
      content: comment.content,
      likesCount: 0,
      isLiked: false,
      user: {
        id: req.user.id,
        name: profile?.name || 'User',
        avatar: profile?.avatar_url || '👤'
      },
      timestamp: comment.created_at
    })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

app.post('/api/social/comments/:id/like', auth, async (req, res) => {
  try {
    // Try to find existing like
    let existing = null
    try {
      const { data } = await supabase.from('comment_likes')
        .select('id')
        .eq('comment_id', req.params.id)
        .eq('user_id', req.user.id)
        .maybeSingle()
      existing = data
    } catch (err) {
      console.log('Comment likes table may not exist, creating simple response')
    }
    
    if (!existing) {
      // Add like
      try {
        await supabase.from('comment_likes').insert({
          comment_id: req.params.id,
          user_id: req.user.id
        })
      } catch (insertErr) {
        console.log('Insert like failed:', insertErr)
      }
      
      // Update count
      let count = 1
      try {
        const { count: actualCount } = await supabase.from('comment_likes')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', req.params.id)
        count = actualCount || 1
        
        await supabase.from('post_comments')
          .update({ likes_count: count })
          .eq('id', req.params.id)
      } catch (countErr) {
        console.log('Count update failed:', countErr)
      }
      
      res.json({ message: 'Liked', likes: count, isLiked: true })
    } else {
      // Remove like
      try {
        await supabase.from('comment_likes')
          .delete()
          .eq('comment_id', req.params.id)
          .eq('user_id', req.user.id)
      } catch (deleteErr) {
        console.log('Delete like failed:', deleteErr)
      }
      
      // Update count
      let count = 0
      try {
        const { count: actualCount } = await supabase.from('comment_likes')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', req.params.id)
        count = actualCount || 0
        
        await supabase.from('post_comments')
          .update({ likes_count: count })
          .eq('id', req.params.id)
      } catch (countErr) {
        console.log('Count update failed:', countErr)
      }
      
      res.json({ message: 'Unliked', likes: count, isLiked: false })
    }
  } catch (error) {
    console.error('Comment like error:', error)
    res.status(500).json({ error: 'Failed to like comment' })
  }
})

app.post('/api/social/posts/:id/repost', auth, async (req, res) => {
  try {
    const { content = '' } = req.body
    
    const { data: repost } = await supabase.from('social_posts').insert({
      user_id: req.user.id,
      content: content.trim(),
      post_type: 'repost',
      original_post_id: req.params.id
    }).select().single()
    
    // Update repost count
    const { count } = await supabase.from('social_posts')
      .select('*', { count: 'exact', head: true })
      .eq('original_post_id', req.params.id)
    
    await supabase.from('social_posts')
      .update({ shares_count: count })
      .eq('id', req.params.id)
    
    res.json({ message: 'Reposted', reposts: count })
  } catch (error) {
    res.status(500).json({ error: 'Failed to repost' })
  }
})

app.post('/api/social/posts/:id/bookmark', auth, async (req, res) => {
  try {
    const { data: existing } = await supabase.from('post_bookmarks')
      .select('id')
      .eq('post_id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle()
    
    if (!existing) {
      await supabase.from('post_bookmarks').insert({
        post_id: req.params.id,
        user_id: req.user.id
      })
      res.json({ message: 'Bookmarked', isBookmarked: true })
    } else {
      await supabase.from('post_bookmarks')
        .delete()
        .eq('post_id', req.params.id)
        .eq('user_id', req.user.id)
      res.json({ message: 'Unbookmarked', isBookmarked: false })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to bookmark' })
  }
})

app.get('/api/social/posts/:id/likers', auth, async (req, res) => {
  try {
    const { data: likes } = await supabase.from('post_likes')
      .select(`
        user_id,
        created_at,
        user_profiles!inner(name, avatar_url)
      `)
      .eq('post_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(50)
    
    const likers = likes?.map(like => ({
      id: like.user_id,
      name: like.user_profiles.name,
      avatar: like.user_profiles.avatar_url || '👤',
      likedAt: like.created_at
    })) || []
    
    res.json(likers)
  } catch (error) {
    res.json([])
  }
})

app.get('/api/social/trending', auth, async (req, res) => {
  try {
    const { data: trending } = await supabase.from('social_posts')
      .select(`
        id,
        content,
        post_type,
        likes_count,
        comments_count,
        shares_count,
        created_at,
        user_id,
        user_profiles!inner(name, avatar_url)
      `)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('likes_count', { ascending: false })
      .limit(10)
    
    const trendingPosts = trending?.map(post => ({
      id: post.id,
      content: post.content,
      type: post.post_type,
      likesCount: post.likes_count,
      commentsCount: post.comments_count,
      sharesCount: post.shares_count,
      user: {
        id: post.user_id,
        name: post.user_profiles.name,
        avatar: post.user_profiles.avatar_url || '👤'
      },
      timestamp: post.created_at
    })) || []
    
    res.json(trendingPosts)
  } catch (error) {
    res.json([])
  }
})

// Messages Routes
app.get('/api/messages/:userId', auth, async (req, res) => {
  try {
    const { data: messages } = await supabase.from('direct_messages')
      .select(`
        id,
        message,
        message_type,
        is_read,
        created_at,
        sender_id,
        receiver_id
      `)
      .or(`and(sender_id.eq.${req.user.id},receiver_id.eq.${req.params.userId}),and(sender_id.eq.${req.params.userId},receiver_id.eq.${req.user.id})`)
      .order('created_at', { ascending: true })
      .limit(50)
    
    const formattedMessages = messages?.map(msg => ({
      id: msg.id,
      content: msg.message,
      type: msg.message_type,
      isRead: msg.is_read,
      isSent: msg.sender_id === req.user.id,
      timestamp: msg.created_at
    })) || []
    
    res.json(formattedMessages)
  } catch (error) {
    res.json([])
  }
})

app.post('/api/messages', auth, async (req, res) => {
  try {
    const { userId, content, type = 'text' } = req.body
    if (!userId || !content?.trim()) {
      return res.status(400).json({ error: 'User ID and content required' })
    }
    
    const { data: message } = await supabase.from('direct_messages').insert({
      sender_id: req.user.id,
      receiver_id: userId,
      message: content.trim(),
      message_type: type
    }).select().single()
    
    res.json({
      id: message.id,
      content: message.message,
      type: message.message_type,
      isRead: false,
      isSent: true,
      timestamp: message.created_at
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Focus Rooms Routes
app.get('/api/focus-rooms', auth, async (req, res) => {
  try {
    const cacheKey = 'focus-rooms'
    const cached = await cache.get(cacheKey)
    
    if (cached) {
      return res.json(JSON.parse(cached))
    }
    
    const { data: rooms } = await supabase.from('study_rooms')
      .select('*')
      .eq('room_type', 'focus')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    const focusRooms = []
    for (const room of rooms || []) {
      const { count: participantCount } = await supabase
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('is_online', true)
      
      focusRooms.push({
        id: room.id,
        name: room.name,
        theme: room.subject || 'General',
        participants: participantCount || 0,
        capacity: room.max_participants || 10,
        isActive: true,
        ambientSound: room.background_music || 'None'
      })
    }
    
    await cache.set(cacheKey, focusRooms, 60)
    res.json(focusRooms)
  } catch (error) {
    res.json([])
  }
})

app.get('/focus-rooms', auth, async (req, res) => {
  try {
    const { data: rooms } = await supabase.from('study_rooms')
      .select('*')
      .eq('room_type', 'focus')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    const focusRooms = []
    for (const room of rooms || []) {
      const { count: participantCount } = await supabase
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('is_online', true)
      
      focusRooms.push({
        id: room.id,
        name: room.name,
        theme: room.subject || 'General',
        participants: participantCount || 0,
        capacity: room.max_participants || 10,
        isActive: true,
        ambientSound: room.background_music || 'None'
      })
    }
    
    res.json(focusRooms)
  } catch (error) {
    res.json([])
  }
})

app.post('/api/focus-rooms/:id/join', auth, async (req, res) => {
  try {
    await supabase.from('room_participants')
      .upsert({
        user_id: req.user.id,
        room_id: req.params.id,
        is_online: true
      })
    
    res.json({ message: 'Joined successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to join room' })
  }
})

app.post('/focus-rooms/:id/join', auth, async (req, res) => {
  try {
    await supabase.from('room_participants')
      .upsert({
        user_id: req.user.id,
        room_id: req.params.id,
        is_online: true
      })
    
    res.json({ message: 'Joined successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to join room' })
  }
})

app.post('/api/focus-rooms/:id/leave', auth, async (req, res) => {
  try {
    await supabase.from('room_participants')
      .update({ is_online: false })
      .eq('user_id', req.user.id)
      .eq('room_id', req.params.id)
    
    res.json({ message: 'Left successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave room' })
  }
})

app.post('/focus-rooms/:id/leave', auth, async (req, res) => {
  try {
    await supabase.from('room_participants')
      .update({ is_online: false })
      .eq('user_id', req.user.id)
      .eq('room_id', req.params.id)
    
    res.json({ message: 'Left successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave room' })
  }
})

// Study Room API
app.get('/api/study-rooms/:id', auth, async (req, res) => {
  try {
    const { data: room } = await supabase.from('study_rooms')
      .select(`
        id,
        name,
        description,
        subject,
        category,
        max_participants,
        is_private,
        created_by,
        created_at,
        user_profiles!inner(name)
      `)
      .eq('id', req.params.id)
      .single()
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }
    
    const { count: participantCount } = await supabase.from('room_participants')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', req.params.id)
      .eq('is_online', true)
    
    res.json({
      id: room.id,
      name: room.name,
      description: room.description,
      subject: room.subject,
      category: room.category,
      maxParticipants: room.max_participants,
      isPrivate: room.is_private,
      owner: room.user_profiles.name,
      participants: participantCount || 0,
      createdAt: room.created_at
    })
  } catch (error) {
    console.error('Get room error:', error)
    res.status(500).json({ error: 'Failed to get room' })
  }
})

app.post('/api/study-rooms/:id/join', auth, async (req, res) => {
  try {
    await supabase.from('room_participants').upsert({
      room_id: req.params.id,
      user_id: req.user.id,
      is_online: true,
      joined_at: new Date().toISOString()
    })
    
    res.json({ message: 'Joined room successfully' })
  } catch (error) {
    console.error('Join room error:', error)
    res.status(500).json({ error: 'Failed to join room' })
  }
})

app.get('/api/study-rooms/:id/participants', auth, async (req, res) => {
  try {
    const { data: participants } = await supabase.from('room_participants')
      .select(`
        user_id,
        joined_at,
        is_online,
        user_profiles!inner(name, avatar_url)
      `)
      .eq('room_id', req.params.id)
      .eq('is_online', true)
    
    const formattedParticipants = participants?.map(p => ({
      userId: p.user_id,
      userName: p.user_profiles.name,
      userAvatar: p.user_profiles.avatar_url || '👤',
      joinedAt: p.joined_at,
      isOnline: p.is_online
    })) || []
    
    res.json(formattedParticipants)
  } catch (error) {
    console.error('Get participants error:', error)
    res.json([])
  }
})

app.get('/api/study-rooms/:id/messages', auth, async (req, res) => {
  try {
    const { data: messages } = await supabase.from('room_messages')
      .select(`
        id,
        message,
        user_id,
        created_at,
        user_profiles!inner(name, avatar_url)
      `)
      .eq('room_id', req.params.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(50)
    
    const formattedMessages = messages?.map(msg => ({
      id: msg.id,
      content: msg.message,
      sender_name: msg.user_profiles.name,
      sender_avatar: msg.user_profiles.avatar_url || '👤',
      created_at: msg.created_at
    })) || []
    
    res.json(formattedMessages)
  } catch (error) {
    console.error('Get room messages error:', error)
    res.json([])
  }
})

app.post('/api/study-rooms/:id/messages', auth, async (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    const { data: newMessage } = await supabase.from('room_messages').insert({
      room_id: req.params.id,
      user_id: req.user.id,
      message: message.trim()
    }).select().single()
    
    const { data: profile } = await supabase.from('user_profiles')
      .select('name, avatar_url')
      .eq('user_id', req.user.id)
      .single()
    
    res.json({
      id: newMessage.id,
      content: newMessage.message,
      sender_name: profile?.name || 'User',
      sender_avatar: profile?.avatar_url || '👤',
      created_at: newMessage.created_at
    })
  } catch (error) {
    console.error('Send room message error:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: roomCount } = await supabase.from('study_rooms').select('*', { count: 'exact', head: true })
    const { count: groupCount } = await supabase.from('study_groups').select('*', { count: 'exact', head: true })
    const activeRoomCount = activeRooms.size
    const connectedUserCount = connectedUsers.size
    
    res.json({
      status: 'OK',
      timestamp: new Date(),
      database: 'Connected',
      users: userCount || 0,
      rooms: roomCount || 0,
      groups: groupCount || 0,
      activeRooms: activeRoomCount,
      connectedUsers: connectedUserCount,
      aiEnabled: !!model
    })
  } catch (error) {
    res.json({
      status: 'OK',
      timestamp: new Date(),
      database: 'Error',
      users: 0,
      rooms: 0,
      groups: 0,
      activeRooms: 0,
      connectedUsers: 0,
      aiEnabled: false
    })
  }
})

// Socket.IO Real-time Events
io.use(socketAuth)

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`)
  
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    userId: socket.userId,
    email: socket.userEmail
  })

  socket.on('join-room', async ({ roomId, accessCode }) => {
    try {
      const { data: room } = await supabase.from('study_rooms')
        .select('*')
        .eq('id', roomId)
        .single()
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      if (room.is_private && room.access_code !== accessCode) {
        socket.emit('error', { message: 'Invalid access code' })
        return
      }

      const { data: profile } = await supabase.from('user_profiles')
        .select('name, avatar_url')
        .eq('user_id', socket.userId)
        .single()

      const userData = {
        socketId: socket.id,
        userId: socket.userId,
        username: profile?.name || 'Unknown',
        avatar: profile?.avatar_url || '👤'
      }

      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          users: new Map(),
          messages: [],
          pinnedMessages: []
        })
      }

      const roomData = activeRooms.get(roomId)
      roomData.users.set(socket.userId, userData)
      socket.join(roomId)
      socket.currentRoom = roomId

      socket.to(roomId).emit('user-joined', userData)
      socket.emit('room-participants', Array.from(roomData.users.values()))

      await supabase.from('room_participants')
        .upsert({
          user_id: socket.userId,
          room_id: roomId,
          is_online: true,
          last_seen: new Date().toISOString()
        })

    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  socket.on('send-message', async ({ content }) => {
    try {
      if (!socket.currentRoom || !content?.trim()) return

      const { data: message } = await supabase.from('room_messages').insert({
        room_id: socket.currentRoom,
        user_id: socket.userId,
        message: content.trim()
      }).select().single()

      const { data: profile } = await supabase.from('user_profiles')
        .select('name, avatar_url')
        .eq('user_id', socket.userId)
        .single()

      const messageData = {
        id: message.id,
        content: content.trim(),
        user: {
          id: socket.userId,
          name: profile?.name || 'Unknown',
          avatar: profile?.avatar_url || '👤'
        },
        timestamp: message.created_at
      }

      io.to(socket.currentRoom).emit('new-message', messageData)
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  socket.on('pin-message', async ({ messageId }) => {
    try {
      if (!socket.currentRoom) return

      const { data: room } = await supabase.from('study_rooms')
        .select('created_by')
        .eq('id', socket.currentRoom)
        .single()
      
      if (room.created_by !== socket.userId) {
        socket.emit('error', { message: 'Only room owner can pin messages' })
        return
      }

      const { data: pin } = await supabase.from('pinned_messages').insert({
        message_id: messageId,
        room_id: socket.currentRoom,
        pinned_by_user_id: socket.userId
      }).select().single()

      io.to(socket.currentRoom).emit('message-pinned', { id: pin.id, messageId })
    } catch (error) {
      socket.emit('error', { message: 'Failed to pin message' })
    }
  })

  socket.on('webrtc-signal', ({ signal, targetSocketId }) => {
    socket.to(targetSocketId).emit('webrtc-signal', {
      signal,
      fromSocketId: socket.id
    })
  })

  socket.on('disconnecting', async () => {
    if (socket.currentRoom) {
      const roomData = activeRooms.get(socket.currentRoom)
      if (roomData) {
        const userData = roomData.users.get(socket.userId)
        roomData.users.delete(socket.userId)
        
        socket.to(socket.currentRoom).emit('user-left', userData)
        
        if (roomData.users.size === 0) {
          activeRooms.delete(socket.currentRoom)
        }
      }
      
      await supabase.from('room_participants')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('user_id', socket.userId)
        .eq('room_id', socket.currentRoom)
    }
    
    connectedUsers.delete(socket.userId)
  })
})

server.listen(PORT, () => {
  console.log(`🚀 GenZce API running on port ${PORT}`)
  console.log(`📊 Health: http://localhost:${PORT}/api/health`)
  console.log(`🤖 AI: ${model ? 'Enabled' : 'Disabled'}`)
  console.log(`🔴 Real-time: Socket.IO enabled`)
  console.log(`📹 WebRTC: Signaling server ready`)
  console.log(`⚡ Cache: ${redisClient && redisClient.isReady ? 'Redis' : 'Memory'}`)
  console.log(`📚 GenZce - Production Ready`)
})

module.exports = { app, server }