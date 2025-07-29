-- Group Messages Database Schema

-- Group messages table
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_user_id ON group_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);

-- Enable Row Level Security
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view messages from groups they belong to" ON group_messages 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = auth.uid() 
    AND group_members.is_active = true
  )
);

CREATE POLICY "Users can create messages in groups they belong to" ON group_messages 
FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = auth.uid() 
    AND group_members.is_active = true
  )
);

CREATE POLICY "Users can update own messages" ON group_messages 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON group_messages 
FOR DELETE TO authenticated 
USING (auth.uid() = user_id);