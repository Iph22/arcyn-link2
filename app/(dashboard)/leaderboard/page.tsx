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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('rank_score', { ascending: false })
        .limit(50)

      if (!error && data) {
        setLeaderboard(data)
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
          <div className="w-3 h-3 bg-gold-500 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
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
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
              Leaderboard
            </h1>
            <p className="text-gray-400">Top contributors across Arcyn</p>
          </motion.div>

          {/* Timeframe Selector */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 bg-arcyn-surface p-1 rounded-xl border border-gold-500/20"
          >
            {(['daily', 'weekly', 'monthly', 'all-time'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-black'
                    : 'text-gray-400 hover:text-white'
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
              className="bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-3xl p-6 border-2 border-gray-500/30 backdrop-blur"
            >
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                    {leaderboard[1].full_name[0]}
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-arcyn-bg">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{leaderboard[1].full_name}</h3>
                <p className="text-sm text-gray-300 mb-3">@{leaderboard[1].username}</p>
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
                  <Medal className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl font-bold text-white">{leaderboard[1].rank_score}</span>
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
              className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-3xl p-8 border-2 border-gold-400/50 shadow-gold-glow-lg backdrop-blur relative overflow-hidden"
            >
              {/* Crown */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <Crown className="w-16 h-16 text-gold-400 animate-float" />
              </div>

              <div className="text-center pt-4">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-5xl font-bold text-black shadow-gold-glow-lg">
                    {leaderboard[0].full_name[0]}
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-2xl font-bold text-black border-2 border-arcyn-bg">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{leaderboard[0].full_name}</h3>
                <p className="text-sm text-gold-200 mb-3">@{leaderboard[0].username}</p>
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
                  <Trophy className="w-6 h-6 text-gold-400" />
                  <span className="text-3xl font-bold text-gold-400">{leaderboard[0].rank_score}</span>
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
              className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 rounded-3xl p-6 border-2 border-orange-500/30 backdrop-blur"
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
                <h3 className="text-xl font-bold text-white mb-1">{leaderboard[2].full_name}</h3>
                <p className="text-sm text-orange-200 mb-3">@{leaderboard[2].username}</p>
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
                  <span className="text-2xl font-bold text-white">{leaderboard[2].rank_score}</span>
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
          className="bg-arcyn-surface rounded-3xl border border-gold-500/20 overflow-hidden"
        >
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-gold-500/20 text-sm font-semibold text-gray-400">
            <div>Rank</div>
            <div className="col-span-2">User</div>
            <div>Branch</div>
            <div className="text-right">Score</div>
          </div>

          <div className="divide-y divide-gold-500/10">
            {leaderboard.slice(3).map((user, index) => {
              const rank = getRankBadge(user.rank_score)
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="grid grid-cols-5 gap-4 p-4 hover:bg-arcyn-bg/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-500">{index + 4}</span>
                  </div>

                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${rank.color} rounded-full flex items-center justify-center text-sm font-bold text-white`}>
                      {user.full_name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.full_name}</p>
                      <p className="text-sm text-gray-400">@{user.username}</p>
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
                      <span className={`text-xl font-bold ${rank.textColor}`}>{user.rank_score}</span>
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
          <h2 className="text-2xl font-display font-bold text-white mb-4">Featured Achievements</h2>
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
                whileHover={{ scale: 1.05 }}
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
