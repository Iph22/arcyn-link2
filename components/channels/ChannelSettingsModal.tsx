'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2, Users, Lock, Globe } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import toast from 'react-hot-toast'

interface ChannelSettingsModalProps {
  channel: any
  onClose: () => void
  onSuccess: () => void
}

export default function ChannelSettingsModal({ channel, onClose, onSuccess }: ChannelSettingsModalProps) {
  const [formData, setFormData] = useState({
    name: channel.name || '',
    description: channel.description || '',
    isPrivate: channel.is_private || false,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Channel name is required')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('channels')
        .update({
          name: formData.name,
          description: formData.description,
          is_private: formData.isPrivate,
        })
        .eq('id', channel.id)

      if (error) throw error

      toast.success('Channel updated!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update channel')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this channel? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      // Check if user is admin
      const { data: membership } = await supabase
        .from('channel_members')
        .select('role')
        .eq('channel_id', channel.id)
        .eq('user_id', user.id)
        .single()

      if (membership?.role !== 'admin') {
        toast.error('Only admins can delete channels')
        return
      }

      // Delete channel (cascade will handle members and messages)
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channel.id)

      if (error) throw error

      toast.success('Channel deleted')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete channel')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-arcyn-surface rounded-3xl border border-gold-500/20 p-8 max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-white">Channel Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-arcyn-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-4 mb-6">
            {/* Channel Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Channel Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., general, announcements"
                className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's this channel about?"
                rows={3}
                className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 transition-all resize-none"
              />
            </div>

            {/* Privacy Toggle */}
            <div>
              <label className="flex items-center justify-between p-4 bg-arcyn-bg rounded-xl border border-gold-500/20 cursor-pointer hover:border-gold-500/40 transition-all">
                <div className="flex items-center gap-3">
                  {formData.isPrivate ? (
                    <Lock className="w-5 h-5 text-gold-500" />
                  ) : (
                    <Globe className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {formData.isPrivate ? 'Private Channel' : 'Public Channel'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formData.isPrivate ? 'Only invited members can join' : 'Anyone can join'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="w-5 h-5 rounded bg-arcyn-surface border-gold-500/20 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
                />
              </label>
            </div>

            {/* Update Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold rounded-xl hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </form>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-red-500/20">
            <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full px-4 py-3 bg-red-500/20 border border-red-500/40 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Channel
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
