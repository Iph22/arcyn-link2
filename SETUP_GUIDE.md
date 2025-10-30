# 🚀 Arcyn Link - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase CLI** (install with `npm install -g supabase`)

## 🔧 Step-by-Step Setup

### 1. Install Dependencies

The dependencies are currently being installed. Once complete, you should have all necessary packages.

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Claude AI
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Pinecone (Optional for semantic search)
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=arcyn-link-embeddings

# Agora.io (Optional for video/audio calls)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Set Up Supabase

#### Option A: Use Supabase Cloud

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key to `.env.local`
3. In the Supabase dashboard, go to SQL Editor
4. Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql`
5. Paste and run it in the SQL Editor

#### Option B: Use Local Supabase

```bash
# Initialize Supabase locally
supabase init

# Start Supabase services
supabase start

# This will output your local credentials - add them to .env.local
```

### 4. Apply Database Migrations

If using Supabase CLI:

```bash
# Link to your project (cloud)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Or apply manually
supabase db reset
```

### 5. Verify Database Setup

Check that all tables were created:

- profiles
- channels
- channel_members
- conversations
- conversation_participants
- messages
- message_reactions
- message_status
- calls
- call_participants
- ai_conversations
- ai_messages
- documents
- achievements
- user_achievements
- activity_log
- notifications

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 First Steps

### 1. Create Your First Account

1. Navigate to `/signup`
2. Fill in your details:
   - Full Name
   - Username
   - Email
   - Password
   - Select your branch (Arcyn.x, Modulex, or Nexalab)
3. Click "Create Account"

### 2. Explore the Dashboard

After signing in, you'll see:
- **Home**: Overview of your activity
- **Chat**: Real-time messaging
- **Calls**: Voice/video calls
- **AI Playground**: Interact with Claude AI
- **Leaderboard**: See top contributors

## 🔐 Setting Up External Services

### Claude AI (Required for AI features)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add it to `.env.local` as `ANTHROPIC_API_KEY`

### Agora.io (Optional - for video/audio calls)

1. Sign up at [agora.io](https://www.agora.io)
2. Create a new project
3. Get your App ID and Certificate
4. Add them to `.env.local`

### Pinecone (Optional - for semantic search)

1. Sign up at [pinecone.io](https://www.pinecone.io)
2. Create a new index named `arcyn-link-embeddings`
3. Set dimension to 1536 (for OpenAI embeddings)
4. Add your API key to `.env.local`

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests (requires Playwright)
npm run test:e2e

# Coverage
npm run test:coverage
```

### Manual Testing Checklist

- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] View dashboard
- [ ] Send a message
- [ ] React to a message
- [ ] Use AI Playground
- [ ] Check leaderboard
- [ ] Update profile

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

Or use the CLI:

```bash
npm install -g vercel
vercel --prod
```

### Environment Variables in Vercel

Add all variables from `.env.local` to your Vercel project settings.

## 🐛 Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database connection errors
- Verify your Supabase URL and keys
- Check if Supabase project is active
- Ensure RLS policies are set up correctly

#### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### TypeScript errors
```bash
# Regenerate types
npm run build
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 🆘 Getting Help

If you encounter issues:

1. Check the [README.md](./README.md)
2. Review error logs in the console
3. Check Supabase logs in the dashboard
4. Contact the development team

## 🎉 You're Ready!

Your Arcyn Link installation is complete. Start collaborating and accelerating AI evolution in Africa! 🌍

---

**Black & Gold. Innovation & Excellence.**
