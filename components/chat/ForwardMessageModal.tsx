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
          className="bg-white rounded-3xl border border-arcyn-border p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-ios-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-ios-gray-900">Forward Message</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ios-gray-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-ios-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ios-gray-500" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-arcyn-border rounded-lg focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 text-sm transition-all shadow-ios-inner"
            />
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {loading ? (
              <div className="text-center text-ios-gray-600 py-8">Loading channels...</div>
            ) : filteredChannels.length === 0 ? (
              <div className="text-center text-ios-gray-600 py-8">
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
                      ? 'bg-ios-blue/10 border-ios-blue text-ios-gray-900'
                      : 'bg-ios-gray-50 border-arcyn-border text-ios-gray-700 hover:border-ios-blue/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedChannelId === channel.id
                        ? 'bg-ios-blue/20'
                        : 'bg-white'
                    }`}>
                      <Hash className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{channel.name}</p>
                      {channel.description && (
                        <p className="text-xs text-ios-gray-600 truncate">{channel.description}</p>
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
              className="flex-1 px-4 py-3 bg-white border border-arcyn-border rounded-xl text-ios-gray-700 font-semibold hover:bg-ios-gray-50 transition-all shadow-ios-inner"
            >
              Cancel
            </button>
            <button
              onClick={handleForward}
              disabled={!selectedChannelId || forwarding}
              className="flex-1 px-4 py-3 bg-ios-blue text-white font-bold rounded-xl hover:bg-ios-blue/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-ios-md"
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
