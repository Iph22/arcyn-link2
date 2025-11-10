-- Enable Real-time for Messaging
-- CRITICAL: This enables real-time subscriptions for chat functionality

-- ============================================
-- STEP 1: Enable Replica Identity
-- ============================================
-- This allows Supabase to track changes for real-time updates

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE message_reactions REPLICA IDENTITY FULL;
ALTER TABLE message_status REPLICA IDENTITY FULL;
ALTER TABLE channels REPLICA IDENTITY FULL;
ALTER TABLE channel_members REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE activity_log REPLICA IDENTITY FULL;

-- ============================================
-- STEP 2: Create or Update Publication
-- ============================================
-- This publishes table changes to real-time subscribers

DO $$
BEGIN
  -- Check if publication exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Create new publication for all tables
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
    RAISE NOTICE '✅ Created supabase_realtime publication';
  ELSE
    -- Add specific tables to existing publication
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE messages;
      RAISE NOTICE '✅ Added messages to publication';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE '⚠️ messages already in publication';
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
      RAISE NOTICE '✅ Added message_reactions to publication';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE '⚠️ message_reactions already in publication';
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE message_status;
      RAISE NOTICE '✅ Added message_status to publication';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE '⚠️ message_status already in publication';
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE channels;
      RAISE NOTICE '✅ Added channels to publication';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE '⚠️ channels already in publication';
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE channel_members;
      RAISE NOTICE '✅ Added channel_members to publication';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE '⚠️ channel_members already in publication';
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
      RAISE NOTICE '✅ Added notifications to publication';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE '⚠️ notifications already in publication';
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
      RAISE NOTICE '✅ Added activity_log to publication';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE '⚠️ activity_log already in publication';
    END;
  END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Real-time enabled successfully!';
    RAISE NOTICE '📝 Next: Run 20240104000000_fix_rls_policies.sql';
END $$;
