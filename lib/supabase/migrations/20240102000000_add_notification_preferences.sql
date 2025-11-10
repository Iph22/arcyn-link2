-- Add notification preference columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS message_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS call_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS mention_notifications BOOLEAN DEFAULT TRUE;

-- Add privacy settings columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'everyone', -- 'everyone', 'team', 'private'
ADD COLUMN IF NOT EXISTS who_can_message TEXT DEFAULT 'everyone', -- 'everyone', 'team', 'none'
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_read_receipts BOOLEAN DEFAULT TRUE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_online_status ON profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen);
