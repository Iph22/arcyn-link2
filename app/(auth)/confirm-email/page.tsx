'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [resending, setResending] = useState(false)

  const handleResendEmail = async () => {
    if (!email) return

    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error
      toast.success('Confirmation email sent!')
    } catch (error: any) {
      toast.error('Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-arcyn-bg relative overflow-hidden flex items-center justify-center py-12">
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold-500/30 rounded-full"
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

      {/* Confirmation Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="relative z-10 w-full max-w-md p-8 bg-arcyn-surface/80 backdrop-blur-xl rounded-3xl border border-gold-500/20 shadow-gold-glow-lg mx-4"
      >
        {/* Email Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-3xl flex items-center justify-center shadow-gold-glow animate-pulse">
            <Mail className="w-12 h-12 text-black" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-display font-bold text-center bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-2"
        >
          Check Your Email
        </motion.h1>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-400 mb-2"
        >
          We've sent a confirmation link to
        </motion.p>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gold-500 font-semibold mb-6"
        >
          {email}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-arcyn-bg rounded-xl p-4 mb-6 border border-gold-500/20"
        >
          <p className="text-sm text-gray-300 mb-2">📧 Check your inbox and spam folder</p>
          <p className="text-sm text-gray-300 mb-2">🔗 Click the confirmation link</p>
          <p className="text-sm text-gray-300">✨ You'll be redirected to your dashboard</p>
        </motion.div>

        {/* Resend Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResendEmail}
          disabled={resending}
          className="w-full py-3 bg-arcyn-bg border border-gold-500/20 text-gold-500 font-semibold rounded-xl hover:border-gold-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Sending...' : 'Resend Email'}
        </motion.button>

        {/* Back to Sign In */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-400 mt-6"
        >
          <Link href="/signin" className="text-gold-500 hover:text-gold-400 transition-colors font-semibold">
            ← Back to Sign In
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}