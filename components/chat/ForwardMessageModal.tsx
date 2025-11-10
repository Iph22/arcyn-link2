'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Hash, Send, Search } from 'lucide-react'
import { useChannels } from '@/lib/hooks/useChannels'
import { forwardMessage } from '@/lib/chat/useChatMessages'
import toast from 'react-hot-toast'

interface ForwardMessageModalProps {
  messageId: string
  onClose: () => void
}

export default function ForwardMessageModal({ messageId, onClose }: ForwardMessageModalProps) {
  const { channels, loading } = useChannels()
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [forwarding, setForwarding] = useState(false)

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleForward = async () => {
    if (!selectedChannelId) {
      toast.error('Please select a channel')
      return
    }

    setForwarding(true)
    try {
      await forwardMessage(messageId, selectedChannelId)
      toast.success('Message forwarded!')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to forward message')
    } finally {
      setForwarding(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-arcyn-surface rounded-3xl border border-gold-500/20 p-6 max-w-md w-full max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-white">Forward Message</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-arcyn-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-arcyn-bg border border-gold-500/20 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 text-sm transition-all"
            />
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading channels...</div>
            ) : filteredChannels.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                {searchQuery ? 'No channels found' : 'No channels available'}
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <motion.button
                  key={channel.id}
                  onClick={() => setSelectedChannelId(channel.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-3 rounded-xl border transition-all text-left ${
                    selectedChannelId === channel.id
                      ? 'bg-gold-500/20 border-gold-500 text-white'
                      : 'bg-arcyn-bg border-gold-500/20 text-gray-300 hover:border-gold-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedChannelId === channel.id
                        ? 'bg-gold-500/30'
                        : 'bg-arcyn-surface'
                    }`}>
                      <Hash className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{channel.name}</p>
                      {channel.description && (
                        <p className="text-xs text-gray-400 truncate">{channel.description}</p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl text-gray-400 font-semibold hover:text-white hover:border-gold-500/40 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleForward}
              disabled={!selectedChannelId || forwarding}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold rounded-xl hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {forwarding ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Forwarding...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Forward
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
