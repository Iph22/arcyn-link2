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
        // Get session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error during email confirmation:', error)
          router.push('/signin?error=confirmation_failed')
          return
        }

        if (session?.user) {
          // Check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle()

          // Create profile if it doesn't exist
          if (!profile) {
            const username = searchParams.get('username')
            const fullName = searchParams.get('fullName')
            const branch = searchParams.get('branch')

            await supabase.from('profiles').insert({
              id: session.user.id,
              email: session.user.email!,
              full_name: fullName || session.user.user_metadata?.full_name || 'User',
              username: username || session.user.user_metadata?.username || `user_${session.user.id.slice(0, 8)}`,
              branch: (branch as any) || session.user.user_metadata?.branch || 'modulex',
              total_logins: 1,
              login_streak: 1,
              last_login: new Date().toISOString(),
              is_online: true,
            })
          }

          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          router.push('/signin')
        }
      } catch (error) {
        console.error('Callback error:', error)
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
          className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-gold-500 text-lg font-semibold">Confirming your email...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we set up your account</p>
      </motion.div>
    </div>
  )
}