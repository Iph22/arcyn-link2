'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Lock, Palette, Globe, Save, Loader2 } from 'lucide-react'
import { getCurrentUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type Tab = 'account' | 'notifications' | 'privacy' | 'appearance' | 'language'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account')
  const [profile, setProfile] = useState<any>(null)
  const [settings, setSettings] = useState({
    // Account
    fullName: '',
    username: '',
    email: '',
    bio: '',
    department: '',
    position: '',
    
    // Notifications
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    callNotifications: true,
    mentionNotifications: true,
    
    // Appearance
    theme: 'dark',
    language: 'en',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const user = await getCurrentUser()
      if (!user) return

      setProfile(user)
      setSettings({
        fullName: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        department: user.department || '',
        position: user.position || '',
        notificationsEnabled: user.notifications_enabled ?? true,
        emailNotifications: true,
        pushNotifications: true,
        messageNotifications: true,
        callNotifications: true,
        mentionNotifications: true,
        theme: user.theme || 'dark',
        language: user.language || 'en',
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: settings.fullName,
          username: settings.username,
          bio: settings.bio,
          department: settings.department,
          position: settings.position,
          notifications_enabled: settings.notificationsEnabled,
          theme: settings.theme,
          language: settings.language,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Settings saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'account' as Tab, label: 'Account', icon: User },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'privacy' as Tab, label: 'Privacy', icon: Lock },
    { id: 'appearance' as Tab, label: 'Appearance', icon: Palette },
    { id: 'language' as Tab, label: 'Language', icon: Globe },
  ]

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
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </motion.div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 bg-arcyn-surface rounded-2xl border border-gold-500/20 p-4"
          >
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gold-500/20 text-gold-400'
                      : 'text-gray-400 hover:text-white hover:bg-arcyn-bg'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 bg-arcyn-surface rounded-2xl border border-gold-500/20 p-8"
          >
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={settings.fullName}
                      onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <input
                      type="text"
                      value={settings.username}
                      onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                      className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    disabled
                    className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                  <textarea
                    value={settings.bio}
                    onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white resize-none transition-all"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Department</label>
                    <input
                      type="text"
                      value={settings.department}
                      onChange={(e) => setSettings({ ...settings, department: e.target.value })}
                      className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Position</label>
                    <input
                      type="text"
                      value={settings.position}
                      onChange={(e) => setSettings({ ...settings, position: e.target.value })}
                      className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>

                <div className="space-y-4">
                  <ToggleSetting
                    label="Enable Notifications"
                    description="Receive notifications for important updates"
                    checked={settings.notificationsEnabled}
                    onChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
                  />

                  <ToggleSetting
                    label="Email Notifications"
                    description="Receive notifications via email"
                    checked={settings.emailNotifications}
                    onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />

                  <ToggleSetting
                    label="Push Notifications"
                    description="Receive push notifications on your device"
                    checked={settings.pushNotifications}
                    onChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                  />

                  <div className="border-t border-gold-500/10 pt-4 mt-4">
                    <p className="text-sm font-semibold text-gray-400 mb-4">Notification Types</p>
                    
                    <ToggleSetting
                      label="Messages"
                      description="Get notified when you receive new messages"
                      checked={settings.messageNotifications}
                      onChange={(checked) => setSettings({ ...settings, messageNotifications: checked })}
                    />

                    <ToggleSetting
                      label="Calls"
                      description="Get notified about incoming calls"
                      checked={settings.callNotifications}
                      onChange={(checked) => setSettings({ ...settings, callNotifications: checked })}
                    />

                    <ToggleSetting
                      label="Mentions"
                      description="Get notified when someone mentions you"
                      checked={settings.mentionNotifications}
                      onChange={(checked) => setSettings({ ...settings, mentionNotifications: checked })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
                <p className="text-gray-400">Privacy settings coming soon...</p>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Appearance</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Theme</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === 'dark'
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-gold-500/20 hover:border-gold-500/40'
                      }`}
                    >
                      <div className="w-full h-24 bg-arcyn-bg rounded-lg mb-3" />
                      <p className="font-semibold text-white">Dark</p>
                    </button>

                    <button
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === 'light'
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-gold-500/20 hover:border-gold-500/40'
                      }`}
                    >
                      <div className="w-full h-24 bg-gray-200 rounded-lg mb-3" />
                      <p className="font-semibold text-white">Light</p>
                      <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Language Settings */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Language & Region</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white transition-all"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="sw">Kiswahili</option>
                    <option value="ha">Hausa</option>
                  </select>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gold-500/20">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold rounded-xl hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ToggleSetting({ label, description, checked, onChange }: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-semibold text-white">{label}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-gold-500' : 'bg-gray-600'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full"
        />
      </button>
    </div>
  )
}
