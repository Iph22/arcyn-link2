import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Add debugging
console.log('Supabase URL:', supabaseUrl ? '✓ Found' : '✗ Missing')
console.log('Supabase Key:', supabaseAnonKey ? '✓ Found' : '✗ Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export interface Profile {
  id: string
  email: string
  full_name: string
  username: string
  branch: 'arcyn_x' | 'modulex' | 'nexalab'
  total_logins: number
  login_streak: number
  last_login: string
  last_seen?: string
  is_online: boolean
  avatar_url?: string
  bio?: string
  created_at?: string
  updated_at?: string
}

export interface Message {
  id: string
  content: string
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'code'
  sender_id: string
  channel_id?: string
  conversation_id?: string
  file_url?: string
  reply_to_id?: string
  forwarded_from_id?: string
  is_deleted: boolean
  deleted_at?: string
  created_at: string
  updated_at?: string
}