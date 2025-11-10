# Database Migration Instructions

## Apply Settings Features Migration

To enable all the new settings features, you need to run the database migration.

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `/lib/supabase/migrations/20240102000000_add_notification_preferences.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl/Cmd + Enter`
7. Verify success message

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
cd /home/i22/arcyn-link2
supabase db push
```

### Option 3: Manual SQL Execution

Connect to your PostgreSQL database and run:

```sql
-- Add notification preference columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS message_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS call_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS mention_notifications BOOLEAN DEFAULT TRUE;

-- Add privacy settings columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'everyone',
ADD COLUMN IF NOT EXISTS who_can_message TEXT DEFAULT 'everyone',
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_read_receipts BOOLEAN DEFAULT TRUE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_online_status ON profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen);
```

## Verify Migration

After running the migration, verify it was successful:

```sql
-- Check if new columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN (
  'email_notifications',
  'push_notifications',
  'message_notifications',
  'call_notifications',
  'mention_notifications',
  'profile_visibility',
  'who_can_message',
  'show_online_status',
  'show_read_receipts'
);
```

Expected result: 9 rows showing all new columns.

## Setup Supabase Storage

### Create Storage Bucket (if not exists)

1. Go to **Storage** in Supabase Dashboard
2. Create a bucket named `files` (if it doesn't exist)
3. Set bucket to **Public**
4. Create folders:
   - `avatars/`
   - `direct/`
   - `documents/`

### Storage Policies

Add these policies to the `files` bucket:

```sql
-- Allow authenticated users to upload to avatars folder
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files' AND (storage.foldername(name))[1] = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = 'avatars' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Allow public read access to avatars
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = 'avatars');
```

## Test the Implementation

1. **Navigate to Settings**
   ```
   http://localhost:3000/settings
   ```

2. **Test Each Feature:**
   - [ ] Upload an avatar image
   - [ ] Change password
   - [ ] Update notification preferences
   - [ ] Modify privacy settings
   - [ ] Set a status message
   - [ ] Save changes and verify persistence

3. **Test Account Deletion (on test account only!)**
   - [ ] Click "Delete Account"
   - [ ] Type "DELETE" to confirm
   - [ ] Verify account is deleted and user is signed out

## Rollback (if needed)

If you need to rollback the migration:

```sql
-- Remove new columns
ALTER TABLE profiles
DROP COLUMN IF EXISTS email_notifications,
DROP COLUMN IF EXISTS push_notifications,
DROP COLUMN IF EXISTS message_notifications,
DROP COLUMN IF EXISTS call_notifications,
DROP COLUMN IF EXISTS mention_notifications,
DROP COLUMN IF EXISTS profile_visibility,
DROP COLUMN IF EXISTS who_can_message,
DROP COLUMN IF EXISTS show_online_status,
DROP COLUMN IF EXISTS show_read_receipts;

-- Remove indexes
DROP INDEX IF EXISTS idx_profiles_online_status;
DROP INDEX IF EXISTS idx_profiles_last_seen;
```

## Troubleshooting

### Issue: "Column already exists"
**Solution**: The migration uses `IF NOT EXISTS`, so it's safe to run multiple times.

### Issue: "Permission denied"
**Solution**: Ensure you're connected as a user with ALTER TABLE privileges.

### Issue: "Avatar upload fails"
**Solution**: 
1. Check if `files` bucket exists
2. Verify bucket is public
3. Check storage policies are set correctly

### Issue: "Settings don't save"
**Solution**:
1. Check browser console for errors
2. Verify migration was applied successfully
3. Check Supabase logs for database errors

## Support

For issues or questions:
1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Review `SETTINGS_FEATURES.md` for detailed documentation
