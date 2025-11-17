'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Hash, Users, Plus, Search, Lock, Globe, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import CreateChannelModal from '@/components/channels/CreateChannelModal'
import ChannelSettingsModal from '@/components/channels/ChannelSettingsModal'
import toast from 'react-hot-toast'

export default function ChannelsPage() {
  const [channels, setChannels] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChannels()
  }, [])

  async function loadChannels() {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          *,
          channel:channels(*)
        `)
        .eq('user_id', user.id)

      if (!error && data) {
        setChannels(data.map(m => m.channel).filter(Boolean))
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading channels:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'arcyn_x':
        return 'from-blue-500 to-purple-500'
      case 'modulex':
        return 'from-green-500 to-teal-500'
      case 'nexalab':
        return 'from-orange-500 to-red-500'
      default:
        return 'from-gold-500 to-gold-600'
    }
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
    <div className="p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-display font-bold text-ios-gray-900 dark:text-white mb-2">Channels</h1>
            <p className="text-ios-gray-600 dark:text-ios-gray-400">Manage your communication channels</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-ios-blue text-white font-bold rounded-xl hover:bg-ios-blue/90 shadow-ios-md transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Channel
          </motion.button>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ios-gray-500" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-ios-gray-800 border border-arcyn-border dark:border-ios-gray-700 rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 dark:text-white placeholder-ios-gray-400 transition-all shadow-ios-inner"
          />
        </motion.div>
      </div>

      {/* Channels Grid */}
      <div className="max-w-6xl mx-auto">
        {filteredChannels.length === 0 ? (
          <div className="text-center py-16">
            <Hash className="w-16 h-16 text-ios-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-ios-gray-900 dark:text-white mb-2">No channels found</h3>
            <p className="text-ios-gray-600 dark:text-ios-gray-400 mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first channel to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-ios-blue/10 dark:bg-ios-blue/20 text-ios-blue font-semibold rounded-xl hover:bg-ios-blue/20 dark:hover:bg-ios-blue/30 transition-all border border-ios-blue/20"
              >
                Create Channel
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel, index) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white dark:bg-ios-gray-800 rounded-2xl border border-arcyn-border dark:border-ios-gray-700 p-6 hover:border-ios-blue/40 transition-all cursor-pointer shadow-ios"
              >
                {/* Channel Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${getBranchColor(channel.branch)} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  {channel.is_private ? (
                    <Lock className="w-8 h-8 text-white" />
                  ) : (
                    <Hash className="w-8 h-8 text-white" />
                  )}
                </div>

                {/* Channel Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-ios-gray-900 dark:text-white">{channel.name}</h3>
                    {channel.is_private && (
                      <Lock className="w-4 h-4 text-ios-gray-500" />
                    )}
                  </div>
                  {channel.description && (
                    <p className="text-sm text-ios-gray-600 dark:text-ios-gray-400 line-clamp-2">{channel.description}</p>
                  )}
                </div>

                {/* Channel Meta */}
                <div className="flex items-center justify-between">
                  {channel.branch && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      channel.branch === 'arcyn_x'
                        ? 'bg-blue-500/20 text-blue-400'
                        : channel.branch === 'modulex'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {channel.branch.replace('_', '.')}
                    </span>
                  )}
                  <button 
                    onClick={() => setSelectedChannel(channel)}
                    className="p-2 hover:bg-ios-gray-50 dark:hover:bg-ios-gray-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-ios-gray-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <CreateChannelModal onClose={() => setShowCreateModal(false)} onSuccess={loadChannels} />
      )}

      {/* Channel Settings Modal */}
      {selectedChannel && (
        <ChannelSettingsModal
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
          onSuccess={loadChannels}
        />
      )}
    </div>
  )
}
