'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Award, Flame, Star, Crown, Medal } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all-time'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe])

  async function fetchLeaderboard() {
    setLoading(true)
    try {
      // Calculate date range based on timeframe
      let dateFilter: Date | null = null
      const now = new Date()
      
      switch (timeframe) {
        case 'daily':
          dateFilter = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'weekly':
          dateFilter = new Date(now.setDate(now.getDate() - 7))
          break
        case 'monthly':
          dateFilter = new Date(now.setMonth(now.getMonth() - 1))
          break
        case 'all-time':
        default:
          dateFilter = null
      }

      // Fetch profiles with activity filtering
      if (dateFilter && timeframe !== 'all-time') {
        // Get users with activity in the timeframe
        const { data: activityData, error: activityError } = await supabase
          .from('activity_log')
          .select('user_id, points_earned')
          .gte('created_at', dateFilter.toISOString())

        if (activityError) throw activityError

        // Aggregate points by user
        const userPoints = activityData?.reduce((acc: any, activity: any) => {
          if (!acc[activity.user_id]) {
            acc[activity.user_id] = 0
          }
          acc[activity.user_id] += activity.points_earned || 0
          return acc
        }, {})

        // Fetch user profiles
        const userIds = Object.keys(userPoints || {})
        if (userIds.length === 0) {
          setLeaderboard([])
          setLoading(false)
          return
        }

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)

        if (profilesError) throw profilesError

        // Combine profiles with timeframe points
        const rankedProfiles = profilesData?.map((profile: any) => ({
          ...profile,
          timeframe_score: userPoints[profile.id] || 0,
        })).sort((a: any, b: any) => b.timeframe_score - a.timeframe_score) || []

        setLeaderboard(rankedProfiles)
      } else {
        // All-time: use rank_score
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('rank_score', { ascending: false })
          .limit(50)

        if (error) throw error
        setLeaderboard(data || [])
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankBadge = (score: number) => {
    if (score >= 1000) return { name: 'Diamond', color: 'from-cyan-400 to-blue-600', icon: '💎', textColor: 'text-cyan-400' }
    if (score >= 500) return { name: 'Platinum', color: 'from-gray-300 to-gray-500', icon: '🏆', textColor: 'text-gray-300' }
    if (score >= 250) return { name: 'Gold', color: 'from-gold-400 to-gold-600', icon: '🥇', textColor: 'text-gold-400' }
    if (score >= 100) return { name: 'Silver', color: 'from-gray-400 to-gray-600', icon: '🥈', textColor: 'text-gray-400' }
    return { name: 'Bronze', color: 'from-orange-400 to-orange-600', icon: '🥉', textColor: 'text-orange-400' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-ios-blue rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-arcyn-bg p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-ios-blue to-ios-blue-light bg-clip-text text-transparent mb-2">
              Leaderboard
            </h1>
            <p className="text-ios-gray-600">Top contributors across Arcyn</p>
          </motion.div>

          {/* Timeframe Selector */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 glass-card p-1 rounded-xl"
          >
            {(['daily', 'weekly', 'monthly', 'all-time'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-ios-blue text-white'
                    : 'text-ios-gray-600 hover:text-ios-gray-900'
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1).replace('-', ' ')}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-3 gap-4 items-end">
          {/* 2nd Place */}
          {leaderboard[1] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-6 border-2 border-ios-gray-300 shadow-ios-lg"
            >
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-ios-gray-400 to-ios-gray-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-ios-lg">
                    {leaderboard[1].full_name[0]}
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-ios-gray-500 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-arcyn-bg shadow-ios">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold text-ios-gray-900 mb-1">{leaderboard[1].full_name}</h3>
                <p className="text-sm text-ios-gray-600 mb-3">@{leaderboard[1].username}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  leaderboard[1].branch === 'arcyn_x'
                    ? 'bg-blue-500/20 text-blue-400'
                    : leaderboard[1].branch === 'modulex'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {leaderboard[1].branch.replace('_', '.')}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Medal className="w-5 h-5 text-ios-gray-500" />
                  <span className="text-2xl font-bold text-ios-gray-900">
                    {timeframe === 'all-time' ? leaderboard[1].rank_score : leaderboard[1].timeframe_score}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {leaderboard[0] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-3xl p-8 border-2 border-ios-yellow shadow-ios-xl relative overflow-hidden bg-gradient-to-br from-ios-yellow/10 to-ios-orange/10"
            >
              {/* Crown */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <Crown className="w-16 h-16 text-ios-yellow animate-float" />
              </div>

              <div className="text-center pt-4">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-ios-yellow to-ios-orange rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-ios-xl">
                    {leaderboard[0].full_name[0]}
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-ios-yellow rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-arcyn-bg shadow-ios">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-ios-gray-900 mb-1">{leaderboard[0].full_name}</h3>
                <p className="text-sm text-ios-orange mb-3">@{leaderboard[0].username}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                  leaderboard[0].branch === 'arcyn_x'
                    ? 'bg-blue-500/30 text-blue-300'
                    : leaderboard[0].branch === 'modulex'
                    ? 'bg-green-500/30 text-green-300'
                    : 'bg-orange-500/30 text-orange-300'
                }`}>
                  {leaderboard[0].branch.replace('_', '.')}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-ios-yellow" />
                  <span className="text-3xl font-bold text-ios-gray-900">
                    {timeframe === 'all-time' ? leaderboard[0].rank_score : leaderboard[0].timeframe_score}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {leaderboard[2] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-3xl p-6 border-2 border-ios-orange/40 shadow-ios-lg"
            >
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                    {leaderboard[2].full_name[0]}
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-arcyn-bg">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold text-ios-gray-900 mb-1">{leaderboard[2].full_name}</h3>
                <p className="text-sm text-ios-orange mb-3">@{leaderboard[2].username}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  leaderboard[2].branch === 'arcyn_x'
                    ? 'bg-blue-500/20 text-blue-400'
                    : leaderboard[2].branch === 'modulex'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {leaderboard[2].branch.replace('_', '.')}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Medal className="w-5 h-5 text-orange-400" />
                  <span className="text-2xl font-bold text-white">
                    {timeframe === 'all-time' ? leaderboard[2].rank_score : leaderboard[2].timeframe_score}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Rest of Leaderboard */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl overflow-hidden shadow-ios-lg"
        >
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-arcyn-border text-sm font-semibold text-ios-gray-600">
            <div>Rank</div>
            <div className="col-span-2">User</div>
            <div>Branch</div>
            <div className="text-right">Score</div>
          </div>

          <div className="divide-y divide-arcyn-border">
            {leaderboard.slice(3).map((user, index) => {
              const score = timeframe === 'all-time' ? user.rank_score : user.timeframe_score
              const rank = getRankBadge(score)
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="grid grid-cols-5 gap-4 p-4 hover:bg-ios-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-ios-gray-500">{index + 4}</span>
                  </div>

                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${rank.color} rounded-full flex items-center justify-center text-sm font-bold text-white`}>
                      {user.full_name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-ios-gray-900">{user.full_name}</p>
                      <p className="text-sm text-ios-gray-600">@{user.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.branch === 'arcyn_x'
                        ? 'bg-blue-500/20 text-blue-400'
                        : user.branch === 'modulex'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {user.branch.replace('_', '.')}
                    </span>
                  </div>

                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{rank.icon}</span>
                      <span className={`text-xl font-bold ${rank.textColor}`}>{score}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Achievements Showcase */}
      <div className="max-w-6xl mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-display font-bold text-ios-gray-900 mb-4">Featured Achievements</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Flame, name: 'Week Warrior', color: 'from-red-500 to-orange-500' },
              { icon: Award, name: 'AI Pioneer', color: 'from-blue-500 to-purple-500' },
              { icon: Trophy, name: 'Code Master', color: 'from-green-500 to-teal-500' },
              { icon: Star, name: 'Team Player', color: 'from-pink-500 to-rose-500' },
            ].map((achievement, index) => (
              <motion.div
                key={achievement.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`bg-gradient-to-br ${achievement.color} rounded-2xl p-6 text-center cursor-pointer transition-transform`}
              >
                <achievement.icon className="w-12 h-12 text-white mx-auto mb-3" />
                <p className="font-bold text-white">{achievement.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
