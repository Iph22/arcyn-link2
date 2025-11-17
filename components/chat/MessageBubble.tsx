'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reply, Forward, Info, Trash2, Smile, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface MessageBubbleProps {
  message: any
  isOwn: boolean
  onReply: () => void
  onUnsend: () => void
  onInfo: () => void
  onReact: (emoji: string) => void
  onForward: () => void
}

export default function MessageBubble({
  message,
  isOwn,
  onReply,
  onUnsend,
  onInfo,
  onReact,
  onForward,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [showReactions, setShowReactions] = useState(false)

  const quickReactions = ['❤️', '👍', '😂', '😮', '😢', '🔥']

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Reply Reference */}
        {message.reply_to && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-1 px-3 py-2 bg-ios-gray-100 rounded-t-xl border-l-2 border-ios-blue"
          >
            <p className="text-xs text-ios-gray-600">{message.reply_to.sender?.full_name}</p>
            <p className="text-sm text-ios-gray-700 truncate">{message.reply_to.content}</p>
          </motion.div>
        )}

        {/* Sender Name (for others' messages) */}
        {!isOwn && (
          <p className="text-xs text-ios-gray-600 mb-1 px-2">{message.sender?.full_name}</p>
        )}

        {/* Message Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`px-4 py-3 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-br from-ios-blue to-ios-blue-light text-white'
              : 'bg-white text-ios-gray-900 border border-arcyn-border shadow-ios-inner'
          } ${message.reply_to ? 'rounded-tl-none' : ''}`}
        >
          {message.is_deleted ? (
            <p className="italic text-ios-gray-500">This message was deleted</p>
          ) : (
            <>
              {/* File/Image Preview */}
              {message.file_url && (
                <div className="mb-2">
                  {message.message_type === 'image' ? (
                    <img
                      src={message.file_url}
                      alt="Attachment"
                      className="rounded-lg max-w-full h-auto"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-ios-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-ios-blue/10 rounded-lg flex items-center justify-center">
                        📎
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ios-gray-900">{message.file_name || 'File'}</p>
                        <p className="text-xs text-ios-gray-600">
                          {message.file_size ? `${(message.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Text Content */}
              {message.content && (
                <p className="break-words whitespace-pre-wrap">{message.content}</p>
              )}

              {/* Forwarded Badge */}
              {message.forwarded_from_id && (
                <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                  <Forward className="w-3 h-3" />
                  <span>Forwarded</span>
                </div>
              )}

              {/* Timestamp & Status */}
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-ios-gray-500'}`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
                {message.edited && <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-ios-gray-500'}`}>edited</span>}
                {isOwn && <span className="text-xs text-white">✓✓</span>}
              </div>
            </>
          )}
        </motion.div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 px-2 flex-wrap">
            {Object.entries(
              message.reactions.reduce((acc: any, r: any) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1
                return acc
              }, {})
            ).map(([emoji, count]) => (
              <motion.span
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="px-2 py-1 bg-white rounded-full text-xs border border-arcyn-border cursor-pointer hover:border-ios-blue/40 transition-all text-ios-gray-900"
              >
                {emoji} {count}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <AnimatePresence>
        {showActions && !message.is_deleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`flex items-center gap-1 ${isOwn ? 'order-1 mr-2' : 'order-2 ml-2'}`}
          >
            {/* React Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 bg-white rounded-full hover:bg-ios-blue/10 transition-colors border border-arcyn-border shadow-ios-inner"
              >
                <Smile className="w-4 h-4 text-ios-gray-600" />
              </motion.button>

              {/* Quick Reactions Popup */}
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-2 left-0 bg-white border border-arcyn-border rounded-xl p-2 flex gap-1 shadow-ios-lg z-10"
                >
                  {quickReactions.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        onReact(emoji)
                        setShowReactions(false)
                      }}
                      className="text-xl hover:bg-ios-gray-50 rounded-lg p-1 transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Reply Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onReply}
              className="p-1.5 bg-white rounded-full hover:bg-ios-blue/10 transition-colors border border-arcyn-border shadow-ios-inner"
              aria-label="Reply to message"
            >
              <Reply className="w-4 h-4 text-ios-gray-600" />
            </motion.button>

            {/* More Options */}
            <div className="relative group/more">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 bg-white rounded-full hover:bg-ios-blue/10 transition-colors border border-arcyn-border shadow-ios-inner"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4 text-ios-gray-600" />
              </motion.button>

              {/* Dropdown Menu */}
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-arcyn-border rounded-xl overflow-hidden shadow-ios-lg opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all z-10 min-w-[150px]">
                <button
                  onClick={onForward}
                  className="w-full px-4 py-2 text-left text-sm text-ios-gray-900 hover:bg-ios-gray-50 transition-colors flex items-center gap-2"
                >
                  <Forward className="w-4 h-4" />
                  Forward
                </button>
                <button
                  onClick={onInfo}
                  className="w-full px-4 py-2 text-left text-sm text-ios-gray-900 hover:bg-ios-gray-50 transition-colors flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  Info
                </button>
                {isOwn && (
                  <button
                    onClick={onUnsend}
                    className="w-full px-4 py-2 text-left text-sm text-ios-red hover:bg-ios-red/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
