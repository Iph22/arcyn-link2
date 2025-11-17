'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Hash, Lock, Globe } from 'lucide-react'
import { createChannel } from '@/lib/hooks/useChannels'
import toast from 'react-hot-toast'

interface CreateChannelModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateChannelModal({ onClose, onSuccess }: CreateChannelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    branch: '' as 'arcyn_x' | 'modulex' | 'nexalab' | '',
    isPrivate: false,
  })
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Channel name is required')
      return
    }

    setCreating(true)
    try {
      await createChannel({
        name: formData.name,
        description: formData.description,
        branch: formData.branch || undefined,
        isPrivate: formData.isPrivate,
      })

      toast.success(`Channel "${formData.name}" created!`)
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create channel')
    } finally {
      setCreating(false)
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
            <h2 className="text-2xl font-display font-bold text-ios-gray-900">Create Channel</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ios-gray-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-ios-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Branch Selection */}
            <div>
              <label className="block text-sm font-semibold text-ios-gray-700 mb-2">
                Branch (Optional)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, branch: formData.branch === 'arcyn_x' ? '' : 'arcyn_x' })}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    formData.branch === 'arcyn_x'
                      ? 'bg-ios-blue/10 text-ios-blue border-2 border-ios-blue'
                      : 'bg-ios-gray-50 text-ios-gray-600 border border-arcyn-border hover:border-ios-blue/40'
                  }`}
                >
                  Arcyn.x
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, branch: formData.branch === 'modulex' ? '' : 'modulex' })}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    formData.branch === 'modulex'
                      ? 'bg-ios-green/10 text-ios-green border-2 border-ios-green'
                      : 'bg-ios-gray-50 text-ios-gray-600 border border-arcyn-border hover:border-ios-green/40'
                  }`}
                >
                  Modulex
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, branch: formData.branch === 'nexalab' ? '' : 'nexalab' })}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    formData.branch === 'nexalab'
                      ? 'bg-ios-orange/10 text-ios-orange border-2 border-ios-orange'
                      : 'bg-ios-gray-50 text-ios-gray-600 border border-arcyn-border hover:border-ios-orange/40'
                  }`}
                >
                  Nexalab
                </button>
              </div>
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

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white border border-arcyn-border rounded-xl text-ios-gray-700 font-semibold hover:bg-ios-gray-50 transition-all shadow-ios-inner"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 px-4 py-3 bg-ios-blue text-white font-bold rounded-xl hover:bg-ios-blue/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-ios-md"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Hash className="w-5 h-5" />
                    Create Channel
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
