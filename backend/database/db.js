// Simple persistent database for development
class SimpleDB {
  constructor() {
    this.dbFile = './database/data.json'
    this.loadData()
    this.nextId = this.getNextId()
    this.initializeData()
  }

  loadData() {
    try {
      const fs = require('fs')
      if (fs.existsSync(this.dbFile)) {
        const data = fs.readFileSync(this.dbFile, 'utf8')
        this.tables = JSON.parse(data)
      } else {
        this.tables = {
          users: [],
          user_profiles: [],
          user_settings: [],
          user_stats: [],
          study_rooms: [],
          room_participants: [],
          room_messages: [],
          direct_messages: [],
          social_posts: [],
          post_likes: [],
          study_groups: [],
          group_members: [],
          user_tasks: []
        }
      }
    } catch (error) {
      console.log('Database file not found, creating new one')
      this.tables = {
        users: [],
        user_profiles: [],
        user_settings: [],
        user_stats: [],
        study_rooms: [],
        room_participants: [],
        room_messages: [],
        direct_messages: [],
        social_posts: [],
        post_likes: [],
        study_groups: [],
        group_members: [],
        user_tasks: []
      }
    }
  }

  saveData() {
    try {
      const fs = require('fs')
      const path = require('path')
      
      // Ensure directory exists
      const dir = path.dirname(this.dbFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(this.dbFile, JSON.stringify(this.tables, null, 2))
    } catch (error) {
      console.error('Failed to save database:', error.message)
    }
  }

  getNextId() {
    let maxId = 0
    Object.values(this.tables).forEach(table => {
      table.forEach(record => {
        if (record.id && record.id > maxId) {
          maxId = record.id
        }
      })
    })
    return maxId + 1
  }

  initializeData() {
    // Add some default focus rooms only if they don't exist
    if (this.tables.study_rooms.length === 0) {
      this.tables.study_rooms = [
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
      ]
      this.saveData()
    }
  }

  generateId() {
    return this.nextId++
  }

  async insert(table, data) {
    if (!this.tables[table]) {
      this.tables[table] = []
    }
    
    const record = {
      id: this.generateId(),
      ...data,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    this.tables[table].push(record)
    this.saveData()
    return record
  }

  async findById(table, id) {
    if (!this.tables[table]) return null
    return this.tables[table].find(record => record.id === parseInt(id))
  }

  async findOne(table, where) {
    if (!this.tables[table]) return null
    return this.tables[table].find(record => {
      return Object.keys(where).every(key => record[key] === where[key])
    })
  }

  async query(table, options = {}) {
    if (!this.tables[table]) return []
    
    let results = [...this.tables[table]]
    
    // Apply where clause
    if (options.where) {
      results = results.filter(record => {
        return Object.keys(options.where).every(key => record[key] === options.where[key])
      })
    }
    
    // Apply ordering
    if (options.order) {
      results.sort((a, b) => {
        const aVal = a[options.order.column]
        const bVal = b[options.order.column]
        
        if (options.order.ascending) {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    }
    
    // Apply limit
    if (options.limit) {
      results = results.slice(0, options.limit)
    }
    
    return results
  }

  async update(table, id, data) {
    if (!this.tables[table]) return null
    
    const index = this.tables[table].findIndex(record => record.id === parseInt(id))
    if (index === -1) return null
    
    this.tables[table][index] = {
      ...this.tables[table][index],
      ...data,
      updated_at: new Date().toISOString()
    }
    
    this.saveData()
    return this.tables[table][index]
  }

  async delete(table, id) {
    if (!this.tables[table]) return false
    
    const index = this.tables[table].findIndex(record => record.id === parseInt(id))
    if (index === -1) return false
    
    this.tables[table].splice(index, 1)
    this.saveData()
    return true
  }

  async count(table, where = {}) {
    if (!this.tables[table]) return 0
    
    if (Object.keys(where).length === 0) {
      return this.tables[table].length
    }
    
    return this.tables[table].filter(record => {
      return Object.keys(where).every(key => record[key] === where[key])
    }).length
  }
}

module.exports = new SimpleDB()