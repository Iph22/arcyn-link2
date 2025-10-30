'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/auth'
import { Home, MessageSquare, Phone, Bot, Trophy, User, Settings as SettingsIcon, LogOut } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/client'
import NotificationBell from '@/components/notifications/NotificationBell'
import GlobalSearch from '@/components/search/GlobalSearch'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/signin')
        return
      }
      setProfile(user)
    } catch (error) {
      router.push('/signin')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-arcyn-bg flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gold-500 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    )
  }

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: MessageSquare, label: 'Chat', href: '/dashboard/chat' },
    { icon: Phone, label: 'Calls', href: '/dashboard/calls' },
    { icon: Bot, label: 'AI Playground', href: '/dashboard/ai-playground' },
    { icon: Trophy, label: 'Leaderboard', href: '/dashboard/leaderboard' },
    { icon: SettingsIcon, label: 'Settings', href: '/dashboard/settings' },
  ]

  return (
    <div className="min-h-screen bg-arcyn-bg flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-72 bg-arcyn-surface border-r border-gold-500/20 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gold-500/20">
          <div className="flex items-center gap-3">
            <div className="w-32 h-32 mx-auto mb-8">
              <img 
              src="./Logo.png" 
              alt="Logo"
              className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-gold-500">ARCYN LINK</h1>
              <p className="text-xs text-gray-400">AI Evolution</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-arcyn-bg transition-all cursor-pointer"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        {profile && (
          <div className="p-4 border-t border-gold-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-sm font-bold text-black">
                {profile.full_name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{profile.full_name}</p>
                <p className="text-xs text-gray-400">@{profile.username}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/profile" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-3 py-2 bg-arcyn-bg border border-gold-500/20 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gold-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="px-3 py-2 bg-arcyn-bg border border-gold-500/20 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:border-red-500/40 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-arcyn-surface/50 backdrop-blur border-b border-gold-500/20 flex items-center justify-between px-6">
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
