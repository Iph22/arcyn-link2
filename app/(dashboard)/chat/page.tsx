'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, Search, Hash, X } from 'lucide-react'
import { useChannels, createChannel } from '@/lib/hooks/useChannels'
import { useChatMessages, sendMessage } from '@/lib/chat/useChatMessages'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { channels, loading: channelsLoading } = useChannels()
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const { messages, loading: messagesLoading } = useChatMessages(selectedChannelId || undefined)
  
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)

  // Create channel form state
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    branch: '' as 'arcyn_x' | 'modulex' | 'nexalab' | '',
    isPrivate: false,
  })

  const selectedChannel = channels.find(ch => ch.id === selectedChannelId)

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newChannelData.name.trim()) {
      toast.error('Channel name is required')
      return
    }

    try {
      const channel = await createChannel({
        name: newChannelData.name,
        description: newChannelData.description,
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageInput.trim() || !selectedChannelId) return

    setSending(true)
    try {
      await sendMessage({
        content: messageInput,
        channelId: selectedChannelId,
      })
      setMessageInput('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-screen bg-arcyn-bg flex">
      {/* Sidebar */}
      <div className="w-80 bg-arcyn-surface border-r border-gold-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gold-500/20">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-display font-bold text-white">Channels</h1>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="p-2 bg-arcyn-bg rounded-lg hover:bg-gold-500/10 transition-colors"
            >
              <Plus className="w-5 h-5 text-gold-500" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              className="w-full pl-10 pr-4 py-2 bg-arcyn-bg border border-gold-500/20 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 text-sm transition-all"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-4">
          {channelsLoading ? (
            <div className="text-center text-gray-400 py-8">Loading channels...</div>
          ) : channels.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="mb-2">No channels yet</p>
              <button
                onClick={() => setShowCreateChannel(true)}
                className="text-gold-500 hover:text-gold-400 text-sm"
              >
                Create your first channel
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {channels.map((channel) => (
                <motion.button
                  key={channel.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedChannelId(channel.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    selectedChannelId === channel.id
                      ? 'bg-gold-500/20 border border-gold-500/40'
                      : 'hover:bg-arcyn-bg border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-gold-500" />
                    <span className="text-white font-medium">{channel.name}</span>
                  </div>
                  {channel.is_private && (
                    <span className="text-xs text-gray-400">🔒</span>
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
              <div className="w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-gold-glow-lg">
                <MessageSquare className="w-12 h-12 text-black" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Select a Channel
              </h2>
              <p className="text-gray-400 max-w-md">
                Choose a channel from the sidebar to start chatting
              </p>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gold-500/20 flex items-center justify-between px-6 bg-arcyn-surface/50">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gold-500" />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedChannel?.name}
                  </h2>
                  {selectedChannel?.description && (
                    <p className="text-xs text-gray-400">{selectedChannel.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {messagesLoading ? (
                <div className="text-center text-gray-400 py-12">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p>No messages yet. Start the conversation! 🎉</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-black">
                          {message.sender?.full_name?.[0] || '?'}
                        </span>
                      </div>

                      {/* Message Content */}
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-white">
                            {message.sender?.full_name || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-gray-300">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gold-500/20 bg-arcyn-surface/50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message #${selectedChannel?.name}`}
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || !messageInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-semibold rounded-xl hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Create Channel Modal */}
      <AnimatePresence>
        {showCreateChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateChannel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-arcyn-surface rounded-3xl border border-gold-500/20 p-6 shadow-gold-glow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-white">Create Channel</h2>
                <button
                  onClick={() => setShowCreateChannel(false)}
                  className="p-2 hover:bg-arcyn-bg rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={newChannelData.name}
                    onChange={(e) => setNewChannelData({ ...newChannelData, name: e.target.value })}
                    placeholder="e.g., general-chat"
                    required
                    className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newChannelData.description}
                    onChange={(e) => setNewChannelData({ ...newChannelData, description: e.target.value })}
                    placeholder="What's this channel about?"
                    rows={3}
                    className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Branch (Optional)
                  </label>
                  <select
                    value={newChannelData.branch}
                    onChange={(e) => setNewChannelData({ ...newChannelData, branch: e.target.value as any })}
                    className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white transition-all"
                  >
                    <option value="">All Branches</option>
                    <option value="arcyn_x">Arcyn.x</option>
                    <option value="modulex">Modulex</option>
                    <option value="nexalab">Nexalab</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-3 bg-arcyn-bg rounded-xl">
                  <input
                    type="checkbox"
                    id="private"
                    checked={newChannelData.isPrivate}
                    onChange={(e) => setNewChannelData({ ...newChannelData, isPrivate: e.target.checked })}
                    className="w-4 h-4 rounded border-gold-500/20 text-gold-500 focus:ring-gold-500/20"
                  />
                  <label htmlFor="private" className="text-sm text-gray-300">
                    Make this channel private
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold rounded-xl hover:shadow-gold-glow-lg transition-all"
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