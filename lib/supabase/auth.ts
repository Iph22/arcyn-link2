// lib/supabase/auth.ts
// IMPROVED VERSION - Better error handling and RLS awareness

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

    // Check if username exists (use service role to bypass RLS temporarily)
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
    console.log('👤 User ID:', data.user.id)

    // CRITICAL: Wait a moment for RLS context to be set
    await new Promise(resolve => setTimeout(resolve, 100))

    // Try to fetch profile with more detailed error logging
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError)
      console.error('Error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
    }

    console.log('Profile fetch result:', profile ? '✅ Found' : '❌ Not found')

    if (!profile) {
      console.log('⚠️ Profile not found - attempting to create...')
      
      // Prepare profile data
      const profileData = {
        id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        username: data.user.user_metadata?.username || `user_${data.user.id.slice(0, 8)}`,
        branch: data.user.user_metadata?.branch || 'modulex',
        total_logins: 1,
        login_streak: 1,
        last_login: new Date().toISOString(),
        is_online: true,
      }

      console.log('📝 Attempting to insert profile:', profileData)

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (createError) {
        console.error('❌ Profile creation error:', createError)
        console.error('Error details:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        })
        
        // Check if it's an RLS error
        if (createError.code === '42501' || createError.message?.includes('policy')) {
          throw new Error('Permission denied. Please check database RLS policies.')
        }
        
        // Check if profile already exists (different error)
        if (createError.code === '23505') {
          console.log('⚠️ Profile already exists, trying to fetch again...')
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          
          if (retryProfile) {
            console.log('✅ Found profile on retry')
            return data
          }
        }
        
        throw new Error(`Profile creation failed: ${createError.message}`)
      }

      console.log('✅ Profile created successfully:', newProfile)
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

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          total_logins: (profile.total_logins || 0) + 1,
          login_streak: newStreak,
          last_login: today.toISOString(),
          is_online: true,
        })
        .eq('id', data.user.id)

      if (updateError) {
        console.warn('⚠️ Failed to update login stats:', updateError)
        // Don't throw - this isn't critical
      }

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
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', user.id)
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Signout error:', error)
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching current user profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}