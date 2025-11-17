'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if user is already logged in
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // User is logged in, redirect to dashboard immediately
          router.push('/dashboard')
          return
        }
        
        // No session, redirect to signin after animation
        setChecking(false)
        const timer = setTimeout(() => {
          router.push('/signin')
        }, 2000)

        return () => clearTimeout(timer)
      } catch (error) {
        // On error, redirect to signin
        setChecking(false)
        setTimeout(() => {
          router.push('/signin')
        }, 2000)
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="min-h-screen bg-arcyn-bg flex items-center justify-center overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-ios-blue/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            animate={{
              y: [null, -(typeof window !== 'undefined' ? window.innerHeight : 1080)],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Logo and text */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="w-32 h-32 mx-auto mb-8"
        >
          <img 
          src="./Logo.png" 
          alt="Logo"
          className="w-full h-full object-contain"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-display font-bold bg-gradient-to-r from-ios-blue to-ios-blue-light bg-clip-text text-transparent mb-4"
        >
          ARCYN LINK
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-ios-gray-600 mb-8"
        >
          Accelerating AI Evolution in Africa 🌍
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-2"
        >
          <div className="w-2 h-2 bg-ios-blue rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </motion.div>
      </div>
    </div>
  )
}
