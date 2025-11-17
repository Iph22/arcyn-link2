'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, Search, Hash, X } from 'lucide-react'
import { useChannels, createChannel } from '@/lib/hooks/useChannels'
import toast from 'react-hot-toast'
import ChatWindow from '@/components/chat/ChatWindow'
import { isValidChannelName } from '@/lib/utils/validation'
import { sanitizeUserInput } from '@/lib/utils/sanitize'

export default function ChatPage() {
  const { channels, loading: channelsLoading } = useChannels()
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [showCreateChannel, setShowCreateChannel] = useState(false)

  // Create channel form state
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    branch: '' as 'arcyn_x' | 'modulex' | 'nexalab' | '',
    isPrivate: false,
  })

  const selectedChannel = channels.find(ch => ch.id === selectedChannelId)
  
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()

    const nameValidation = isValidChannelName(newChannelData.name.trim())
    if (!nameValidation.valid) {
      toast.error(nameValidation.errors[0])
      return
    }

    try {
      const channel = await createChannel({
        name: sanitizeUserInput(newChannelData.name.trim(), 50),
        description: sanitizeUserInput(newChannelData.description.trim(), 500),
        branch: newChannelData.branch || undefined,
        isPrivate: newChannelData.isPrivate,
      })

      toast.success(`Channel "${channel.name}" created!`)
      setShowCreateChannel(false)
      setNewChannelData({ name: '', description: '', branch: '', isPrivate: false })
      setSelectedChannelId(channel.id)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create channel')
    }
  }


  return (
    <div className="h-screen bg-arcyn-bg flex">
      {/* Sidebar */}
      <div className="w-80 bg-arcyn-surface border-r border-arcyn-border flex flex-col shadow-ios">
        {/* Header */}
        <div className="p-4 border-b border-arcyn-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-display font-bold text-ios-gray-900">Channels</h1>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="p-2 bg-ios-gray-50 rounded-lg hover:bg-ios-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5 text-ios-blue" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ios-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-arcyn-border rounded-lg focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 text-sm transition-all shadow-ios-inner"
              aria-label="Search channels"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-4">
          {channelsLoading ? (
            <div className="text-center text-ios-gray-500 py-8">Loading channels...</div>
          ) : filteredChannels.length === 0 ? (
            <div className="text-center text-ios-gray-500 py-8">
              <p className="mb-2">{searchQuery ? 'No channels found' : 'No channels yet'}</p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="text-ios-blue hover:text-ios-blue/80 text-sm"
                >
                  Create your first channel
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChannels.map((channel) => (
                <motion.button
                  key={channel.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedChannelId(channel.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    selectedChannelId === channel.id
                      ? 'bg-ios-blue/10 border border-ios-blue/30'
                      : 'hover:bg-ios-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-ios-blue" />
                    <span className="text-ios-gray-900 font-medium">{channel.name}</span>
                  </div>
                  {channel.is_private && (
                    <span className="text-xs text-ios-gray-500">🔒</span>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedChannelId ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-ios-blue to-ios-blue-light rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-ios-lg">
                <MessageSquare className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold text-ios-gray-900 mb-2">
                Select a Channel
              </h2>
              <p className="text-ios-gray-600 max-w-md">
                Choose a channel from the sidebar to start chatting
              </p>
            </motion.div>
          </div>
        ) : (
          <ChatWindow 
            channelId={selectedChannelId || undefined}
            channelName={selectedChannel?.name}
          />
        )}
      </div>

      {/* Create Channel Modal */}
      <AnimatePresence>
        {showCreateChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateChannel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-card rounded-3xl p-6 shadow-ios-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-ios-gray-900">Create Channel</h2>
                <button
                  onClick={() => setShowCreateChannel(false)}
                  className="p-2 hover:bg-ios-gray-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-ios-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ios-gray-600 mb-2">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={newChannelData.name}
                    onChange={(e) => setNewChannelData({ ...newChannelData, name: e.target.value })}
                    placeholder="e.g., general-chat"
                    required
                    className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ios-gray-600 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newChannelData.description}
                    onChange={(e) => setNewChannelData({ ...newChannelData, description: e.target.value })}
                    placeholder="What's this channel about?"
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all resize-none shadow-ios-inner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ios-gray-600 mb-2">
                    Branch (Optional)
                  </label>
                  <select
                    value={newChannelData.branch}
                    onChange={(e) => setNewChannelData({ ...newChannelData, branch: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 transition-all shadow-ios-inner"
                  >
                    <option value="">All Branches</option>
                    <option value="arcyn_x">Arcyn.x</option>
                    <option value="modulex">Modulex</option>
                    <option value="nexalab">Nexalab</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-3 bg-ios-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="private"
                    checked={newChannelData.isPrivate}
                    onChange={(e) => setNewChannelData({ ...newChannelData, isPrivate: e.target.checked })}
                    className="w-4 h-4 rounded border-arcyn-border text-ios-blue focus:ring-ios-blue/20"
                  />
                  <label htmlFor="private" className="text-sm text-ios-gray-700">
                    Make this channel private
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-ios-blue text-white font-semibold rounded-xl hover:bg-ios-blue/90 shadow-ios-md transition-all"
                >
                  Create Channel
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}