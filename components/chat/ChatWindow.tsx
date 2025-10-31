'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react'
import { useChatMessages, sendMessage, unsendMessage, forwardMessage, addReaction } from '@/lib/chat/useChatMessages'
import MessageBubble from './MessageBubble'
import EmojiPicker from './EmojiPicker'
import MessageInfo from './MessageInfo'
import { getCurrentUser } from '@/lib/supabase/auth'
import toast from 'react-hot-toast'

interface ChatWindowProps {
  channelId?: string
  conversationId?: string
  channelName?: string
}

export default function ChatWindow({ channelId, conversationId, channelName }: ChatWindowProps) {
  const { messages, loading } = useChatMessages(channelId, conversationId)
  const [inputValue, setInputValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadCurrentUser() {
    const user = await getCurrentUser()
    setCurrentUserId(user?.id || null)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    try {
      await sendMessage({
        content: inputValue,
        channelId,
        conversationId,
        replyToId: replyingTo?.id,
      })

      setInputValue('')
      setReplyingTo(null)
      toast.success('Message sent!')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleUnsend = async (messageId: string) => {
    try {
      await unsendMessage(messageId)
      toast.success('Message deleted')
    } catch (error) {
      toast.error('Failed to delete message')
    }
  }

  const handleForward = async (messageId: string) => {
    // TODO: Show channel/conversation selector
    toast('Forward feature coming soon!')
  }

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji)
    } catch (error) {
      toast.error('Failed to add reaction')
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // TODO: Implement file upload to Supabase Storage
      toast('File upload coming soon!')
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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
    <div className="flex flex-col h-full bg-arcyn-bg">
      {/* Header */}
      <div className="h-16 border-b border-gold-500/20 flex items-center justify-between px-6 bg-arcyn-surface/50 backdrop-blur">
        <div>
          <h2 className="text-lg font-semibold text-white">{channelName || 'Chat'}</h2>
          <p className="text-xs text-gray-400">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold-glow">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No messages yet</h3>
              <p className="text-gray-400">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message: any) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                onReply={() => setReplyingTo(message)}
                onUnsend={() => handleUnsend(message.id)}
                onInfo={() => setSelectedMessage(message)}
                onReact={(emoji) => handleReact(message.id, emoji)}
                onForward={() => handleForward(message.id)}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 bg-arcyn-surface border-t border-gold-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-10 bg-gold-500 rounded-full" />
                <div>
                  <p className="text-xs text-gray-400">
                    Replying to {replyingTo.sender?.full_name}
                  </p>
                  <p className="text-sm text-gray-300 truncate max-w-md">
                    {replyingTo.content}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 bg-arcyn-surface border-t border-gold-500/20">
        <div className="flex items-end gap-2">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 text-gray-400 hover:text-gold-500 transition-colors disabled:opacity-50"
          >
            <Paperclip className="w-6 h-6" />
          </button>

          {/* Emoji Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-gold-500 transition-colors"
            >
              <Smile className="w-6 h-6" />
            </button>

            {showEmojiPicker && (
              <EmojiPicker
                onSelect={(emoji) => setInputValue(inputValue + emoji)}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-black/50 border border-gold-500/20 rounded-2xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 resize-none max-h-32 transition-all"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-black" />
          </motion.button>
        </div>
      </div>

      {/* Message Info Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <MessageInfo
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
