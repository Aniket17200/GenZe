// Database initialization script
const fs = require('fs')
const path = require('path')

const dbFile = path.join(__dirname, 'data.json')

// Create initial database structure
const initialData = {
  users: [],
  user_profiles: [],
  user_settings: [],
  user_stats: [],
  study_rooms: [
    {
      id: 1,
      name: "Silent Study Hall",
      description: "Pure focus, no distractions",
      subject: "Library",
      room_type: "focus",
      max_participants: 50,
      is_private: false,
      created_by: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Pomodoro Power",
      description: "25min focus, 5min break cycles",
      subject: "Timer-based",
      room_type: "focus",
      max_participants: 30,
      is_private: false,
      created_by: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: "Study Café",
      description: "Relaxed atmosphere with light chat",
      subject: "Casual",
      room_type: "focus",
      max_participants: 40,
      is_private: false,
      created_by: 1,
      created_at: new Date().toISOString()
    }
  ],
  room_participants: [],
  room_messages: [],
  direct_messages: [],
  social_posts: [],
  post_likes: [],
  study_groups: [],
  group_members: [],
  user_tasks: []
}

// Initialize database if it doesn't exist
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2))
  console.log('✅ Database initialized successfully')
} else {
  console.log('📁 Database already exists')
}

module.exports = initialData