-- Fix RLS Policies for Real-time Messaging
-- This ensures users can properly send and receive messages

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Drop existing policies
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
CREATE POLICY "Users can view channels they're members of" ON channels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM channel_members
            WHERE channel_members.channel_id = channels.id
            AND channel_members.user_id = auth.uid()
        )
        OR NOT is_private -- Public channels visible to all
    );

-- Users can create channels
CREATE POLICY "Users can create channels" ON channels
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Admins can update channels
CREATE POLICY "Users can update channels" ON channels
    FOR UPDATE USING (
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

-- Users can view members of channels they're in
CREATE POLICY "Users can view channel members" ON channel_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM channel_members cm
            WHERE cm.channel_id = channel_members.channel_id
            AND cm.user_id = auth.uid()
        )
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
CREATE POLICY "Users can view conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = conversations.id
            AND conversation_participants.user_id = auth.uid()
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
CREATE POLICY "Users can view conversation participants" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
            AND cp.user_id = auth.uid()
        )
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
CREATE POLICY "Users can view calls" ON calls
    FOR SELECT USING (
        initiator_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM call_participants
            WHERE call_participants.call_id = calls.id
            AND call_participants.user_id = auth.uid()
        )
        OR (channel_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM channel_members
            WHERE channel_members.channel_id = calls.channel_id
            AND channel_members.user_id = auth.uid()
        ))
        OR (conversation_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = calls.conversation_id
            AND conversation_participants.user_id = auth.uid()
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
CREATE POLICY "Users can view call participants" ON call_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_participants.call_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can join calls
CREATE POLICY "Users can join calls" ON call_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies fixed successfully!';
    RAISE NOTICE '📝 Next: Run 20240105000000_create_storage_bucket.sql';
END $$;
