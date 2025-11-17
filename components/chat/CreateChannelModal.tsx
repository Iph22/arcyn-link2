'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Hash, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import toast from 'react-hot-toast'

interface CreateChannelModalProps {
  onClose: () => void
  onSuccess: (channel: any) => void
}

export default function CreateChannelModal({ onClose, onSuccess }: CreateChannelModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [branch, setBranch] = useState<'arcyn_x' | 'modulex' | 'nexalab'>('arcyn_x')
  const [isPrivate, setIsPrivate] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Channel name is required')
      return
    }

    setCreating(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        toast.error('You must be logged in to create a channel')
        return
      }

      // Create the channel
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          branch,
          is_private: isPrivate,
          created_by: user.id,
        })
        .select()
        .single()

      if (channelError) throw channelError

      // Add creator as a member
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          role: 'admin',
        })

      if (memberError) throw memberError

      onSuccess(channel)
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating channel:', error)
      }
      toast.error(error.message || 'Failed to create channel')
    } finally {
      setCreating(false)
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
        className="bg-arcyn-surface border border-gold-500/20 rounded-3xl p-6 max-w-md w-full shadow-gold-glow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Channel</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-arcyn-bg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Channel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Channel Name *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="general-chat"
                className="w-full pl-10 pr-4 py-2 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 transition-all"
                maxLength={50}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="w-full px-4 py-2 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 resize-none transition-all"
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Branch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Branch
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBranch('arcyn_x')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  branch === 'arcyn_x'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-gold-500/20 bg-arcyn-bg text-gray-400 hover:border-blue-500/50'
                }`}
              >
                <div className="text-xs font-semibold">Arcyn.X</div>
              </button>
              <button
                onClick={() => setBranch('modulex')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  branch === 'modulex'
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-gold-500/20 bg-arcyn-bg text-gray-400 hover:border-green-500/50'
                }`}
              >
                <div className="text-xs font-semibold">ModuleX</div>
              </button>
              <button
                onClick={() => setBranch('nexalab')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  branch === 'nexalab'
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                    : 'border-gold-500/20 bg-arcyn-bg text-gray-400 hover:border-orange-500/50'
                }`}
              >
                <div className="text-xs font-semibold">NexaLab</div>
              </button>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div>
            <label className="flex items-center justify-between p-3 bg-arcyn-bg rounded-xl cursor-pointer hover:bg-arcyn-bg/80 transition-colors">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-white">Private Channel</div>
                  <div className="text-xs text-gray-400">Only invited members can join</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-5 h-5 rounded border-gold-500/20 bg-arcyn-surface text-gold-500 focus:ring-2 focus:ring-gold-500/20"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={creating}
            className="flex-1 px-4 py-2 bg-arcyn-bg border border-gold-500/20 rounded-xl text-white hover:bg-arcyn-bg/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl text-black font-semibold hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Channel'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}