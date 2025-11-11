// app/auth/callback/page.tsx
// REPLACE YOUR ENTIRE callback page with this

'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...')
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          router.push('/signin?error=session_failed')
          return
        }

        if (!session?.user) {
          console.log('⚠️ No session found, redirecting to signin...')
          router.push('/signin')
          return
        }

        console.log('✅ Session found for user:', session.user.email)

        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()

        if (fetchError) {
          console.error('❌ Error checking profile:', fetchError)
        }

        // Create profile if it doesn't exist
        if (!existingProfile) {
          console.log('📝 Creating profile for new user...')
          
          const username = searchParams.get('username')
          const fullName = searchParams.get('fullName')
          const branch = searchParams.get('branch')

          // Prepare profile data
          const profileData: any = {
            id: session.user.id,
            full_name: fullName || session.user.user_metadata?.full_name || 'User',
            username: username || session.user.user_metadata?.username || `user_${session.user.id.slice(0, 8)}`,
            branch: (branch as any) || session.user.user_metadata?.branch || 'modulex',
            total_logins: 1,
            login_streak: 1,
            last_login: new Date().toISOString(),
            is_online: true,
          }
          
          // Add email if available
          if (session.user.email) {
            profileData.email = session.user.email
          }
          
          const { error: createError } = await supabase.from('profiles').insert(profileData)

          if (createError) {
            console.error('❌ Profile creation error:', createError)
            router.push('/signin?error=profile_creation_failed')
            return
          }

          console.log('✅ Profile created successfully!')
        } else {
          console.log('✅ Profile already exists')
        }

        // Success! Redirect to dashboard
        console.log('🎉 Redirecting to dashboard...')
        router.push('/dashboard')
        
      } catch (error) {
        console.error('💥 Callback error:', error)
        router.push('/signin?error=callback_failed')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-arcyn-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-ios-blue border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-ios-blue text-lg font-semibold">Setting up your account...</p>
        <p className="text-ios-gray-600 text-sm mt-2">You'll be redirected to your dashboard shortly</p>
      </motion.div>
    </div>
  )
}