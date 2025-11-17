'use client'

import { motion } from 'framer-motion'
import { X, Check, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'

interface MessageInfoProps {
  message: any
  onClose: () => void
}

export default function MessageInfo({ message, onClose }: MessageInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-arcyn-border rounded-3xl p-6 max-w-md w-full shadow-ios-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ios-gray-900">Message Info</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ios-gray-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-ios-gray-500" />
          </button>
        </div>

        {/* Message Preview */}
        <div className="mb-6 p-4 bg-ios-gray-50 rounded-xl border border-arcyn-border">
          <p className="text-sm text-ios-gray-700 break-words">{message.content}</p>
        </div>

        {/* Info Grid */}
        <div className="space-y-4">
          {/* Sent */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-ios-gray-500" />
              <span className="text-sm text-ios-gray-600">Sent</span>
            </div>
            <span className="text-sm text-ios-gray-900">
              {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>

          {/* Delivered */}
          {message.message_status && message.message_status.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-ios-gray-500" />
                <span className="text-sm text-ios-gray-600">Delivered</span>
              </div>
              <span className="text-sm text-ios-gray-900">
                {message.message_status.filter((s: any) => s.delivered_at).length} recipients
              </span>
            </div>
          )}

          {/* Read */}
          {message.message_status && message.message_status.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-ios-blue" />
                <span className="text-sm text-ios-gray-600">Read</span>
              </div>
              <span className="text-sm text-ios-gray-900">
                {message.message_status.filter((s: any) => s.read_at).length} recipients
              </span>
            </div>
          )}

          {/* Edited */}
          {message.edited && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-ios-gray-600">Edited</span>
              <span className="text-sm text-ios-gray-900">
                {format(new Date(message.edited_at), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
          )}

          {/* Message Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-ios-gray-600">Type</span>
            <span className="text-sm text-ios-gray-900 capitalize">{message.message_type}</span>
          </div>

          {/* File Info */}
          {message.file_url && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ios-gray-600">File Name</span>
                <span className="text-sm text-ios-gray-900 truncate max-w-[200px]">
                  {message.file_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ios-gray-600">File Size</span>
                <span className="text-sm text-ios-gray-900">
                  {(message.file_size / 1024).toFixed(1)} KB
                </span>
              </div>
            </>
          )}
        </div>

        {/* Read By List */}
        {message.message_status && message.message_status.length > 0 && (
          <div className="mt-6 pt-6 border-t border-arcyn-border">
            <h3 className="text-sm font-semibold text-ios-gray-900 mb-3">Read By</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {message.message_status
                .filter((s: any) => s.read_at)
                .map((status: any) => (
                  <div key={status.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-ios-blue to-ios-blue-light rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {status.user?.full_name?.[0] || '?'}
                      </div>
                      <span className="text-sm text-ios-gray-700">{status.user?.full_name}</span>
                    </div>
                    <span className="text-xs text-ios-gray-500">
                      {format(new Date(status.read_at), 'HH:mm')}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
