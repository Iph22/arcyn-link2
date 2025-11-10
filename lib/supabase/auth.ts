// lib/supabase/auth.ts
// REPLACE YOUR ENTIRE auth.ts WITH THIS FIXED VERSION

import { supabase } from './client'

export async function signUp({
  email,
  password,
  fullName,
  username,
  branch,
}: {
  email: string
  password: string
  fullName: string
  username: string
  branch: 'arcyn_x' | 'modulex' | 'nexalab'
}) {
  try {
    console.log('🚀 Starting signup...')
    console.log('📧 Email:', email)
    console.log('👤 Username:', username)
    console.log('🏢 Branch:', branch)

    // Check if username exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (existingUser) {
      throw new Error('Username already taken')
    }

    // Sign up WITHOUT triggers (profile created in callback)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?username=${username}&fullName=${encodeURIComponent(fullName)}&branch=${branch}`,
        data: {
          full_name: fullName,
          username: username,
          branch: branch,
        },
      },
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
      throw authError
    }

    console.log('✅ User created! Check email for confirmation.')
    return authData

  } catch (error: any) {
    console.error('💥 Signup failed:', error)
    throw error
  }
}

export async function signIn({ email, password }: { email: string; password: string }) {
  try {
    console.log('🔐 Signing in:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Signin error:', error)
      throw error
    }

    if (!data.user) {
      throw new Error('No user data returned')
    }

    console.log('✅ Signin successful:', data.user.email)

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError)
      // Don't throw - profile might just not exist yet
    }

    if (!profile) {
      console.log('⚠️ Profile not found - creating from metadata...')
      
      // Create profile from user metadata
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          username: data.user.user_metadata?.username || `user_${data.user.id.slice(0, 8)}`,
          branch: data.user.user_metadata?.branch || 'modulex',
          total_logins: 1,
          login_streak: 1,
          last_login: new Date().toISOString(),
          is_online: true,
        })

      if (createError) {
        console.error('❌ Profile creation error:', createError)
        throw new Error('Could not create profile. Please contact support.')
      }

      console.log('✅ Profile created successfully')
    } else {
      console.log('✅ Profile found, updating login stats...')
      
      // Update login stats
      const lastLogin = profile.last_login ? new Date(profile.last_login) : null
      const today = new Date()
      const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000)

      let newStreak = profile.login_streak || 0
      if (lastLogin && lastLogin > oneDayAgo) {
        newStreak = (profile.login_streak || 0) + 1
      } else {
        newStreak = 1
      }

      await supabase
        .from('profiles')
        .update({
          total_logins: (profile.total_logins || 0) + 1,
          login_streak: newStreak,
          last_login: today.toISOString(),
          is_online: true,
        })
        .eq('id', data.user.id)

      // Log activity (don't fail if this errors)
      try {
        await supabase.from('activity_log').insert({
          user_id: data.user.id,
          activity_type: 'login',
          points_earned: 10,
        })
      } catch (e) {
        console.warn('⚠️ Activity log failed:', e)
      }
    }

    console.log('✅ Sign in complete!')
    return data

  } catch (error: any) {
    console.error('💥 Signin failed:', error)
    throw error
  }
}

export async function signOut() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    await supabase
      .from('profiles')
      .update({ is_online: false, last_seen: new Date().toISOString() })
      .eq('id', user.id)
  }

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return profile
}