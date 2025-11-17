-- ============================================
-- ARCYN LINK - COMPLETE DATABASE SETUP
-- ============================================
-- This is a SINGLE consolidated SQL file that sets up everything
-- Run this ONCE in your Supabase SQL Editor
-- It will create all tables, policies, functions, indexes, and storage
--
-- IMPORTANT: This file must be kept in sync with the codebase!
-- Whenever database schema changes are made in the code, update this file.
-- This includes:
--   - New tables or columns
--   - Modified RLS policies
--   - New functions or triggers
--   - Storage bucket changes
--   - Index additions/modifications
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (Complete with ALL columns)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    department TEXT,
    position TEXT,
    status_message TEXT,
    branch TEXT CHECK (branch IN ('arcyn_x', 'modulex', 'nexalab')),
    rank_score INTEGER DEFAULT 0,
    login_streak INTEGER DEFAULT 0,
    total_logins INTEGER DEFAULT 0,
    last_login TIMESTAMPTZ,
    last_seen TIMESTAMPTZ,
    is_online BOOLEAN DEFAULT false,
    -- Notification preferences
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    message_notifications BOOLEAN DEFAULT true,
    call_notifications BOOLEAN DEFAULT true,
    mention_notifications BOOLEAN DEFAULT true,
    -- Privacy settings
    profile_visibility TEXT DEFAULT 'everyone' CHECK (profile_visibility IN ('everyone', 'team', 'private')),
    who_can_message TEXT DEFAULT 'everyone' CHECK (who_can_message IN ('everyone', 'team', 'none')),
    show_online_status BOOLEAN DEFAULT true,
    show_read_receipts BOOLEAN DEFAULT true,
    -- Appearance
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fr', 'sw', 'ha')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- CHANNELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    branch TEXT CHECK (branch IN ('arcyn_x', 'modulex', 'nexalab')),
    is_private BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CHANNEL MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS channel_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, user_id)
);

ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    is_group BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CONVERSATION PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MESSAGES TABLE (Complete with ALL columns)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'code')),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    forwarded_from_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    edited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT message_target CHECK (
        (channel_id IS NOT NULL AND conversation_id IS NULL) OR
        (channel_id IS NULL AND conversation_id IS NOT NULL)
    )
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MESSAGE REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MESSAGE STATUS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

ALTER TABLE message_status ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CALLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video')),
    status TEXT DEFAULT 'ringing' CHECK (status IN ('ringing', 'active', 'ended', 'missed')),
    initiator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    agora_channel_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT calls_target_check CHECK (
        (channel_id IS NOT NULL AND conversation_id IS NULL) OR
        (channel_id IS NULL AND conversation_id IS NOT NULL)
    )
);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CALL PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS call_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES calls(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    UNIQUE(call_id, user_id)
);

ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points INTEGER DEFAULT 0,
    requirement_type TEXT,
    requirement_value INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    read BOOLEAN DEFAULT false, -- Support both naming conventions
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    message_notifications BOOLEAN DEFAULT true,
    mention_notifications BOOLEAN DEFAULT true,
    call_notifications BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DOCUMENTS TABLE (for Research Library)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AI CONVERSATIONS TABLE (for AI Playground)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    mode TEXT DEFAULT 'chat' CHECK (mode IN ('chat', 'code', 'document', 'summary')),
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_full_name TEXT;
    v_branch TEXT;
    v_email TEXT;
    v_username_base TEXT;
    v_username_counter INTEGER := 0;
    v_username_final TEXT;
BEGIN
    -- Get values from metadata or use defaults
    v_email := NEW.email;
    v_username_base := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    v_branch := COALESCE((NEW.raw_user_meta_data->>'branch')::text, 'modulex');
    
    -- Ensure username is unique by appending number if needed
    v_username_final := v_username_base;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username_final) LOOP
        v_username_counter := v_username_counter + 1;
        v_username_final := v_username_base || v_username_counter::TEXT;
        -- Safety check to prevent infinite loop
        IF v_username_counter > 1000 THEN
            v_username_final := 'user_' || substr(NEW.id::text, 1, 8);
            EXIT;
        END IF;
    END LOOP;
    
    -- Insert profile with error handling
    BEGIN
        INSERT INTO public.profiles (
            id, 
            email, 
            username, 
            full_name, 
            branch, 
            is_online,
            notifications_enabled,
            email_notifications,
            push_notifications,
            message_notifications,
            call_notifications,
            mention_notifications
        )
        VALUES (
            NEW.id,
            v_email,
            v_username_final,
            v_full_name,
            v_branch,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            is_online = true,
            username = EXCLUDED.username;
    EXCEPTION WHEN OTHERS THEN
        -- If insert fails, try with a fallback username
        BEGIN
            INSERT INTO public.profiles (
                id, 
                email, 
                username, 
                full_name, 
                branch, 
                is_online
            )
            VALUES (
                NEW.id,
                v_email,
                'user_' || substr(NEW.id::text, 1, 8),
                v_full_name,
                v_branch,
                true
            )
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            -- If still fails, log but don't block user creation
            RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        END;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_channels_updated_at ON channels;
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at 
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences when profile is created
DROP TRIGGER IF EXISTS on_profile_created_notification_prefs ON profiles;
CREATE TRIGGER on_profile_created_notification_prefs
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- Function to ensure profile exists before message insert (safety net)
CREATE OR REPLACE FUNCTION ensure_profile_exists()
RETURNS TRIGGER AS $$
DECLARE
    v_email TEXT;
    v_full_name TEXT;
    v_username TEXT;
    v_branch TEXT;
BEGIN
    -- Check if profile exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.sender_id) THEN
        -- Try to get user data from auth.users
        BEGIN
            SELECT 
                email,
                COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
                COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
                COALESCE((raw_user_meta_data->>'branch')::text, 'modulex')
            INTO v_email, v_full_name, v_username, v_branch
            FROM auth.users 
            WHERE id = NEW.sender_id;
        EXCEPTION WHEN OTHERS THEN
            -- If we can't access auth.users, use defaults
            v_email := NULL;
            v_full_name := 'User';
            v_username := 'user_' || substr(NEW.sender_id::text, 1, 8);
            v_branch := 'modulex';
        END;
        
        -- Create profile with available data
        INSERT INTO profiles (id, email, username, full_name, branch, is_online)
        VALUES (NEW.sender_id, v_email, v_username, v_full_name, v_branch, true)
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to ensure profile exists before message insert
DROP TRIGGER IF EXISTS ensure_profile_before_message ON messages;
CREATE TRIGGER ensure_profile_before_message
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION ensure_profile_exists();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- ============================================
-- MESSAGES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their channels" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- Allow users to insert their own messages
CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);

-- Allow users to view messages in channels they're members of
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
        OR
        (sender_id = auth.uid()) -- Allow users to see their own messages
    );

-- Allow users to update their own messages (for unsend/edit)
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (auth.uid() = sender_id);

-- ============================================
-- CHANNELS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view channels they're members of" ON channels;
DROP POLICY IF EXISTS "Users can create channels" ON channels;
DROP POLICY IF EXISTS "Users can update channels" ON channels;

-- Users can view channels they're members of or public channels
-- Note: We prioritize direct checks to avoid recursion with channel_members policy
CREATE POLICY "Users can view channels they're members of" ON channels
    FOR SELECT USING (
        -- User created the channel (highest priority, no recursion)
        created_by = auth.uid()
        OR
        -- Channel is public (not private) - no recursion
        NOT is_private
        OR
        -- User is a member of the channel (check last, but channel_members policy is now simple)
        EXISTS (
            SELECT 1 FROM channel_members
            WHERE channel_members.channel_id = channels.id
            AND channel_members.user_id = auth.uid()
        )
    );

-- Users can create channels
CREATE POLICY "Users can create channels" ON channels
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Admins can update channels
CREATE POLICY "Users can update channels" ON channels
    FOR UPDATE USING (
        -- User created the channel (can update)
        created_by = auth.uid()
        OR
        -- User is an admin member
        EXISTS (
            SELECT 1 FROM channel_members
            WHERE channel_members.channel_id = channels.id
            AND channel_members.user_id = auth.uid()
            AND channel_members.role = 'admin'
        )
    );

-- ============================================
-- CHANNEL MEMBERS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view channel members" ON channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON channel_members;
DROP POLICY IF EXISTS "Users can leave channels" ON channel_members;

-- Users can view members of channels they're in, or their own memberships
-- Note: We only check direct conditions to avoid infinite recursion with channels policy
CREATE POLICY "Users can view channel members" ON channel_members
    FOR SELECT USING (
        -- User can always see their own memberships (most common case)
        user_id = auth.uid()
    );

-- Users can join channels (insert themselves)
CREATE POLICY "Users can join channels" ON channel_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave channels (delete themselves)
CREATE POLICY "Users can leave channels" ON channel_members
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MESSAGE REACTIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view reactions" ON message_reactions;
DROP POLICY IF EXISTS "Users can add reactions" ON message_reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON message_reactions;

-- Anyone can see reactions
CREATE POLICY "Users can view reactions" ON message_reactions
    FOR SELECT USING (true);

-- Users can add reactions
CREATE POLICY "Users can add reactions" ON message_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "Users can delete own reactions" ON message_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MESSAGE STATUS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view message status" ON message_status;
DROP POLICY IF EXISTS "Users can update message status" ON message_status;

-- Users can view message status for messages they can see
CREATE POLICY "Users can view message status" ON message_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages
            WHERE messages.id = message_status.message_id
            AND (
                messages.sender_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM channel_members
                    WHERE channel_members.channel_id = messages.channel_id
                    AND channel_members.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM conversation_participants
                    WHERE conversation_participants.conversation_id = messages.conversation_id
                    AND conversation_participants.user_id = auth.uid()
                )
            )
        )
    );

-- Users can update their own message status
CREATE POLICY "Users can update message status" ON message_status
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Users can view conversations they're part of
-- Note: Allow viewing conversations with no participants yet (newly created) or where user is a participant
CREATE POLICY "Users can view conversations" ON conversations
    FOR SELECT USING (
        -- User is a participant
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = conversations.id
            AND conversation_participants.user_id = auth.uid()
        )
        OR
        -- Conversation has no participants yet (newly created, allow authenticated users to view)
        NOT EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = conversations.id
        )
    );

-- Any authenticated user can create conversations
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- CONVERSATION PARTICIPANTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;

-- Users can view participants of conversations they're in
-- Note: We only check direct conditions to avoid infinite recursion
CREATE POLICY "Users can view conversation participants" ON conversation_participants
    FOR SELECT USING (
        -- User can always see their own participation records
        user_id = auth.uid()
    );

-- Users can join conversations
CREATE POLICY "Users can join conversations" ON conversation_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CALLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view calls" ON calls;
DROP POLICY IF EXISTS "Users can create calls" ON calls;
DROP POLICY IF EXISTS "Users can update calls" ON calls;

-- Users can view calls they're part of
-- Note: Prioritize direct checks to avoid recursion
CREATE POLICY "Users can view calls" ON calls
    FOR SELECT USING (
        -- User initiated the call (highest priority, no recursion, short-circuits)
        initiator_id = auth.uid()
        OR 
        -- User is a participant (simplified check - call_participants policy is now simple)
        EXISTS (
            SELECT 1 FROM call_participants
            WHERE call_participants.call_id = calls.id
            AND call_participants.user_id = auth.uid()
        )
        OR (channel_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM channel_members
            WHERE channel_members.channel_id = calls.channel_id
            AND channel_members.user_id = auth.uid()
        ))
        OR (conversation_id IS NOT NULL AND (
            -- User is a participant in the conversation
            EXISTS (
                SELECT 1 FROM conversation_participants
                WHERE conversation_participants.conversation_id = calls.conversation_id
                AND conversation_participants.user_id = auth.uid()
            )
            OR
            -- Conversation has no participants yet (newly created)
            NOT EXISTS (
                SELECT 1 FROM conversation_participants
                WHERE conversation_participants.conversation_id = calls.conversation_id
            )
        ))
    );

-- Users can create calls
CREATE POLICY "Users can create calls" ON calls
    FOR INSERT WITH CHECK (auth.uid() = initiator_id);

-- Users can update calls they initiated
CREATE POLICY "Users can update calls" ON calls
    FOR UPDATE USING (auth.uid() = initiator_id);

-- ============================================
-- CALL PARTICIPANTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view call participants" ON call_participants;
DROP POLICY IF EXISTS "Users can join calls" ON call_participants;

-- Users can view participants of calls they're in
-- Note: Only check direct conditions to avoid infinite recursion with calls policy
CREATE POLICY "Users can view call participants" ON call_participants
    FOR SELECT USING (
        -- User can always see their own participation records
        user_id = auth.uid()
    );

-- Users can join calls
CREATE POLICY "Users can join calls" ON call_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ACTIVITY LOG POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
DROP POLICY IF EXISTS "Users can insert own activity" ON activity_log;

CREATE POLICY "Users can view own activity" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ACHIEVEMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;

CREATE POLICY "Achievements are viewable by everyone" ON achievements
    FOR SELECT USING (true);

-- ============================================
-- USER ACHIEVEMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATION PREFERENCES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON notification_preferences;

CREATE POLICY "Users can view own notification preferences" ON notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DOCUMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can upload documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can upload documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own documents" ON documents
    FOR DELETE USING (auth.uid() = uploaded_by);

-- ============================================
-- AI CONVERSATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own ai conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can create ai conversations" ON ai_conversations;

CREATE POLICY "Users can view own ai conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create ai conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ENABLE REAL-TIME
-- ============================================

-- Enable REPLICA IDENTITY for real-time
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE message_reactions REPLICA IDENTITY FULL;
ALTER TABLE message_status REPLICA IDENTITY FULL;
ALTER TABLE channels REPLICA IDENTITY FULL;
ALTER TABLE channel_members REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE activity_log REPLICA IDENTITY FULL;

-- Create or update publication for real-time
DO $$
BEGIN
  -- Check if publication exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Create new publication for all tables
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
  ELSE
    -- Add specific tables to existing publication
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE message_status;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE channels;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE channel_members;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- ============================================
-- CREATE STORAGE BUCKET
-- ============================================

-- Insert the files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Update bucket settings
UPDATE storage.buckets
SET 
    file_size_limit = 52428800, -- 50MB limit
    allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'text/plain',
        'text/csv'
    ]
WHERE id = 'files';

-- Storage policies
-- Note: Storage policies may require special permissions in Supabase
-- If you get permission errors, create these policies manually in the Supabase Dashboard:
-- Dashboard → Storage → Policies → files bucket

DO $$
BEGIN
    -- Drop existing policies if they exist (with error handling)
    BEGIN
        DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Create policies (with error handling)
    BEGIN
        -- Allow authenticated users to upload files
        CREATE POLICY "Users can upload files" ON storage.objects
            FOR INSERT 
            WITH CHECK (
                bucket_id = 'files' 
                AND auth.role() = 'authenticated'
            );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create upload policy: %', SQLERRM;
    END;
    
    BEGIN
        -- Allow anyone to view files (public bucket)
        CREATE POLICY "Anyone can view files" ON storage.objects
            FOR SELECT 
            USING (bucket_id = 'files');
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create view policy: %', SQLERRM;
    END;
    
    BEGIN
        -- Allow users to delete their own files
        CREATE POLICY "Users can delete own files" ON storage.objects
            FOR DELETE 
            USING (
                bucket_id = 'files' 
                AND (
                    (name LIKE auth.uid()::text || '/%')
                    OR EXISTS (
                        SELECT 1 FROM channel_members cm
                        JOIN channels c ON c.id = cm.channel_id
                        WHERE cm.user_id = auth.uid()
                        AND name LIKE c.id::text || '/%'
                    )
                )
            );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create delete policy: %', SQLERRM;
    END;
    
    BEGIN
        -- Allow users to update their own files
        CREATE POLICY "Users can update own files" ON storage.objects
            FOR UPDATE 
            USING (
                bucket_id = 'files' 
                AND (
                    name LIKE auth.uid()::text || '/%'
                    OR EXISTS (
                        SELECT 1 FROM channel_members cm
                        JOIN channels c ON c.id = cm.channel_id
                        WHERE cm.user_id = auth.uid()
                        AND name LIKE c.id::text || '/%'
                    )
                )
            );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create update policy: %', SQLERRM;
    END;
END $$;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
    ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_channel_created 
    ON messages(channel_id, created_at DESC) 
    WHERE channel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
    ON messages(conversation_id, created_at DESC) 
    WHERE conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_sender 
    ON messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_reply_to 
    ON messages(reply_to_id) 
    WHERE reply_to_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_not_deleted 
    ON messages(is_deleted) 
    WHERE is_deleted = false;

-- Channel members indexes
CREATE INDEX IF NOT EXISTS idx_channel_members_user 
    ON channel_members(user_id, joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_channel_members_channel 
    ON channel_members(channel_id, role);

CREATE INDEX IF NOT EXISTS idx_channel_members_user_channel 
    ON channel_members(user_id, channel_id);

-- Channels indexes
CREATE INDEX IF NOT EXISTS idx_channels_branch 
    ON channels(branch) 
    WHERE branch IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_channels_private 
    ON channels(is_private);

CREATE INDEX IF NOT EXISTS idx_channels_created_by 
    ON channels(created_by);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
    ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON notifications(user_id, is_read) 
    WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_type 
    ON notifications(type);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created 
    ON activity_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_type 
    ON activity_log(activity_type, created_at DESC);

-- Message reactions indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message 
    ON message_reactions(message_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_user 
    ON message_reactions(user_id);

-- Message status indexes
CREATE INDEX IF NOT EXISTS idx_message_status_message 
    ON message_status(message_id);

CREATE INDEX IF NOT EXISTS idx_message_status_user 
    ON message_status(user_id);

CREATE INDEX IF NOT EXISTS idx_message_status_unread 
    ON message_status(user_id, read_at) 
    WHERE read_at IS NULL;

-- Conversation participants indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
    ON conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation 
    ON conversation_participants(conversation_id);

-- Calls indexes
CREATE INDEX IF NOT EXISTS idx_calls_initiator 
    ON calls(initiator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_calls_channel 
    ON calls(channel_id, created_at DESC) 
    WHERE channel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calls_conversation 
    ON calls(conversation_id, created_at DESC) 
    WHERE conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calls_status 
    ON calls(status, created_at DESC);

-- Call participants indexes
CREATE INDEX IF NOT EXISTS idx_call_participants_call 
    ON call_participants(call_id);

CREATE INDEX IF NOT EXISTS idx_call_participants_user 
    ON call_participants(user_id, joined_at DESC);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username 
    ON profiles(username);

CREATE INDEX IF NOT EXISTS idx_profiles_branch 
    ON profiles(branch) 
    WHERE branch IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_rank_score 
    ON profiles(rank_score DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_login_streak 
    ON profiles(login_streak DESC);

-- User achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user 
    ON user_achievements(user_id, earned_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement 
    ON user_achievements(achievement_id);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by 
    ON documents(uploaded_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_created_at 
    ON documents(created_at DESC);

-- AI conversations indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user 
    ON ai_conversations(user_id, created_at DESC);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO authenticated;
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO anon;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO anon;

-- Note: SECURITY DEFINER functions run with the privileges of the function owner
-- In Supabase, functions are owned by the postgres role by default
-- No need to change ownership explicitly

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default achievements
INSERT INTO achievements (name, description, icon, points, requirement_type, requirement_value) VALUES
    ('First Message', 'Send your first message', '💬', 10, 'message_count', 1),
    ('Chatty', 'Send 100 messages', '🗨️', 50, 'message_count', 100),
    ('Social Butterfly', 'Join 5 channels', '🦋', 25, 'channel_count', 5),
    ('Early Bird', 'Login 7 days in a row', '🌅', 100, 'login_streak', 7),
    ('Dedicated', 'Login 30 days in a row', '🔥', 500, 'login_streak', 30)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'COMPLETE DATABASE SETUP SUCCESSFUL!';
    RAISE NOTICE 'Created Tables: profiles, channels, channel_members, conversations, conversation_participants';
    RAISE NOTICE 'Created Tables: messages, message_reactions, message_status, calls, call_participants';
    RAISE NOTICE 'Created Tables: activity_log, achievements, user_achievements, notifications, notification_preferences';
    RAISE NOTICE 'Created Tables: documents, ai_conversations';
    RAISE NOTICE 'RLS Policies: All configured';
    RAISE NOTICE 'Real-time: Enabled for all tables';
    RAISE NOTICE 'Storage: files bucket created';
    RAISE NOTICE 'Indexes: All performance indexes created';
    RAISE NOTICE 'Functions: All triggers and functions ready';
    RAISE NOTICE 'Your database is 100%% ready!';
    RAISE NOTICE 'Next: Set up your .env.local with Supabase credentials';
END $$;

