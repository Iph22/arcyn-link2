'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Hash, Users, Plus, Search } from 'lucide-react'
import ChatWindow from '@/components/chat/ChatWindow'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'

export default function ChatPage() {
  const [channels, setChannels] = useState<any[]>([])
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChannels()
  }, [])

  async function loadChannels() {
    try {
      const user = await getCurrentUser()
      if (!user) return

      // Get channels user is a member of
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          *,
          channel:channels(*)
        `)
        .eq('user_id', user.id)

      if (!error && data) {
        const userChannels = data.map(m => m.channel).filter(Boolean)
        setChannels(userChannels)
        
        // Select first channel by default
        if (userChannels.length > 0 && !selectedChannel) {
          setSelectedChannel(userChannels[0])
        }
      }
    } catch (error) {
      console.error('Error loading channels:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="flex h-screen">
      {/* Channels Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 bg-arcyn-surface border-r border-gold-500/20 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gold-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Channels</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gold-500/20 rounded-lg hover:bg-gold-500/30 transition-colors"
            >
              <Plus className="w-5 h-5 text-gold-500" />
            </motion.button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 text-sm transition-all"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredChannels.length === 0 ? (
            <div className="text-center py-8">
              <Hash className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No channels found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChannels.map((channel) => (
                <motion.button
                  key={channel.id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedChannel?.id === channel.id
                      ? 'bg-gold-500/20 border border-gold-500/40'
                      : 'hover:bg-arcyn-bg border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Channel Icon */}
                    <div className={`w-10 h-10 bg-gradient-to-br ${getBranchColor(channel.branch)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {channel.is_private ? (
                        <Users className="w-5 h-5 text-white" />
                      ) : (
                        <Hash className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Channel Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {channel.name}
                      </p>
                      {channel.description && (
                        <p className="text-xs text-gray-400 truncate">
                          {channel.description}
                        </p>
                      )}
                    </div>

                    {/* Branch Badge */}
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
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedChannel ? (
          <ChatWindow
            channelId={selectedChannel.id}
            channelName={selectedChannel.name}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-gold-glow-lg">
                <Hash className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Select a Channel</h3>
              <p className="text-gray-400">Choose a channel from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
