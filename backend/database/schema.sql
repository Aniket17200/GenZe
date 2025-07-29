-- StudyStream Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT '👤',
    bio TEXT DEFAULT '',
    study_preferences JSON DEFAULT '[]',
    goals JSON DEFAULT '[]',
    is_online BOOLEAN DEFAULT false,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Focus rooms table
CREATE TABLE focus_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    theme VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 50,
    ambient_sound VARCHAR(100) DEFAULT 'None',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room participants table
CREATE TABLE room_participants (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES focus_rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- Study groups table
CREATE TABLE study_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    is_private BOOLEAN DEFAULT false,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    avatar VARCHAR(10) DEFAULT '📚',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group members table
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'Member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- Posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    study_time VARCHAR(20),
    achievement VARCHAR(255),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post likes table
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(100) DEFAULT 'General',
    estimated_time INTEGER DEFAULT 60,
    study_time INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User statistics table
CREATE TABLE user_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_hours INTEGER DEFAULT 0,
    sessions_joined INTEGER DEFAULT 0,
    sessions_hosted INTEGER DEFAULT 0,
    study_streak INTEGER DEFAULT 0,
    achievements JSON DEFAULT '[]',
    last_streak_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) DEFAULT 'direct',
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation participants table
CREATE TABLE conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard view
CREATE VIEW leaderboard_view AS
SELECT 
    u.id,
    u.name,
    u.avatar,
    us.total_hours,
    us.study_streak,
    us.sessions_joined,
    ROW_NUMBER() OVER (ORDER BY us.total_hours DESC, us.study_streak DESC) as rank
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE u.is_online = true OR us.total_hours > 0
ORDER BY us.total_hours DESC, us.study_streak DESC;

-- Insert default focus rooms
INSERT INTO focus_rooms (name, theme, description, capacity, ambient_sound) VALUES
('Silent Study Hall', 'Library', 'Pure focus, no distractions', 50, 'Rain'),
('Pomodoro Power', 'Timer-based', '25min focus, 5min break cycles', 30, 'Forest'),
('Study Café', 'Casual', 'Relaxed atmosphere with light chat', 40, 'Café'),
('Deep Work Zone', 'Intensive', 'For serious study sessions', 25, 'White Noise');

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_user_stats_total_hours ON user_stats(total_hours DESC);