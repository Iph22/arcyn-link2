'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Star, Calendar, MessageSquare, Phone, Code, Edit2, Award } from 'lucide-react'
import { getCurrentUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [stats, setStats] = useState({
    messagesCount: 0,
    callsCount: 0,
    codeShares: 0,
    aiQueries: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
    loadAchievements()
    loadStats()
  }, [])

  async function loadProfile() {
    try {
      const user = await getCurrentUser()
      setProfile(user)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadAchievements() {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', user.id)

      setAchievements(data || [])
    } catch (error) {
      console.error('Error loading achievements:', error)
    }
  }

  async function loadStats() {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const [messages, calls, aiConversations] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact' }).eq('sender_id', user.id),
        supabase.from('call_participants').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('ai_conversations').select('id', { count: 'exact' }).eq('user_id', user.id),
      ])

      setStats({
        messagesCount: messages.count || 0,
        callsCount: calls.count || 0,
        codeShares: 0,
        aiQueries: aiConversations.count || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const getRankBadge = (score: number) => {
    if (score >= 1000) return { name: 'Diamond', color: 'from-cyan-400 to-blue-600', icon: '💎' }
    if (score >= 500) return { name: 'Platinum', color: 'from-gray-300 to-gray-500', icon: '🏆' }
    if (score >= 250) return { name: 'Gold', color: 'from-gold-400 to-gold-600', icon: '🥇' }
    if (score >= 100) return { name: 'Silver', color: 'from-gray-400 to-gray-600', icon: '🥈' }
    return { name: 'Bronze', color: 'from-orange-400 to-orange-600', icon: '🥉' }
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gold-500 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    )
  }

  const rank = getRankBadge(profile.rank_score)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-arcyn-surface rounded-3xl border border-gold-500/20 p-8 mb-6"
      >
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-32 h-32 bg-gradient-to-br ${rank.color} rounded-3xl flex items-center justify-center text-5xl font-bold text-white shadow-gold-glow`}>
              {profile.full_name[0]}
            </div>
            {/* Rank Badge */}
            <div className={`absolute -bottom-2 -right-2 px-3 py-1 bg-gradient-to-r ${rank.color} rounded-full text-xs font-bold text-white shadow-lg`}>
              {rank.icon} {rank.name}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-white mb-1">{profile.full_name}</h1>
                <p className="text-gray-400 mb-2">@{profile.username}</p>
                <p className="text-gray-300 mb-4">{profile.bio || 'No bio yet'}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gold-500/20 rounded-lg hover:bg-gold-500/30 transition-colors"
              >
                <Edit2 className="w-5 h-5 text-gold-500" />
              </motion.button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className={`px-3 py-1 rounded-full ${
                profile.branch === 'arcyn_x'
                  ? 'bg-blue-500/20 text-blue-400'
                  : profile.branch === 'modulex'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {profile.branch.replace('_', '.')}
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Rank Score */}
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex flex-col items-center justify-center shadow-gold-glow">
              <Trophy className="w-8 h-8 text-black mb-1" />
              <span className="text-2xl font-bold text-black">{profile.rank_score}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Rank Score</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={MessageSquare} label="Messages" value={stats.messagesCount} color="from-blue-500 to-purple-500" />
        <StatCard icon={Phone} label="Calls" value={stats.callsCount} color="from-green-500 to-teal-500" />
        <StatCard icon={Code} label="Code Shares" value={stats.codeShares} color="from-orange-500 to-red-500" />
        <StatCard icon={Star} label="AI Queries" value={stats.aiQueries} color="from-pink-500 to-rose-500" />
      </div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-arcyn-surface rounded-3xl border border-gold-500/20 p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{profile.login_streak} Days</h3>
              <p className="text-gray-400">Login Streak 🔥</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gold-500">{profile.total_logins}</p>
            <p className="text-sm text-gray-400">Total Logins</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-arcyn-surface rounded-3xl border border-gold-500/20 p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-gold-500" />
          Achievements
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {achievements.length > 0 ? (
            achievements.map((userAchievement) => (
              <motion.div
                key={userAchievement.id}
                whileHover={{ scale: 1.05 }}
                className="bg-arcyn-bg rounded-2xl p-4 border border-gold-500/20 text-center hover:border-gold-500/40 transition-all cursor-pointer"
              >
                <div className="text-4xl mb-2">{userAchievement.achievement.icon}</div>
                <p className="font-bold text-white text-sm">{userAchievement.achievement.name}</p>
                <p className="text-xs text-gray-400 mt-1">{userAchievement.achievement.description}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-gold-500" />
                  <span className="text-xs text-gold-500">+{userAchievement.achievement.points}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No achievements yet. Keep contributing!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="bg-arcyn-surface rounded-2xl border border-gold-500/20 p-4 hover:border-gold-500/40 transition-all"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  )
}
