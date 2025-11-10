# 🚀 Supabase Complete Setup Guide for Arcyn Link

## Overview
This guide will walk you through setting up your complete Supabase database with all tables, policies, real-time subscriptions, and storage.

## ⚠️ IMPORTANT: Run in Order!

Execute these SQL files **in the exact order listed** in your Supabase SQL Editor.

---

## 📋 Step-by-Step Setup

### Step 1: Initial Schema (REQUIRED)
**File**: `lib/supabase/migrations/20240101000000_initial_schema.sql`

**What it does**:
- Creates all core tables (profiles, channels, messages, calls, etc.)
- Sets up Row Level Security (RLS) policies
- Creates triggers for auto-updating timestamps
- Adds default achievements
- Creates function to handle new user signups

**How to run**:
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `20240101000000_initial_schema.sql`
4. Click "Run"
5. Wait for success message: ✅ Initial schema created successfully!

**Expected tables created**:
- ✅ profiles
- ✅ channels
- ✅ channel_members
- ✅ conversations
- ✅ conversation_participants
- ✅ messages
- ✅ message_reactions
- ✅ message_status
- ✅ calls
- ✅ call_participants
- ✅ activity_log
- ✅ achievements
- ✅ user_achievements
- ✅ notifications

---

### Step 2: Notification Preferences
**File**: `lib/supabase/migrations/20240102000000_add_notification_preferences.sql`

**What it does**:
- Adds notification_preferences table
- Creates policies for user preferences
- Auto-creates preferences for new users

**How to run**:
1. SQL Editor → New Query
2. Paste contents of `20240102000000_add_notification_preferences.sql`
3. Run
4. Success: ✅ Notification preferences added successfully!

---

### Step 3: Enable Real-time (CRITICAL!)
**File**: `lib/supabase/migrations/20240103000000_enable_realtime.sql`

**What it does**:
- Enables REPLICA IDENTITY FULL for real-time tables
- Creates/updates supabase_realtime publication
- Enables real-time subscriptions for chat

**How to run**:
1. SQL Editor → New Query
2. Paste contents of `20240103000000_enable_realtime.sql`
3. Run
4. Success: ✅ Real-time enabled successfully!

**⚠️ CRITICAL**: Without this step, real-time messaging will NOT work!

---

### Step 4: Fix RLS Policies
**File**: `lib/supabase/migrations/20240104000000_fix_rls_policies.sql`

**What it does**:
- Updates all RLS policies for proper access control
- Ensures users can send/receive messages
- Fixes channel membership policies
- Enables proper real-time filtering

**How to run**:
1. SQL Editor → New Query
2. Paste contents of `20240104000000_fix_rls_policies.sql`
3. Run
4. Success: ✅ RLS policies fixed successfully!

---

### Step 5: Create Storage Bucket
**File**: `lib/supabase/migrations/20240105000000_create_storage_bucket.sql`

**What it does**:
- Creates `files` storage bucket
- Sets up storage policies
- Configures file size limits (50MB)
- Allows specific file types (images, videos, documents)

**How to run**:
1. SQL Editor → New Query
2. Paste contents of `20240105000000_create_storage_bucket.sql`
3. Run
4. Success: ✅ Storage bucket created successfully!

**Verify**:
- Go to Storage → Buckets
- You should see a `files` bucket (public)

---

### Step 6: Create Performance Indexes
**File**: `lib/supabase/migrations/20240106000000_create_indexes.sql`

**What it does**:
- Creates indexes for faster queries
- Optimizes message fetching
- Speeds up channel/user lookups
- Improves leaderboard performance

**How to run**:
1. SQL Editor → New Query
2. Paste contents of `20240106000000_create_indexes.sql`
3. Run
4. Success: ✅ Performance indexes created successfully!

---

## ✅ Verification Checklist

After running all migrations, verify:

### 1. Tables Created
Go to Database → Tables and confirm all tables exist:
- [ ] profiles
- [ ] channels
- [ ] channel_members
- [ ] conversations
- [ ] conversation_participants
- [ ] messages
- [ ] message_reactions
- [ ] message_status
- [ ] calls
- [ ] call_participants
- [ ] activity_log
- [ ] achievements
- [ ] user_achievements
- [ ] notifications
- [ ] notification_preferences

### 2. Real-time Enabled
Go to Database → Replication:
- [ ] `supabase_realtime` publication exists
- [ ] Tables are listed in publication

### 3. Storage Bucket
Go to Storage → Buckets:
- [ ] `files` bucket exists
- [ ] Bucket is public
- [ ] Policies are set

### 4. RLS Policies
Go to Database → Tables → Select any table → Policies:
- [ ] Each table has appropriate policies
- [ ] Policies allow authenticated users to access data

---

## 🧪 Testing Your Setup

### Test 1: Create a User
```bash
# Sign up through your app
# Check Database → Authentication → Users
# Verify profile was auto-created in profiles table
```

### Test 2: Create a Channel
```javascript
// In your app console
const { data, error } = await supabase
  .from('channels')
  .insert({ name: 'test-channel', created_by: user.id })
  .select()

console.log(data) // Should return channel
```

### Test 3: Send a Message
```javascript
// In your app console
const { data, error } = await supabase
  .from('messages')
  .insert({
    content: 'Test message',
    sender_id: user.id,
    channel_id: channelId
  })
  .select()

console.log(data) // Should return message
```

### Test 4: Real-time Subscription
```javascript
// In your app console
const channel = supabase
  .channel('test-messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('New message:', payload)
  })
  .subscribe()

// Send a message and watch console
```

### Test 5: File Upload
```javascript
// In your app
const file = new File(['test'], 'test.txt', { type: 'text/plain' })
const { data, error } = await supabase.storage
  .from('files')
  .upload(`${user.id}/test.txt`, file)

console.log(data) // Should return file path
```

---

## 🔧 Troubleshooting

### Issue: "relation does not exist"
**Solution**: Run migrations in order. You may have skipped a step.

### Issue: "permission denied for table"
**Solution**: Check RLS policies. Run Step 4 again.

### Issue: "Real-time not working"
**Solution**: 
1. Verify Step 3 was run successfully
2. Check Database → Replication
3. Ensure tables are in publication
4. Check browser console for subscription errors

### Issue: "Cannot upload files"
**Solution**:
1. Verify storage bucket exists
2. Check storage policies
3. Ensure file size is under 50MB
4. Check file type is allowed

### Issue: "Cannot insert message"
**Solution**:
1. Check RLS policies (Step 4)
2. Verify user is authenticated
3. Ensure channel_id or conversation_id is provided
4. Check console for specific error

---

## 🎯 Next Steps After Setup

1. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Test Authentication**
   - Sign up a new user
   - Verify profile is created
   - Check notification preferences are created

3. **Test Messaging**
   - Create a channel
   - Send messages
   - Verify real-time updates

4. **Test File Uploads**
   - Upload an image
   - Verify it appears in storage
   - Test file deletion

5. **Monitor Performance**
   - Check query times in Supabase Dashboard
   - Monitor real-time connections
   - Watch for any errors

---

## 📊 Database Statistics

After setup, your database will have:
- **15 tables** for core functionality
- **50+ RLS policies** for security
- **30+ indexes** for performance
- **1 storage bucket** for files
- **Real-time enabled** for 7 tables
- **Auto-triggers** for timestamps and user creation

---

## 🚀 Production Checklist

Before going live:
- [ ] All migrations run successfully
- [ ] Real-time tested and working
- [ ] File uploads tested
- [ ] RLS policies verified
- [ ] Indexes created
- [ ] Environment variables set
- [ ] Authentication working
- [ ] Test users can send messages
- [ ] Test users can create channels
- [ ] Test file uploads work
- [ ] Monitor Supabase dashboard for errors

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Guide](https://supabase.com/docs/guides/realtime)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the Supabase Dashboard logs
2. Check browser console for errors
3. Verify all migrations ran successfully
4. Check RLS policies are correct
5. Ensure real-time is enabled

**Common Error Messages**:
- `new row violates row-level security policy` → Check RLS policies
- `relation does not exist` → Run migrations in order
- `permission denied` → Check authentication and policies
- `Real-time subscription failed` → Enable real-time (Step 3)

---

**Status**: 🎉 Your Supabase database is now fully configured and ready for production!
