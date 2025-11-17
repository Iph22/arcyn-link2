'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Star, Calendar, MessageSquare, Phone, Code, Edit2, Award, Camera } from 'lucide-react'
import { useProfile } from '@/lib/contexts/ProfileContext'
import { supabase } from '@/lib/supabase/client'
import EditProfileModal from '@/components/profile/EditProfileModal'
import Avatar from '@/components/ui/Avatar'
import AvatarUpload from '@/components/settings/AvatarUpload'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, refreshProfile } = useProfile()
  const [achievements, setAchievements] = useState<any[]>([])
  const [stats, setStats] = useState({
    messagesCount: 0,
    callsCount: 0,
    codeShares: 0,
    aiQueries: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)

  useEffect(() => {
    if (profile) {
      loadAchievements()
      loadStats()
      setLoading(false)
    }
  }, [profile])

  async function loadAchievements() {
    try {
      if (!profile) return

      const { data } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', profile.id)

      setAchievements(data || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading achievements:', error)
      }
    }
  }

  async function loadStats() {
    try {
      if (!profile) return

      const [messages, calls, aiConversations] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact' }).eq('sender_id', profile.id),
        supabase.from('call_participants').select('id', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('ai_conversations').select('id', { count: 'exact' }).eq('user_id', profile.id),
      ])

      setStats({
        messagesCount: messages.count || 0,
        callsCount: calls.count || 0,
        codeShares: 0,
        aiQueries: aiConversations.count || 0,
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading stats:', error)
      }
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
        className="bg-white dark:bg-ios-gray-800 rounded-3xl border border-arcyn-border dark:border-ios-gray-700 p-8 mb-6 shadow-ios"
      >
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="relative w-32 h-32">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-gold-glow">
                <Avatar 
                  src={profile.avatar_url} 
                  name={profile.full_name}
                  size="xl"
                  className="w-full h-full rounded-3xl"
                />
              </div>
              {/* Change Avatar Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAvatarUpload(!showAvatarUpload)}
                className="absolute bottom-0 right-0 w-10 h-10 bg-ios-blue rounded-full flex items-center justify-center shadow-lg hover:bg-ios-blue/90 transition-colors border-2 border-white dark:border-ios-gray-800 z-20"
                title="Change profile picture"
              >
                <Camera className="w-5 h-5 text-white" />
              </motion.button>
            </div>
            {/* Rank Badge */}
            <div className={`absolute -bottom-2 -right-2 px-3 py-1 bg-gradient-to-r ${rank.color} rounded-full text-xs font-bold text-white shadow-lg z-10`}>
              {rank.icon} {rank.name}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-ios-gray-900 dark:text-white mb-1">{profile.full_name}</h1>
                <p className="text-ios-gray-600 dark:text-ios-gray-400 mb-2">@{profile.username}</p>
                <p className="text-ios-gray-700 dark:text-ios-gray-300 mb-4">{profile.bio || 'No bio yet'}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEditModal(true)}
                className="p-2 bg-ios-blue/10 dark:bg-ios-blue/20 rounded-lg hover:bg-ios-blue/20 dark:hover:bg-ios-blue/30 transition-colors"
              >
                <Edit2 className="w-5 h-5 text-ios-blue" />
              </motion.button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className={`px-3 py-1 rounded-full ${
                profile.branch === 'arcyn_x'
                  ? 'bg-ios-blue/10 dark:bg-ios-blue/20 text-ios-blue'
                  : profile.branch === 'modulex'
                  ? 'bg-ios-green/10 dark:bg-ios-green/20 text-ios-green'
                  : 'bg-ios-purple/10 dark:bg-ios-purple/20 text-ios-purple'
              }`}>
                {profile.branch.replace('_', '.')}
              </div>
              <div className="flex items-center gap-1 text-ios-gray-600 dark:text-ios-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Rank Score */}
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-ios-blue to-ios-blue-light rounded-2xl flex flex-col items-center justify-center shadow-ios-lg">
              <Trophy className="w-8 h-8 text-white mb-1" />
              <span className="text-2xl font-bold text-white">{profile.rank_score}</span>
            </div>
            <p className="text-xs text-ios-gray-600 dark:text-ios-gray-400 mt-2">Rank Score</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={MessageSquare} label="Messages" value={stats.messagesCount} color="from-ios-blue to-ios-blue-light" />
        <StatCard icon={Phone} label="Calls" value={stats.callsCount} color="from-ios-green to-teal-500" />
        <StatCard icon={Code} label="Code Shares" value={stats.codeShares} color="from-ios-orange to-red-500" />
        <StatCard icon={Star} label="AI Queries" value={stats.aiQueries} color="from-pink-500 to-rose-500" />
      </div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-ios-gray-800 rounded-3xl border border-arcyn-border dark:border-ios-gray-700 p-6 mb-6 shadow-ios"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-ios-orange to-ios-red rounded-2xl flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-ios-gray-900 dark:text-white">{profile.login_streak} Days</h3>
              <p className="text-ios-gray-600 dark:text-ios-gray-400">Login Streak 🔥</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-ios-blue">{profile.total_logins}</p>
            <p className="text-sm text-ios-gray-600 dark:text-ios-gray-400">Total Logins</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-ios-gray-800 rounded-3xl border border-arcyn-border dark:border-ios-gray-700 p-6 shadow-ios"
      >
        <h2 className="text-xl font-bold text-ios-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-ios-blue" />
          Achievements
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {achievements.length > 0 ? (
            achievements.map((userAchievement) => (
              <motion.div
                key={userAchievement.id}
                whileHover={{ scale: 1.05 }}
                className="bg-ios-gray-50 dark:bg-ios-gray-900 rounded-2xl p-4 border border-arcyn-border dark:border-ios-gray-700 text-center hover:border-ios-blue/40 transition-all cursor-pointer"
              >
                <div className="text-4xl mb-2">{userAchievement.achievement.icon}</div>
                <p className="font-bold text-ios-gray-900 dark:text-white text-sm">{userAchievement.achievement.name}</p>
                <p className="text-xs text-ios-gray-600 dark:text-ios-gray-400 mt-1">{userAchievement.achievement.description}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-ios-blue" />
                  <span className="text-xs text-ios-blue">+{userAchievement.achievement.points}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-ios-gray-600 dark:text-ios-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No achievements yet. Keep contributing!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Avatar Upload Section */}
      {showAvatarUpload && profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-ios-gray-800 rounded-3xl border border-arcyn-border dark:border-ios-gray-700 p-6 mb-6 shadow-ios"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ios-gray-900 dark:text-white">Change Profile Picture</h3>
            <button
              onClick={() => setShowAvatarUpload(false)}
              className="text-ios-gray-500 hover:text-ios-gray-900 dark:hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            userId={profile.id}
            onUploadComplete={async (url) => {
              await refreshProfile()
              setShowAvatarUpload(false)
              toast.success('Profile picture updated!')
            }}
          />
        </motion.div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSuccess={async () => {
            await refreshProfile()
            loadAchievements()
            loadStats()
          }}
        />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-ios-gray-800 rounded-2xl border border-arcyn-border dark:border-ios-gray-700 p-4 hover:border-ios-blue/40 transition-all shadow-ios"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-2xl font-bold text-ios-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-ios-gray-600 dark:text-ios-gray-400">{label}</p>
    </motion.div>
  )
}
