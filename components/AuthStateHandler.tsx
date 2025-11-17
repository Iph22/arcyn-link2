'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthStateHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Listen for auth state changes (login/logout from other tabs, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state changed:', event, session?.user?.email)
      }

      // If user signed in and is on auth pages, redirect to dashboard
      if (event === 'SIGNED_IN' && session?.user) {
        const isAuthPage = pathname?.startsWith('/signin') || 
                          pathname?.startsWith('/signup') || 
                          pathname === '/'
        
        if (isAuthPage) {
          router.push('/dashboard')
        }
      }

      // If user signed out and is on protected pages, redirect to signin
      if (event === 'SIGNED_OUT') {
        const isProtectedPage = pathname?.startsWith('/dashboard') || 
                               pathname?.startsWith('/settings') ||
                               pathname?.startsWith('/profile')
        
        if (isProtectedPage) {
          router.push('/signin')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  // This component doesn't render anything
  return null
}

