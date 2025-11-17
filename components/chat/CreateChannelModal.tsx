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
        className="bg-white border border-arcyn-border rounded-3xl p-6 max-w-md w-full shadow-ios-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ios-gray-900">Create Channel</h2>
          <button
            onClick={onClose}
            className="p-2 text-ios-gray-500 hover:text-ios-gray-900 transition-colors rounded-lg hover:bg-ios-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Channel Name */}
          <div>
            <label className="block text-sm font-medium text-ios-gray-700 mb-2">
              Channel Name *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ios-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="general-chat"
                className="w-full pl-10 pr-4 py-2 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
                maxLength={50}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-ios-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="w-full px-4 py-2 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 resize-none transition-all shadow-ios-inner"
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Branch Selection */}
          <div>
            <label className="block text-sm font-medium text-ios-gray-700 mb-2">
              Branch
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBranch('arcyn_x')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  branch === 'arcyn_x'
                    ? 'border-ios-blue bg-ios-blue/10 text-ios-blue'
                    : 'border-arcyn-border bg-ios-gray-50 text-ios-gray-600 hover:border-ios-blue/50'
                }`}
              >
                <div className="text-xs font-semibold">Arcyn.X</div>
              </button>
              <button
                onClick={() => setBranch('modulex')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  branch === 'modulex'
                    ? 'border-ios-green bg-ios-green/10 text-ios-green'
                    : 'border-arcyn-border bg-ios-gray-50 text-ios-gray-600 hover:border-ios-green/50'
                }`}
              >
                <div className="text-xs font-semibold">ModuleX</div>
              </button>
              <button
                onClick={() => setBranch('nexalab')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  branch === 'nexalab'
                    ? 'border-ios-orange bg-ios-orange/10 text-ios-orange'
                    : 'border-arcyn-border bg-ios-gray-50 text-ios-gray-600 hover:border-ios-orange/50'
                }`}
              >
                <div className="text-xs font-semibold">NexaLab</div>
              </button>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div>
            <label className="flex items-center justify-between p-3 bg-ios-gray-50 rounded-xl cursor-pointer hover:bg-ios-gray-100 transition-colors border border-arcyn-border">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-ios-gray-500" />
                <div>
                  <div className="text-sm font-medium text-ios-gray-900">Private Channel</div>
                  <div className="text-xs text-ios-gray-600">Only invited members can join</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-5 h-5 rounded border-arcyn-border bg-white text-ios-blue focus:ring-2 focus:ring-ios-blue/20"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={creating}
            className="flex-1 px-4 py-2 bg-white border border-arcyn-border rounded-xl text-ios-gray-700 hover:bg-ios-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-ios-inner"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="flex-1 px-4 py-2 bg-ios-blue text-white font-semibold rounded-xl hover:bg-ios-blue/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-ios-md"
          >
            {creating ? 'Creating...' : 'Create Channel'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}