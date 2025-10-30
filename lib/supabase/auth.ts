import { supabase } from './client'
import type { Profile } from './client'

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return null
    }

    // Fetch the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return null
    }

    return profile as Profile
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function signIn({
  email,
  password,
}: {
  email: string
  password: string
}) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (!data.user) {
      throw new Error('No user data returned')
    }

    // Update last login and online status
    await supabase
      .from('profiles')
      .update({
        last_login: new Date().toISOString(),
        is_online: true,
        total_logins: supabase.rpc('increment', { x: 1, row_id: data.user.id }),
      })
      .eq('id', data.user.id)

    return data
  } catch (error: any) {
    console.error('Sign in error:', error)
    throw new Error(error.message || 'Failed to sign in')
  }
}

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
    console.log('🚀 Starting signup process...', { email, username, branch })

    // Step 1: Check if username is already taken
    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    // Ignore "no rows returned" error (PGRST116)
    if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
      console.error('❌ Username check error:', usernameCheckError)
      throw new Error('Error checking username availability')
    }

    if (existingUsername) {
      throw new Error('Username already taken')
    }

    console.log('✅ Username available')

    // Step 2: Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
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

    if (!authData.user) {
      throw new Error('No user data returned from authentication')
    }

    console.log('✅ User created in auth system:', authData.user.id)

    // Step 3: Wait for database triggers to execute
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Step 4: Check if profile was created by trigger
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Profile check error:', checkError)
    }

    console.log('Profile exists:', existingProfile ? '✅ Yes' : '❌ No')

    // Step 5: If profile doesn't exist, create it manually
    if (!existingProfile) {
      console.log('📝 Creating profile manually...')
      
      const profileData = {
        id: authData.user.id,
        email: email,
        full_name: fullName,
        username: username,
        branch: branch,
        total_logins: 1,
        login_streak: 1,
        last_login: new Date().toISOString(),
        is_online: true,
      }

      console.log('📋 Profile data:', profileData)

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()

      if (profileError) {
        console.error('❌ Profile creation error:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        })
        
        // Check if it's a duplicate key error (profile created by trigger)
        if (profileError.code === '23505') {
          console.log('⚠️ Profile already exists (created by trigger)')
          return authData
        }
        
        // Throw detailed error
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      console.log('✅ Profile created successfully:', newProfile)
    }

    // Step 6: Log the signup activity (optional, don't fail if this errors)
    try {
      const { error: activityError } = await supabase
        .from('activity_log')
        .insert({
          user_id: authData.user.id,
          activity_type: 'signup',
          points_earned: 50,
        })

      if (activityError) {
        console.warn('⚠️ Activity log error:', activityError)
      } else {
        console.log('✅ Activity logged successfully')
      }
    } catch (activityError) {
      console.warn('⚠️ Could not log activity:', activityError)
      // Don't fail the entire signup if activity logging fails
    }

    console.log('🎉 Signup completed successfully!')
    return authData

  } catch (error: any) {
    console.error('💥 Signup failed:', {
      message: error.message,
      error: error,
    })
    
    // Re-throw with a user-friendly message
    if (error.message.includes('already taken')) {
      throw new Error('Username already taken')
    } else if (error.message.includes('Invalid email')) {
      throw new Error('Please enter a valid email address')
    } else if (error.message.includes('Password')) {
      throw new Error('Password must be at least 6 characters')
    } else {
      throw new Error(error.message || 'Failed to create account. Please try again.')
    }
  }
}