-- Create Performance Indexes
-- These indexes significantly improve query performance

-- ============================================
-- MESSAGES INDEXES
-- ============================================

-- Index for fetching recent messages
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
    ON messages(created_at DESC);

-- Index for channel messages (most common query)
CREATE INDEX IF NOT EXISTS idx_messages_channel_created 
    ON messages(channel_id, created_at DESC) 
    WHERE channel_id IS NOT NULL;

-- Index for conversation messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
    ON messages(conversation_id, created_at DESC) 
    WHERE conversation_id IS NOT NULL;

-- Index for sender messages
CREATE INDEX IF NOT EXISTS idx_messages_sender 
    ON messages(sender_id, created_at DESC);

-- Index for reply threads
CREATE INDEX IF NOT EXISTS idx_messages_reply_to 
    ON messages(reply_to_id) 
    WHERE reply_to_id IS NOT NULL;

-- Index for deleted messages
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted 
    ON messages(is_deleted) 
    WHERE is_deleted = false;

-- ============================================
-- CHANNEL MEMBERS INDEXES
-- ============================================

-- Index for user's channels
CREATE INDEX IF NOT EXISTS idx_channel_members_user 
    ON channel_members(user_id, joined_at DESC);

-- Index for channel's members
CREATE INDEX IF NOT EXISTS idx_channel_members_channel 
    ON channel_members(channel_id, role);

-- Composite index for membership checks
CREATE INDEX IF NOT EXISTS idx_channel_members_user_channel 
    ON channel_members(user_id, channel_id);

-- ============================================
-- CHANNELS INDEXES
-- ============================================

-- Index for branch filtering
CREATE INDEX IF NOT EXISTS idx_channels_branch 
    ON channels(branch) 
    WHERE branch IS NOT NULL;

-- Index for private channels
CREATE INDEX IF NOT EXISTS idx_channels_private 
    ON channels(is_private);

-- Index for channel creator
CREATE INDEX IF NOT EXISTS idx_channels_created_by 
    ON channels(created_by);

-- ============================================
-- NOTIFICATIONS INDEXES
-- ============================================

-- Index for user notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
    ON notifications(user_id, created_at DESC);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON notifications(user_id, is_read) 
    WHERE is_read = false;

-- Index for notification type
CREATE INDEX IF NOT EXISTS idx_notifications_type 
    ON notifications(type);

-- ============================================
-- ACTIVITY LOG INDEXES
-- ============================================

-- Index for user activity
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created 
    ON activity_log(user_id, created_at DESC);

-- Index for activity type
CREATE INDEX IF NOT EXISTS idx_activity_log_type 
    ON activity_log(activity_type, created_at DESC);

-- ============================================
-- MESSAGE REACTIONS INDEXES
-- ============================================

-- Index for message reactions
CREATE INDEX IF NOT EXISTS idx_message_reactions_message 
    ON message_reactions(message_id);

-- Index for user reactions
CREATE INDEX IF NOT EXISTS idx_message_reactions_user 
    ON message_reactions(user_id);

-- ============================================
-- MESSAGE STATUS INDEXES
-- ============================================

-- Index for message status
CREATE INDEX IF NOT EXISTS idx_message_status_message 
    ON message_status(message_id);

-- Index for user message status
CREATE INDEX IF NOT EXISTS idx_message_status_user 
    ON message_status(user_id);

-- Index for unread messages
CREATE INDEX IF NOT EXISTS idx_message_status_unread 
    ON message_status(user_id, read_at) 
    WHERE read_at IS NULL;

-- ============================================
-- CONVERSATION PARTICIPANTS INDEXES
-- ============================================

-- Index for user conversations
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
    ON conversation_participants(user_id);

-- Index for conversation members
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation 
    ON conversation_participants(conversation_id);

-- ============================================
-- CALLS INDEXES
-- ============================================

-- Index for user calls
CREATE INDEX IF NOT EXISTS idx_calls_initiator 
    ON calls(initiator_id, created_at DESC);

-- Index for channel calls
CREATE INDEX IF NOT EXISTS idx_calls_channel 
    ON calls(channel_id, created_at DESC) 
    WHERE channel_id IS NOT NULL;

-- Index for conversation calls
CREATE INDEX IF NOT EXISTS idx_calls_conversation 
    ON calls(conversation_id, created_at DESC) 
    WHERE conversation_id IS NOT NULL;

-- Index for active calls
CREATE INDEX IF NOT EXISTS idx_calls_status 
    ON calls(status, created_at DESC);

-- ============================================
-- CALL PARTICIPANTS INDEXES
-- ============================================

-- Index for call participants
CREATE INDEX IF NOT EXISTS idx_call_participants_call 
    ON call_participants(call_id);

-- Index for user call history
CREATE INDEX IF NOT EXISTS idx_call_participants_user 
    ON call_participants(user_id, joined_at DESC);

-- ============================================
-- PROFILES INDEXES
-- ============================================

-- Index for username lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username 
    ON profiles(username);

-- Index for branch filtering
CREATE INDEX IF NOT EXISTS idx_profiles_branch 
    ON profiles(branch) 
    WHERE branch IS NOT NULL;

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_rank_score 
    ON profiles(rank_score DESC);

-- Index for login streak
CREATE INDEX IF NOT EXISTS idx_profiles_login_streak 
    ON profiles(login_streak DESC);

-- ============================================
-- USER ACHIEVEMENTS INDEXES
-- ============================================

-- Index for user achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user 
    ON user_achievements(user_id, earned_at DESC);

-- Index for achievement tracking
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement 
    ON user_achievements(achievement_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Performance indexes created successfully!';
    RAISE NOTICE '🚀 Database is now optimized for production use';
    RAISE NOTICE '📝 Setup complete! Your database is ready.';
END $$;
