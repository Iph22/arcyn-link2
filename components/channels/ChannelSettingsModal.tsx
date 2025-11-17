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
          className="bg-white rounded-3xl border border-arcyn-border p-8 max-w-md w-full shadow-ios-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-ios-gray-900">Channel Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ios-gray-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-ios-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-4 mb-6">
            {/* Channel Name */}
            <div>
              <label className="block text-sm font-semibold text-ios-gray-700 mb-2">
                Channel Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., general, announcements"
                className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-ios-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's this channel about?"
                rows={3}
                className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all resize-none shadow-ios-inner"
              />
            </div>

            {/* Privacy Toggle */}
            <div>
              <label className="flex items-center justify-between p-4 bg-ios-gray-50 rounded-xl border border-arcyn-border cursor-pointer hover:bg-ios-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  {formData.isPrivate ? (
                    <Lock className="w-5 h-5 text-ios-blue" />
                  ) : (
                    <Globe className="w-5 h-5 text-ios-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-ios-gray-900">
                      {formData.isPrivate ? 'Private Channel' : 'Public Channel'}
                    </p>
                    <p className="text-xs text-ios-gray-600">
                      {formData.isPrivate ? 'Only invited members can join' : 'Anyone can join'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="w-5 h-5 rounded border-arcyn-border bg-white text-ios-blue focus:ring-2 focus:ring-ios-blue/20"
                />
              </label>
            </div>

            {/* Update Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-3 bg-ios-blue text-white font-bold rounded-xl hover:bg-ios-blue/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-ios-md"
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
          <div className="pt-6 border-t border-arcyn-border">
            <h3 className="text-sm font-semibold text-ios-red mb-3">Danger Zone</h3>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full px-4 py-3 bg-ios-red/10 border border-ios-red/40 text-ios-red font-semibold rounded-xl hover:bg-ios-red/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
