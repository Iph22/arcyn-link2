-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Branches enum
CREATE TYPE branch_type AS ENUM ('arcyn_x', 'modulex', 'nexalab');

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');

-- Message types
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'file', 'code');

-- Call types
CREATE TYPE call_type AS ENUM ('audio', 'video');

-- Call status
CREATE TYPE call_status AS ENUM ('ringing', 'active', 'ended', 'missed');

-- ============================================
-- USERS & PROFILES
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    branch branch_type NOT NULL,
    role user_role DEFAULT 'member',
    bio TEXT,
    department TEXT,
    position TEXT,
    
    -- Gamification
    rank_score INTEGER DEFAULT 0,
    login_streak INTEGER DEFAULT 0,
    last_login TIMESTAMPTZ,
    total_logins INTEGER DEFAULT 0,
    contribution_score INTEGER DEFAULT 0,
    
    -- Status
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMPTZ,
    status_message TEXT,
    
    -- Preferences
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'dark',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    push_token TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHANNELS
-- ============================================

CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    branch branch_type,
    is_private BOOLEAN DEFAULT FALSE,
    is_general BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE channel_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    muted BOOLEAN DEFAULT FALSE,
    UNIQUE(channel_id, user_id)
);

-- ============================================
-- DIRECT MESSAGES
-- ============================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_group BOOLEAN DEFAULT FALSE,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    muted BOOLEAN DEFAULT FALSE,
    UNIQUE(conversation_id, user_id)
);

-- ============================================
-- MESSAGES
-- ============================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT,
    message_type message_type DEFAULT 'text',
    sender_id UUID REFERENCES profiles(id),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Attachments
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    
    -- Reply/Forward
    reply_to_id UUID REFERENCES messages(id),
    forwarded_from_id UUID REFERENCES messages(id),
    
    -- Status
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    
    -- AI
    ai_summary TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT messages_target_check CHECK (
        (channel_id IS NOT NULL AND conversation_id IS NULL) OR
        (channel_id IS NULL AND conversation_id IS NOT NULL)
    )
);

CREATE INDEX idx_messages_channel ON messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ============================================
-- MESSAGE REACTIONS
-- ============================================

CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- ============================================
-- MESSAGE STATUS (Read receipts, Delivery)
-- ============================================

CREATE TABLE message_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    UNIQUE(message_id, user_id)
);

-- ============================================
-- CALLS
-- ============================================

CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_type call_type NOT NULL,
    status call_status DEFAULT 'ringing',
    initiator_id UUID REFERENCES profiles(id),
    channel_id UUID REFERENCES channels(id),
    conversation_id UUID REFERENCES conversations(id),
    
    -- Call details
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration INTEGER,
    
    -- External service
    agora_channel_name TEXT,
    agora_token TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT calls_target_check CHECK (
        (channel_id IS NOT NULL AND conversation_id IS NULL) OR
        (channel_id IS NULL AND conversation_id IS NOT NULL)
    )
);

CREATE TABLE call_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    UNIQUE(call_id, user_id)
);

-- ============================================
-- AI INTERACTIONS
-- ============================================

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    context TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS & FILES
-- ============================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES profiles(id),
    channel_id UUID REFERENCES channels(id),
    
    -- AI Analysis
    ai_summary TEXT,
    ai_tags TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACHIEVEMENTS & GAMIFICATION
-- ============================================

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points INTEGER DEFAULT 0,
    criteria JSONB
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- ============================================
-- ACTIVITY LOG
-- ============================================

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    metadata JSONB,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate rank score
CREATE OR REPLACE FUNCTION calculate_rank_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    SELECT 
        (total_logins * 10) +
        (login_streak * 50) +
        (contribution_score * 5)
    INTO score
    FROM profiles
    WHERE id = user_uuid;
    
    RETURN COALESCE(score, 0);
END;
$$ LANGUAGE plpgsql;

-- Update rank score trigger
CREATE OR REPLACE FUNCTION update_rank_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.rank_score = calculate_rank_score(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_rank_score_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_rank_score();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Channels policies
CREATE POLICY "Users can view channels they're members of" ON channels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM channel_members
            WHERE channel_members.channel_id = channels.id
            AND channel_members.user_id = auth.uid()
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages in their channels" ON messages
    FOR SELECT USING (
        (channel_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM channel_members
            WHERE channel_members.channel_id = messages.channel_id
            AND channel_members.user_id = auth.uid()
        ))
        OR
        (conversation_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = messages.conversation_id
            AND conversation_participants.user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default achievements
INSERT INTO achievements (name, description, icon, points, criteria) VALUES
    ('First Login', 'Welcome to Arcyn Link!', '🎉', 10, '{"type": "login_count", "value": 1}'::jsonb),
    ('Week Warrior', '7-day login streak', '🔥', 100, '{"type": "login_streak", "value": 7}'::jsonb),
    ('AI Pioneer', 'Used AI assistant 10 times', '🤖', 50, '{"type": "ai_queries", "value": 10}'::jsonb),
    ('Code Master', 'Shared 50 code snippets', '💻', 200, '{"type": "code_shares", "value": 50}'::jsonb),
    ('Team Player', 'Sent 1000 messages', '💬', 150, '{"type": "message_count", "value": 1000}'::jsonb),
    ('Call Champion', 'Participated in 50 calls', '📞', 100, '{"type": "call_count", "value": 50}'::jsonb);
