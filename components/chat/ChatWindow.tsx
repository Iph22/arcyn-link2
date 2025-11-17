'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react'
import { useChatMessages, sendMessage, unsendMessage, forwardMessage, addReaction } from '@/lib/chat/useChatMessages'
import MessageBubble from './MessageBubble'
import EmojiPicker from './EmojiPicker'
import MessageInfo from './MessageInfo'
import ForwardMessageModal from './ForwardMessageModal'
import { getCurrentUser } from '@/lib/supabase/auth'
import { uploadFile } from '@/lib/storage/fileUpload'
import { sanitizeUserInput } from '@/lib/utils/sanitize'
import { isValidFileType, isValidFileSize } from '@/lib/utils/validation'
import toast from 'react-hot-toast'

interface ChatWindowProps {
  channelId?: string
  conversationId?: string
  channelName?: string
}

export default function ChatWindow({ channelId, conversationId, channelName }: ChatWindowProps) {
  const { messages, loading } = useChatMessages(channelId, conversationId)
  
  if (!channelId && !conversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-ios-blue to-ios-blue-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-ios-lg">
            <span className="text-3xl">💬</span>
          </div>
          <h3 className="text-xl font-bold text-ios-gray-900 mb-2">Select a Channel</h3>
          <p className="text-ios-gray-600">Choose a channel from the sidebar to start chatting</p>
        </div>
      </div>
    )
  }
  const [inputValue, setInputValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [forwardingMessageId, setForwardingMessageId] = useState<string | null>(null)
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

    const sanitizedContent = sanitizeUserInput(inputValue, 5000)
    if (!sanitizedContent) {
      toast.error('Message cannot be empty')
      return
    }

    // Optimistic update: create temporary message
    const tempId = `temp-${Date.now()}`
    const optimisticMessage = {
      id: tempId,
      content: sanitizedContent,
      message_type: 'text' as const,
      sender_id: currentUserId || '',
      channel_id: channelId || null,
      conversation_id: conversationId || null,
      reply_to_id: replyingTo?.id || null,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: currentUserId ? { id: currentUserId, full_name: 'You', username: 'you' } : undefined,
      reactions: [],
    }

    // Clear input immediately for better UX
    const messageToSend = inputValue
    setInputValue('')
    const replyTo = replyingTo
    setReplyingTo(null)

    try {
      await sendMessage({
        content: sanitizedContent,
        channelId,
        conversationId,
        replyToId: replyTo?.id,
      })
      // Real-time subscription will add the actual message, so we don't need to manually add it
      // The optimistic message will be replaced by the real one
    } catch (error: any) {
      // Revert optimistic update on error
      setInputValue(messageToSend)
      if (replyTo) setReplyingTo(replyTo)
      toast.error(error.message || 'Failed to send message')
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
    setForwardingMessageId(messageId)
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

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setUploading(true)
    try {
      const uploadedFile = await uploadFile(file, channelId)
      
      // Determine message type based on file type
      let messageType: 'image' | 'video' | 'audio' | 'file' = 'file'
      if (uploadedFile.type.startsWith('image/')) messageType = 'image'
      else if (uploadedFile.type.startsWith('video/')) messageType = 'video'
      else if (uploadedFile.type.startsWith('audio/')) messageType = 'audio'
      
      // Send message with file attachment
      await sendMessage({
        content: `📎 ${uploadedFile.name}`,
        channelId,
        conversationId,
        messageType,
        fileUrl: uploadedFile.url,
      })

      toast.success('File uploaded!')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file')
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
      <div className="h-16 border-b border-arcyn-border flex items-center justify-between px-6 bg-white shadow-ios-inner">
        <div>
          <h2 className="text-lg font-semibold text-ios-gray-900">{channelName || 'Chat'}</h2>
          <p className="text-xs text-ios-gray-600">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-ios-blue to-ios-blue-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-ios-lg">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-ios-gray-900 mb-2">No messages yet</h3>
              <p className="text-ios-gray-600">Start the conversation!</p>
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
            className="px-4 py-2 bg-white border-t border-arcyn-border shadow-ios-inner"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-10 bg-ios-blue rounded-full" />
                <div>
                  <p className="text-xs text-ios-gray-600">
                    Replying to {replyingTo.sender?.full_name}
                  </p>
                  <p className="text-sm text-ios-gray-700 truncate max-w-md">
                    {replyingTo.content}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 text-ios-gray-500 hover:text-ios-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-arcyn-border shadow-ios-inner">
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
            className="p-2 text-ios-gray-500 hover:text-ios-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Attach file"
          >
            <Paperclip className="w-6 h-6" />
          </button>

          {/* Emoji Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-ios-gray-500 hover:text-ios-blue transition-colors"
              aria-label="Add emoji"
              aria-expanded={showEmojiPicker}
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
              className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-2xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 resize-none max-h-32 transition-all shadow-ios-inner"
              rows={1}
              aria-label="Message input"
              maxLength={5000}
            />
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputValue.trim() || uploading}
            className="p-3 bg-ios-blue rounded-full hover:bg-ios-blue/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-ios-md"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 text-white" />
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

      {/* Forward Message Modal */}
      {forwardingMessageId && (
        <ForwardMessageModal
          messageId={forwardingMessageId}
          onClose={() => setForwardingMessageId(null)}
        />
      )}
    </div>
  )
}
