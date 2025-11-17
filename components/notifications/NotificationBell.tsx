'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, MessageSquare, Phone, Trophy, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })

  useEffect(() => {
    setMounted(true)
    loadNotifications()
    subscribeToNotifications()
  }, [])

  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
  }, [showDropdown])

  async function loadNotifications() {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading notifications:', error)
      }
    }
  }

  function subscribeToNotifications() {
    getCurrentUser().then(user => {
      if (!user) return

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev])
            setUnreadCount(prev => prev + 1)
          }
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    })
  }

  async function markAsRead(notificationId: string) {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error marking as read:', error)
      }
    }
  }

  async function markAllAsRead() {
    try {
      const user = await getCurrentUser()
      if (!user) return

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error marking all as read:', error)
      }
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageSquare
      case 'call':
        return Phone
      case 'achievement':
        return Trophy
      case 'mention':
        return Users
      default:
        return Bell
    }
  }

  const dropdownContent = (
    <AnimatePresence>
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Content */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
            className="w-96 bg-white border border-arcyn-border rounded-2xl shadow-ios-xl overflow-hidden z-[9999]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-arcyn-border flex items-center justify-between">
              <h3 className="font-bold text-ios-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-ios-blue hover:text-ios-blue/80 transition-colors font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-ios-gray-400 mx-auto mb-2" />
                  <p className="text-ios-gray-600 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-arcyn-border">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-ios-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-ios-blue/5' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notification.type === 'message' ? 'bg-ios-blue/10' :
                            notification.type === 'call' ? 'bg-ios-green/10' :
                            notification.type === 'achievement' ? 'bg-ios-orange/10' :
                            'bg-ios-purple/10'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              notification.type === 'message' ? 'text-ios-blue' :
                              notification.type === 'call' ? 'text-ios-green' :
                              notification.type === 'achievement' ? 'text-ios-orange' :
                              'text-ios-purple'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-ios-gray-900 text-sm mb-1">
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-sm text-ios-gray-600 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-ios-gray-500 mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-ios-blue rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-ios-gray-50 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-ios-gray-600 hover:text-ios-gray-900 transition-colors" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-ios-red rounded-full flex items-center justify-center text-xs font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Render dropdown in portal */}
      {mounted && typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  )
}
