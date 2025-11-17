'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signIn } from '@/lib/supabase/auth'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { isValidEmail } from '@/lib/utils/validation'
import { sanitizeUserInput } from '@/lib/utils/sanitize'
import { supabase } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // User is already logged in, redirect to dashboard
          router.push('/dashboard')
          return
        }
      } catch (error) {
        // Ignore errors, just show signin form
      } finally {
        setChecking(false)
      }
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!formData.password) {
      toast.error('Please enter your password')
      return
    }

    setLoading(true)

    try {
      await signIn({
        email: sanitizeUserInput(formData.email.toLowerCase().trim()),
        password: formData.password,
      })
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-arcyn-bg flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-ios-blue rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-arcyn-bg relative overflow-hidden flex items-center justify-center">
      {/* Particle Background */}
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
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Sign In Form */}
      <motion.div
        initial={{ x: -1000, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="relative z-10 w-full max-w-md p-8 glass-card rounded-3xl shadow-ios-xl mx-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex justify-center mb-8"
        >
          <div className="w-32 h-32 mx-auto mb-8">
            <img 
            src="/Logo.png" 
            alt="Arcyn Link Logo"
            className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-display font-bold text-center bg-gradient-to-r from-ios-blue to-ios-blue-light bg-clip-text text-transparent mb-2"
        >
          Welcome Back
        </motion.h1>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-ios-gray-600 mb-8"
        >
          Sign in to continue to Arcyn Link
        </motion.p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
            />
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <input
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ios-blue text-white font-semibold rounded-xl hover:bg-ios-blue/90 shadow-ios-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>

        {/* Sign Up Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-ios-gray-600 mt-6"
        >
          Don't have an account?{' '}
          <Link href="/signup" className="text-ios-blue hover:text-ios-blue/80 transition-colors font-semibold">
            Sign Up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
