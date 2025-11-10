'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signUp } from '@/lib/supabase/auth'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    branch: '' as 'arcyn_x' | 'modulex' | 'nexalab' | '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.branch) {
      toast.error('Please select a branch')
      return
    }

    setLoading(true)

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        username: formData.username,
        branch: formData.branch as 'arcyn_x' | 'modulex' | 'nexalab',
      })
      
      // Redirect to email confirmation page instead of dashboard
      router.push(`/confirm-email?email=${encodeURIComponent(formData.email)}`)
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-arcyn-bg relative overflow-hidden flex items-center justify-center py-12">
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
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

      {/* Sign Up Form */}
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
              src="./Logo.png" 
              alt="Logo"
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
          Join Arcyn Link
        </motion.h1>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-ios-gray-600 mb-8"
        >
          Accelerating AI Evolution in Africa
        </motion.p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <input
              type="text"
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
            />
          </motion.div>

          {/* Username */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <input
              type="text"
              placeholder="Username"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
            />
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
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
            transition={{ delay: 0.8 }}
          >
            <input
              type="password"
              placeholder="Password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
            />
            <p className="text-xs text-ios-gray-500 mt-1 ml-1">Minimum 6 characters</p>
          </motion.div>

          {/* Branch Selection */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <select
              required
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value as any })}
              className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 transition-all shadow-ios-inner"
            >
              <option value="">Select Branch</option>
              <option value="arcyn_x">Arcyn.x</option>
              <option value="modulex">Modulex</option>
              <option value="nexalab">Nexalab</option>
            </select>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ios-blue text-white font-semibold rounded-xl hover:bg-ios-blue/90 shadow-ios-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>

        {/* Sign In Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center text-ios-gray-600 mt-6"
        >
          Already have an account?{' '}
          <Link href="/signin" className="text-ios-blue hover:text-ios-blue/80 transition-colors font-semibold">
            Sign In
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}