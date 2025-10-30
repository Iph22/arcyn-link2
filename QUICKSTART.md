# ⚡ Arcyn Link - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (Currently Running)

```bash
npm install
```

This is currently in progress. Wait for it to complete.

### Step 2: Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env.local
```

**Minimum Required Variables:**

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Claude AI (REQUIRED for AI features)
ANTHROPIC_API_KEY=sk-ant-your-key

# Optional (can add later)
PINECONE_API_KEY=your_key
AGORA_APP_ID=your_id
```

### Step 3: Set Up Supabase Database

#### Quick Option (Supabase Dashboard):

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor
4. Copy & paste the entire contents of:
   `supabase/migrations/20240101000000_initial_schema.sql`
5. Click "Run"

#### CLI Option:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 5: Create Your First Account

1. You'll be redirected to `/signin`
2. Click "Sign Up"
3. Fill in:
   - Full Name: `John Doe`
   - Username: `johndoe`
   - Email: `john@example.com`
   - Password: `password123`
   - Branch: Select `Arcyn.x`, `Modulex`, or `Nexalab`
4. Click "Create Account"

## 🎉 You're Done!

You should now see the dashboard with:
- Welcome message
- Activity stats
- Login streak
- Quick actions

## 🔥 What's Working Right Now

✅ **Authentication**
- Sign up with branch selection
- Sign in with email/password
- Automatic login streak tracking
- Session management

✅ **Dashboard**
- User profile display
- Activity statistics
- Streak tracking
- Navigation sidebar

✅ **Database**
- All tables created
- Row Level Security enabled
- Triggers and functions active
- Seed data loaded

## 🚧 What's Coming Next

The following features have the backend ready but need UI:

🔨 **Chat System** (40% complete)
- Real-time messaging hooks ready
- Need to build chat UI

🔨 **AI Playground** (50% complete)
- Claude integration ready
- Need to build interface

⏳ **Leaderboard** (0% complete)
- Database schema ready
- Need to build UI

⏳ **Profile Page** (0% complete)
- Profile data ready
- Need to build display

⏳ **Video Calls** (20% complete)
- Agora library integrated
- Need to build call UI

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env.local` file
- Verify Supabase URL and key are correct
- Ensure Supabase project is active

### "npm install fails"
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (need 18+)

### "Page not found"
- Make sure dev server is running
- Check the URL is correct
- Try clearing browser cache

### Database errors
- Ensure migrations were applied
- Check Supabase dashboard for errors
- Verify RLS policies are enabled

## 📚 Next Steps

1. **Explore the Dashboard**
   - Check your profile in the sidebar
   - View your stats
   - See your login streak

2. **Read the Documentation**
   - `README.md` - Full project overview
   - `SETUP_GUIDE.md` - Detailed setup instructions
   - `PROJECT_STATUS.md` - Current implementation status

3. **Start Building**
   - Check `PROJECT_STATUS.md` for what needs to be built
   - Pick a feature to implement
   - Follow the existing code patterns

## 🎨 Design Preview

The app features a stunning **Black & Gold** theme:
- Deep black backgrounds (#0A0A0B)
- Gold accents (#F59E0B)
- Glassmorphism effects
- Smooth animations
- 3D elements

## 🔑 Test Credentials

For testing, you can create multiple accounts with different branches:

**Arcyn.x Member:**
- Email: `arcynx@test.com`
- Branch: Arcyn.x

**Modulex Member:**
- Email: `modulex@test.com`
- Branch: Modulex

**Nexalab Member:**
- Email: `nexalab@test.com`
- Branch: Nexalab

## 💡 Pro Tips

1. **Use the Supabase Dashboard**
   - Monitor real-time database changes
   - Check authentication logs
   - View table data

2. **Check Browser Console**
   - Useful for debugging
   - Shows API calls
   - Displays errors

3. **Hot Reload**
   - Changes auto-refresh
   - No need to restart server
   - Fast development cycle

## 🌟 Features Showcase

### Gamification System
- **Rank Scores**: Earn points for activity
- **Login Streaks**: Daily login rewards
- **Achievements**: Unlock badges
- **Leaderboard**: Compete with others

### AI Integration
- **Claude AI**: Powered by Anthropic
- **Code Help**: Get coding assistance
- **Document Analysis**: Analyze documents
- **Chat Summaries**: Summarize conversations

### Real-Time Features
- **Instant Messaging**: WebSocket powered
- **Live Updates**: See changes immediately
- **Online Status**: Know who's active
- **Read Receipts**: Message delivery status

## 🎯 Mission

**Accelerating AI Evolution in Africa** 🌍

Arcyn Link connects AI workers across three branches to collaborate, learn, and innovate together.

---

**Need Help?** Check the full documentation or contact the team.

**Black & Gold. Innovation & Excellence.**
