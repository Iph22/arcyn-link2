'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, MessageSquare, Phone, Bot, Trophy, User, Settings as SettingsIcon, LogOut, FileText, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { useProfile } from '@/lib/contexts/ProfileContext'
import NotificationBell from '@/components/notifications/NotificationBell'
import GlobalSearch from '@/components/search/GlobalSearch'
import Avatar from '@/components/ui/Avatar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, loading } = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/signin')
    }
  }, [profile, loading, router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ios-gray-50 dark:bg-black flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-ios-blue rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    )
  }

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: MessageSquare, label: 'Chat', href: '/chat' },
    { icon: Phone, label: 'Calls', href: '/calls' },
    { icon: Bot, label: 'AI Playground', href: '/ai-playground' },
    { icon: FileText, label: 'Research Library', href: '/research-library' },
    { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
    { icon: SettingsIcon, label: 'Settings', href: '/settings' },
  ]

  return (
    <div className="min-h-screen bg-ios-gray-50 dark:bg-black flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-ios-gray-800 border border-arcyn-border dark:border-ios-gray-700 rounded-lg text-ios-gray-600 dark:text-ios-gray-400 hover:text-ios-gray-900 dark:hover:text-white transition-colors"
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ 
          x: sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -300 
        }}
        className="fixed lg:static w-72 h-screen bg-white dark:bg-ios-gray-800 border-r border-arcyn-border dark:border-ios-gray-700 flex flex-col shadow-ios z-40"
      >
        {/* Logo */}
        <div className="p-6 border-b border-arcyn-border dark:border-ios-gray-700">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24">
              <img 
                src="/Logo.png" 
                alt="Arcyn Link Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-display font-bold text-ios-blue">ARCYN LINK</h1>
              <p className="text-xs text-ios-gray-500 dark:text-ios-gray-400">AI Evolution</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-ios-blue/10 text-ios-blue border border-ios-blue/20'
                      : 'text-ios-gray-600 dark:text-ios-gray-400 hover:text-ios-gray-900 dark:hover:text-white hover:bg-ios-gray-50 dark:hover:bg-ios-gray-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        {profile && (
          <div className="p-4 border-t border-arcyn-border dark:border-ios-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Avatar 
                src={profile.avatar_url} 
                name={profile.full_name}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ios-gray-900 dark:text-white truncate">{profile.full_name}</p>
                <p className="text-xs text-ios-gray-500 dark:text-ios-gray-400 truncate">@{profile.username}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/profile" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-3 py-2 bg-ios-gray-50 dark:bg-ios-gray-700 border border-arcyn-border dark:border-ios-gray-600 rounded-lg text-xs text-ios-gray-700 dark:text-ios-gray-300 hover:text-ios-gray-900 dark:hover:text-white hover:bg-ios-gray-100 dark:hover:bg-ios-gray-600 transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                className="px-3 py-2 bg-ios-gray-50 dark:bg-ios-gray-700 border border-arcyn-border dark:border-ios-gray-600 rounded-lg text-xs text-ios-gray-700 dark:text-ios-gray-300 hover:text-ios-red hover:border-ios-red/40 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <div className="h-16 glass border-b border-arcyn-border dark:border-ios-gray-700 flex items-center justify-between px-4 lg:px-6">
          <GlobalSearch />
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
