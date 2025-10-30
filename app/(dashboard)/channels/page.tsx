'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Hash, Users, Plus, Search, Lock, Globe, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import toast from 'react-hot-toast'

export default function ChannelsPage() {
  const [channels, setChannels] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
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
      console.error('Error loading channels:', error)
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
            <h1 className="text-4xl font-display font-bold text-white mb-2">Channels</h1>
            <p className="text-gray-400">Manage your communication channels</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold rounded-xl hover:shadow-gold-glow transition-all flex items-center gap-2"
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-arcyn-surface border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 transition-all"
          />
        </motion.div>
      </div>

      {/* Channels Grid */}
      <div className="max-w-6xl mx-auto">
        {filteredChannels.length === 0 ? (
          <div className="text-center py-16">
            <Hash className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No channels found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first channel to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gold-500/20 text-gold-500 font-semibold rounded-xl hover:bg-gold-500/30 transition-all"
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
                className="bg-arcyn-surface rounded-2xl border border-gold-500/20 p-6 hover:border-gold-500/40 transition-all cursor-pointer"
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
                    <h3 className="text-lg font-bold text-white">{channel.name}</h3>
                    {channel.is_private && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  {channel.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{channel.description}</p>
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
                  <button className="p-2 hover:bg-gold-500/20 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
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
    </div>
  )
}

function CreateChannelModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    branch: '',
    isPrivate: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await getCurrentUser()
      if (!user) return

      // Create channel
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .insert({
          name: formData.name,
          description: formData.description,
          branch: formData.branch || null,
          is_private: formData.isPrivate,
          created_by: user.id,
        })
        .select()
        .single()

      if (channelError) throw channelError

      // Add creator as member
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          role: 'admin',
        })

      if (memberError) throw memberError

      toast.success('Channel created successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create channel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-arcyn-surface border border-gold-500/20 rounded-3xl p-8 max-w-md w-full shadow-gold-glow-lg"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Create Channel</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Channel Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="general"
              className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this channel about?"
              rows={3}
              className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 resize-none transition-all"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Branch (Optional)</label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white transition-all"
            >
              <option value="">All Branches</option>
              <option value="arcyn_x">Arcyn.x</option>
              <option value="modulex">Modulex</option>
              <option value="nexalab">Nexalab</option>
            </select>
          </div>

          {/* Privacy */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="private"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="w-5 h-5 rounded border-gold-500/20 bg-arcyn-bg text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <label htmlFor="private" className="text-sm text-gray-300 cursor-pointer">
              Make this channel private
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl text-gray-400 hover:text-white hover:border-gold-500/40 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold rounded-xl hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
