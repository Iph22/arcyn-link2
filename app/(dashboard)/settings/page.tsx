'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Lock, Palette, Globe, Save, Loader2, MessageSquare, Shield, Monitor } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { sanitizeUserInput } from '@/lib/utils/sanitize'
import { isValidUsername } from '@/lib/utils/validation'
import toast from 'react-hot-toast'
import AvatarUpload from '@/components/settings/AvatarUpload'
import PasswordChange from '@/components/settings/PasswordChange'
import DeleteAccount from '@/components/settings/DeleteAccount'
import { useTheme, type Theme } from '@/lib/hooks/useTheme'
import { useProfile } from '@/lib/contexts/ProfileContext'

type Tab = 'account' | 'notifications' | 'privacy' | 'appearance' | 'language' | 'security'

export default function SettingsPage() {
  const { theme, setTheme: updateTheme, mounted: themeMounted } = useTheme()
  const { profile, refreshProfile } = useProfile()
  const [activeTab, setActiveTab] = useState<Tab>('account')
  const [settings, setSettings] = useState({
    // Account
    fullName: '',
    username: '',
    email: '',
    bio: '',
    department: '',
    position: '',
    statusMessage: '',
    
    // Notifications
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    callNotifications: true,
    mentionNotifications: true,
    
    // Privacy
    profileVisibility: 'everyone',
    whoCanMessage: 'everyone',
    showOnlineStatus: true,
    showReadReceipts: true,
    
    // Appearance
    theme: 'system' as Theme,
    language: 'en',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sync theme from hook to settings
  useEffect(() => {
    if (themeMounted) {
      setSettings(prev => ({ ...prev, theme }))
    }
  }, [theme, themeMounted])

  useEffect(() => {
    if (profile) {
      // Load theme from user profile or localStorage (only on client)
      let savedTheme: Theme = 'system'
      if (typeof window !== 'undefined') {
        savedTheme = (profile.theme || localStorage.getItem('theme') || 'system') as Theme
        if (['light', 'dark', 'system'].includes(savedTheme)) {
          updateTheme(savedTheme)
        }
      } else if (profile.theme && ['light', 'dark', 'system'].includes(profile.theme)) {
        savedTheme = profile.theme as Theme
      }
      
      setSettings({
        fullName: profile.full_name || '',
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.bio || '',
        department: profile.department || '',
        position: profile.position || '',
        statusMessage: profile.status_message || '',
        notificationsEnabled: profile.notifications_enabled ?? true,
        emailNotifications: profile.email_notifications ?? true,
        pushNotifications: profile.push_notifications ?? true,
        messageNotifications: profile.message_notifications ?? true,
        callNotifications: profile.call_notifications ?? true,
        mentionNotifications: profile.mention_notifications ?? true,
        profileVisibility: profile.profile_visibility || 'everyone',
        whoCanMessage: profile.who_can_message || 'everyone',
        showOnlineStatus: profile.show_online_status ?? true,
        showReadReceipts: profile.show_read_receipts ?? true,
        theme: savedTheme,
        language: profile.language || 'en',
      })
    }
  }, [profile, updateTheme])

  async function saveSettings() {
    // Validate username if changed
    if (settings.username && settings.username !== profile?.username) {
      const usernameValidation = isValidUsername(settings.username)
      if (!usernameValidation.valid) {
        toast.error(usernameValidation.errors[0])
        return
      }
    }

    setSaving(true)
    try {
      if (!profile) return

      // Update theme in both localStorage and database
      updateTheme(settings.theme)
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: sanitizeUserInput(settings.fullName.trim(), 100),
          username: sanitizeUserInput(settings.username.trim(), 30),
          bio: sanitizeUserInput(settings.bio.trim(), 500),
          department: sanitizeUserInput(settings.department.trim(), 100),
          position: sanitizeUserInput(settings.position.trim(), 100),
          status_message: sanitizeUserInput(settings.statusMessage.trim(), 100),
          notifications_enabled: settings.notificationsEnabled,
          email_notifications: settings.emailNotifications,
          push_notifications: settings.pushNotifications,
          message_notifications: settings.messageNotifications,
          call_notifications: settings.callNotifications,
          mention_notifications: settings.mentionNotifications,
          profile_visibility: settings.profileVisibility,
          who_can_message: settings.whoCanMessage,
          show_online_status: settings.showOnlineStatus,
          show_read_receipts: settings.showReadReceipts,
          theme: settings.theme,
          language: settings.language,
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Settings saved successfully!')
      // Reload profile to reflect changes
      await refreshProfile()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'account' as Tab, label: 'Account', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
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
          <h1 className="text-4xl font-display font-bold text-ios-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-ios-gray-600 dark:text-ios-gray-400">Manage your account and preferences</p>
        </motion.div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 bg-white dark:bg-ios-gray-800 rounded-2xl border border-arcyn-border dark:border-ios-gray-700 p-4 shadow-ios"
          >
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-ios-blue/10 text-ios-blue border border-ios-blue/20'
                      : 'text-ios-gray-600 dark:text-ios-gray-400 hover:text-ios-gray-900 dark:hover:text-white hover:bg-ios-gray-50 dark:hover:bg-ios-gray-700'
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
            className="flex-1 bg-white dark:bg-ios-gray-800 rounded-2xl border border-arcyn-border dark:border-ios-gray-700 p-8 shadow-ios"
          >
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ios-gray-900 dark:text-white mb-6">Account Settings</h2>

                {/* Avatar Upload */}
                {profile && (
                  <AvatarUpload
                    currentAvatarUrl={profile.avatar_url}
                    userId={profile.id}
                    onUploadComplete={async (url) => {
                      await refreshProfile()
                    }}
                  />
                )}

                <div className="border-t border-gold-500/10 pt-6" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={settings.fullName}
                      onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={settings.username}
                    onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
                    aria-label="Username"
                    maxLength={30}
                  />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    disabled
                    className="w-full px-4 py-3 bg-ios-gray-50 border border-arcyn-border rounded-xl text-ios-gray-500 cursor-not-allowed"
                    aria-label="Email (read-only)"
                  />
                  <p className="text-xs text-ios-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">Bio</label>
                  <textarea
                    value={settings.bio}
                    onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 resize-none transition-all shadow-ios-inner"
                    placeholder="Tell us about yourself..."
                    aria-label="Bio"
                    maxLength={500}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={settings.department}
                      onChange={(e) => setSettings({ ...settings, department: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">Position</label>
                    <input
                      type="text"
                      value={settings.position}
                      onChange={(e) => setSettings({ ...settings, position: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
                    />
                  </div>
                </div>

                {/* Status Message */}
                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    Status Message
                  </label>
                  <div className="flex gap-2">
                    <MessageSquare className="w-5 h-5 text-ios-gray-500 mt-3" />
                    <input
                      type="text"
                      value={settings.statusMessage}
                      onChange={(e) => setSettings({ ...settings, statusMessage: e.target.value })}
                      placeholder="What's on your mind?"
                      maxLength={100}
                      className="flex-1 px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 placeholder-ios-gray-400 transition-all shadow-ios-inner"
                      aria-label="Status message"
                    />
                  </div>
                  <p className="text-xs text-ios-gray-500 mt-1">This will be visible to other users</p>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ios-gray-900 dark:text-white mb-6">Security Settings</h2>

                {/* Password Change */}
                <PasswordChange />

                <div className="border-t border-gold-500/10 pt-6" />

                {/* Delete Account */}
                <DeleteAccount />
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ios-gray-900 dark:text-white mb-6">Notification Settings</h2>

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
                    <p className="text-sm font-semibold text-ios-gray-700 mb-4">Notification Types</p>
                    
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
                <h2 className="text-2xl font-bold text-ios-gray-900 dark:text-white mb-6">Privacy Settings</h2>

                {/* Profile Visibility */}
                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-3">
                    Who can see your profile?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-arcyn-border cursor-pointer hover:border-ios-blue/40 transition-all shadow-ios-inner">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="everyone"
                        checked={settings.profileVisibility === 'everyone'}
                        onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                        className="w-4 h-4 text-ios-blue"
                      />
                      <div>
                        <p className="font-semibold text-ios-gray-900 dark:text-white">Everyone</p>
                        <p className="text-xs text-ios-gray-600 dark:text-ios-gray-400">Anyone can view your profile</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-arcyn-border cursor-pointer hover:border-ios-blue/40 transition-all shadow-ios-inner">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="team"
                        checked={settings.profileVisibility === 'team'}
                        onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                        className="w-4 h-4 text-ios-blue"
                      />
                      <div>
                        <p className="font-semibold text-ios-gray-900 dark:text-white">Team Only</p>
                        <p className="text-xs text-ios-gray-600 dark:text-ios-gray-400">Only members of your branch can view</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-arcyn-border cursor-pointer hover:border-ios-blue/40 transition-all shadow-ios-inner">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="private"
                        checked={settings.profileVisibility === 'private'}
                        onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                        className="w-4 h-4 text-ios-blue"
                      />
                      <div>
                        <p className="font-semibold text-ios-gray-900 dark:text-white">Private</p>
                        <p className="text-xs text-ios-gray-600 dark:text-ios-gray-400">Only you can view your profile</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Messaging Privacy */}
                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-3">
                    Who can send you messages?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-arcyn-border cursor-pointer hover:border-ios-blue/40 transition-all shadow-ios-inner">
                      <input
                        type="radio"
                        name="whoCanMessage"
                        value="everyone"
                        checked={settings.whoCanMessage === 'everyone'}
                        onChange={(e) => setSettings({ ...settings, whoCanMessage: e.target.value })}
                        className="w-4 h-4 text-ios-blue"
                      />
                      <div>
                        <p className="font-semibold text-ios-gray-900 dark:text-white">Everyone</p>
                        <p className="text-xs text-ios-gray-600 dark:text-ios-gray-400">Anyone can message you</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-arcyn-border cursor-pointer hover:border-ios-blue/40 transition-all shadow-ios-inner">
                      <input
                        type="radio"
                        name="whoCanMessage"
                        value="team"
                        checked={settings.whoCanMessage === 'team'}
                        onChange={(e) => setSettings({ ...settings, whoCanMessage: e.target.value })}
                        className="w-4 h-4 text-ios-blue"
                      />
                      <div>
                        <p className="font-semibold text-ios-gray-900 dark:text-white">Team Only</p>
                        <p className="text-xs text-ios-gray-600 dark:text-ios-gray-400">Only team members can message you</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-arcyn-border cursor-pointer hover:border-ios-blue/40 transition-all shadow-ios-inner">
                      <input
                        type="radio"
                        name="whoCanMessage"
                        value="none"
                        checked={settings.whoCanMessage === 'none'}
                        onChange={(e) => setSettings({ ...settings, whoCanMessage: e.target.value })}
                        className="w-4 h-4 text-ios-blue"
                      />
                      <div>
                        <p className="font-semibold text-ios-gray-900 dark:text-white">No One</p>
                        <p className="text-xs text-ios-gray-600 dark:text-ios-gray-400">Disable direct messages</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Additional Privacy Toggles */}
                <div className="space-y-4 pt-4 border-t border-gold-500/10">
                  <ToggleSetting
                    label="Show Online Status"
                    description="Let others see when you're online"
                    checked={settings.showOnlineStatus}
                    onChange={(checked) => setSettings({ ...settings, showOnlineStatus: checked })}
                  />

                  <ToggleSetting
                    label="Show Read Receipts"
                    description="Let others see when you've read their messages"
                    checked={settings.showReadReceipts}
                    onChange={(checked) => setSettings({ ...settings, showReadReceipts: checked })}
                  />
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ios-gray-900 dark:text-white mb-6">Appearance</h2>

                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 dark:text-ios-gray-300 mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === 'light'
                          ? 'border-ios-blue bg-ios-blue/10 dark:bg-ios-blue/20'
                          : 'border-arcyn-border dark:border-ios-gray-700 hover:border-ios-blue/40'
                      }`}
                      aria-label="Light theme"
                      aria-pressed={settings.theme === 'light'}
                    >
                      <div className="w-full h-24 bg-gradient-to-br from-ios-gray-50 to-white rounded-lg mb-3 border border-arcyn-border" />
                      <p className="font-semibold text-ios-gray-900 dark:text-white">Light</p>
                    </button>

                    <button
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === 'dark'
                          ? 'border-ios-blue bg-ios-blue/10 dark:bg-ios-blue/20'
                          : 'border-arcyn-border dark:border-ios-gray-700 hover:border-ios-blue/40'
                      }`}
                      aria-label="Dark theme"
                      aria-pressed={settings.theme === 'dark'}
                    >
                      <div className="w-full h-24 bg-gradient-to-br from-ios-gray-900 to-black rounded-lg mb-3" />
                      <p className="font-semibold text-ios-gray-900 dark:text-white">Dark</p>
                    </button>

                    <button
                      onClick={() => setSettings({ ...settings, theme: 'system' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === 'system'
                          ? 'border-ios-blue bg-ios-blue/10 dark:bg-ios-blue/20'
                          : 'border-arcyn-border dark:border-ios-gray-700 hover:border-ios-blue/40'
                      }`}
                      aria-label="System theme"
                      aria-pressed={settings.theme === 'system'}
                    >
                      <div className="w-full h-24 bg-gradient-to-br from-ios-gray-50 via-ios-gray-400 to-ios-gray-900 rounded-lg mb-3 border border-arcyn-border dark:border-ios-gray-700" />
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Monitor className="w-4 h-4 text-ios-gray-600 dark:text-ios-gray-400" />
                        <p className="font-semibold text-ios-gray-900 dark:text-white">System</p>
                      </div>
                      <p className="text-xs text-ios-gray-500 dark:text-ios-gray-400">Match system</p>
                    </button>
                  </div>
                  {!themeMounted && (
                    <p className="text-xs text-ios-gray-500 dark:text-ios-gray-400 mt-2">Loading theme...</p>
                  )}
                </div>
              </div>
            )}

            {/* Language Settings */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ios-gray-900 dark:text-white mb-6">Language & Region</h2>

                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-arcyn-border rounded-xl focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 text-ios-gray-900 transition-all shadow-ios-inner"
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
                className="px-6 py-3 bg-ios-blue text-white font-bold rounded-xl hover:bg-ios-blue/90 shadow-ios-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        <p className="font-semibold text-ios-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-ios-gray-600 dark:text-ios-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-ios-blue' : 'bg-ios-gray-300'
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
