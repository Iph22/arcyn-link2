'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    'Objects': ['🔥', '⭐', '✨', '💫', '⚡', '💥', '💯', '✅', '❌', '⚠️', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🎯', '🎪'],
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-full left-0 mb-2 bg-arcyn-surface border border-gold-500/20 rounded-2xl shadow-gold-glow-lg p-4 w-80 max-h-96 overflow-y-auto z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sticky top-0 bg-arcyn-surface pb-2">
        <h3 className="text-sm font-semibold text-white">Pick an emoji</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gold-500/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="space-y-4">
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category}>
            <p className="text-xs text-gray-400 mb-2 font-medium">{category}</p>
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onSelect(emoji)
                    onClose()
                  }}
                  className="text-2xl p-2 hover:bg-gold-500/20 rounded-lg transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
