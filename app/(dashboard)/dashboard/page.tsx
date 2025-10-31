'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getCurrentUser } from '@/lib/supabase/auth'
import type { Profile } from '@/lib/supabase/client'
import { 
  Trophy, 
  Users, 
  MessageSquare, 
  Bot, 
  Sparkles,
  TrendingUp,
  Award,
  Flame,
  Star,
  Crown,
  Phone,
  Video,
  FileText,
  Code,
  Calendar,
  Bell,
  Settings,
  LogOut
} from 'lucide-react'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const user = await getCurrentUser()
    setProfile(user)
  }

  const stats = [
    { icon: MessageSquare, label: 'Messages', value: '1,234', color: 'from-blue-500 to-purple-500' },
    { icon: Phone, label: 'Calls', value: '47', color: 'from-green-500 to-teal-500' },
    { icon: Bot, label: 'AI Queries', value: '89', color: 'from-orange-500 to-red-500' },
    { icon: TrendingUp, label: 'Rank Score', value: profile?.rank_score || 0, color: 'from-gold-500 to-gold-600' },
  ]

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-400">Here's what's happening with your Arcyn Link today</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-arcyn-surface rounded-2xl border border-gold-500/20 p-6 hover:border-gold-500/40 transition-all"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl border border-orange-500/30 p-8 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Flame className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-1">{profile?.login_streak || 0} Days</h2>
              <p className="text-orange-200">Current Login Streak 🔥</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-gold-500">{profile?.total_logins || 0}</p>
            <p className="text-sm text-gray-400">Total Logins</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.a
            href="/dashboard/chat"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-arcyn-surface rounded-2xl border border-gold-500/20 p-6 hover:border-gold-500/40 transition-all cursor-pointer"
          >
            <MessageSquare className="w-8 h-8 text-gold-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Start Chatting</h3>
            <p className="text-sm text-gray-400">Connect with your team</p>
          </motion.a>

          <motion.a
            href="/dashboard/ai-playground"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-arcyn-surface rounded-2xl border border-gold-500/20 p-6 hover:border-gold-500/40 transition-all cursor-pointer"
          >
            <Bot className="w-8 h-8 text-gold-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">AI Playground</h3>
            <p className="text-sm text-gray-400">Get AI assistance</p>
          </motion.a>

          <motion.a
            href="/dashboard/leaderboard"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-arcyn-surface rounded-2xl border border-gold-500/20 p-6 hover:border-gold-500/40 transition-all cursor-pointer"
          >
            <Trophy className="w-8 h-8 text-gold-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">View Leaderboard</h3>
            <p className="text-sm text-gray-400">See top contributors</p>
          </motion.a>
        </div>
      </motion.div>
    </div>
  )
}
