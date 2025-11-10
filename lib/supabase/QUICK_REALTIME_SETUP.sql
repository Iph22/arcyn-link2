-- ============================================
-- QUICK REAL-TIME SETUP FOR ARCYN LINK
-- ============================================
-- Run this if you already have tables but real-time isn't working
-- This is a condensed version of migrations 3, 4, and 5

-- ============================================
-- STEP 1: Enable Replica Identity
-- ============================================
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE message_reactions REPLICA IDENTITY FULL;
ALTER TABLE message_status REPLICA IDENTITY FULL;
ALTER TABLE channels REPLICA IDENTITY FULL;
ALTER TABLE channel_members REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- ============================================
-- STEP 2: Create/Update Publication
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
  ELSE
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
    ALTER PUBLICATION supabase_realtime ADD TABLE message_status;
    ALTER PUBLICATION supabase_realtime ADD TABLE channels;
    ALTER PUBLICATION supabase_realtime ADD TABLE channel_members;
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Tables already in publication
END $$;

-- ============================================
-- STEP 3: Fix Message Policies
-- ============================================
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can view messages in their channels" ON messages;
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
        OR (sender_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- ============================================
-- STEP 4: Fix Channel Policies
-- ============================================
DROP POLICY IF EXISTS "Users can view channels they're members of" ON channels;
CREATE POLICY "Users can view channels they're members of" ON channels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM channel_members
            WHERE channel_members.channel_id = channels.id
            AND channel_members.user_id = auth.uid()
        )
        OR NOT is_private
    );

DROP POLICY IF EXISTS "Users can create channels" ON channels;
CREATE POLICY "Users can create channels" ON channels
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ============================================
-- STEP 5: Fix Channel Member Policies
-- ============================================
DROP POLICY IF EXISTS "Users can view channel members" ON channel_members;
CREATE POLICY "Users can view channel members" ON channel_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM channel_members cm
            WHERE cm.channel_id = channel_members.channel_id
            AND cm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can join channels" ON channel_members;
CREATE POLICY "Users can join channels" ON channel_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 6: Fix Reaction Policies
-- ============================================
DROP POLICY IF EXISTS "Users can view reactions" ON message_reactions;
CREATE POLICY "Users can view reactions" ON message_reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add reactions" ON message_reactions;
CREATE POLICY "Users can add reactions" ON message_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reactions" ON message_reactions;
CREATE POLICY "Users can delete own reactions" ON message_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Success!
DO $$
BEGIN
    RAISE NOTICE '✅ Real-time setup complete!';
    RAISE NOTICE '📱 Your chat should now work with real-time updates';
    RAISE NOTICE '🧪 Test by sending a message and watching it appear instantly';
END $$;
