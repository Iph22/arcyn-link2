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
            className="mb-1 px-3 py-2 bg-black/30 rounded-t-xl border-l-2 border-gold-500"
          >
            <p className="text-xs text-gray-400">{message.reply_to.sender?.full_name}</p>
            <p className="text-sm text-gray-300 truncate">{message.reply_to.content}</p>
          </motion.div>
        )}

        {/* Sender Name (for others' messages) */}
        {!isOwn && (
          <p className="text-xs text-gray-400 mb-1 px-2">{message.sender?.full_name}</p>
        )}

        {/* Message Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`px-4 py-3 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-black'
              : 'bg-arcyn-surface text-white border border-gold-500/20'
          } ${message.reply_to ? 'rounded-tl-none' : ''}`}
        >
          {message.is_deleted ? (
            <p className="italic text-gray-400">This message was deleted</p>
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
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                      <div className="w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center">
                        📎
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{message.file_name}</p>
                        <p className="text-xs opacity-70">
                          {(message.file_size / 1024).toFixed(1)} KB
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
                <span className="text-xs opacity-70">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
                {message.edited && <span className="text-xs opacity-70">edited</span>}
                {isOwn && <span className="text-xs">✓✓</span>}
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
                className="px-2 py-1 bg-arcyn-surface rounded-full text-xs border border-gold-500/20 cursor-pointer hover:border-gold-500/40 transition-all"
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
                className="p-1.5 bg-arcyn-surface rounded-full hover:bg-gold-500/20 transition-colors border border-gold-500/20"
              >
                <Smile className="w-4 h-4 text-gray-400" />
              </motion.button>

              {/* Quick Reactions Popup */}
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-2 left-0 bg-arcyn-surface border border-gold-500/20 rounded-xl p-2 flex gap-1 shadow-gold-glow z-10"
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
                      className="text-xl hover:bg-gold-500/20 rounded-lg p-1 transition-colors"
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
              className="p-1.5 bg-arcyn-surface rounded-full hover:bg-gold-500/20 transition-colors border border-gold-500/20"
            >
              <Reply className="w-4 h-4 text-gray-400" />
            </motion.button>

            {/* More Options */}
            <div className="relative group/more">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 bg-arcyn-surface rounded-full hover:bg-gold-500/20 transition-colors border border-gold-500/20"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </motion.button>

              {/* Dropdown Menu */}
              <div className="absolute bottom-full mb-2 right-0 bg-arcyn-surface border border-gold-500/20 rounded-xl overflow-hidden shadow-gold-glow opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all z-10 min-w-[150px]">
                <button
                  onClick={onForward}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gold-500/20 transition-colors flex items-center gap-2"
                >
                  <Forward className="w-4 h-4" />
                  Forward
                </button>
                <button
                  onClick={onInfo}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gold-500/20 transition-colors flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  Info
                </button>
                {isOwn && (
                  <button
                    onClick={onUnsend}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
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
