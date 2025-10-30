'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Hash, Users, FileText, MessageSquare, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>({
    channels: [],
    users: [],
    messages: [],
    documents: [],
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'channels' | 'users' | 'messages' | 'documents'>('all')
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (query.length > 2) {
      performSearch()
    } else {
      setResults({ channels: [], users: [], messages: [], documents: [] })
    }
  }, [query])

  async function performSearch() {
    setLoading(true)
    try {
      const searchQuery = `%${query}%`

      const [channelsData, usersData, messagesData, documentsData] = await Promise.all([
        supabase
          .from('channels')
          .select('*')
          .or(`name.ilike.${searchQuery},description.ilike.${searchQuery}`)
          .limit(5),
        supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.${searchQuery},username.ilike.${searchQuery}`)
          .limit(5),
        supabase
          .from('messages')
          .select('*, sender:profiles(*)')
          .ilike('content', searchQuery)
          .limit(5),
        supabase
          .from('documents')
          .select('*')
          .ilike('title', searchQuery)
          .limit(5),
      ])

      setResults({
        channels: channelsData.data || [],
        users: usersData.data || [],
        messages: messagesData.data || [],
        documents: documentsData.data || [],
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (type: string, item: any) => {
    setIsOpen(false)
    setQuery('')

    switch (type) {
      case 'channel':
        router.push(`/dashboard/chat?channel=${item.id}`)
        break
      case 'user':
        router.push(`/dashboard/profile?user=${item.id}`)
        break
      case 'message':
        router.push(`/dashboard/chat?message=${item.id}`)
        break
      case 'document':
        router.push(`/dashboard/research-library?doc=${item.id}`)
        break
    }
  }

  const totalResults = results.channels.length + results.users.length + results.messages.length + results.documents.length

  const filteredResults = activeTab === 'all' ? results : {
    channels: activeTab === 'channels' ? results.channels : [],
    users: activeTab === 'users' ? results.users : [],
    messages: activeTab === 'messages' ? results.messages : [],
    documents: activeTab === 'documents' ? results.documents : [],
  }

  return (
    <>
      {/* Search Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-arcyn-bg border border-gold-500/20 rounded-xl hover:border-gold-500/40 transition-all text-gray-400 hover:text-white"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Search...</span>
        <kbd className="px-2 py-0.5 bg-arcyn-surface border border-gold-500/20 rounded text-xs">⌘K</kbd>
      </motion.button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-arcyn-surface border border-gold-500/20 rounded-3xl shadow-gold-glow-lg overflow-hidden z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="p-4 border-b border-gold-500/20">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search channels, users, messages..."
                    autoFocus
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
                  />
                  {loading && <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gold-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              {query.length > 2 && totalResults > 0 && (
                <div className="flex gap-2 px-4 py-2 border-b border-gold-500/20 overflow-x-auto">
                  {[
                    { id: 'all', label: 'All', count: totalResults },
                    { id: 'channels', label: 'Channels', count: results.channels.length },
                    { id: 'users', label: 'Users', count: results.users.length },
                    { id: 'messages', label: 'Messages', count: results.messages.length },
                    { id: 'documents', label: 'Documents', count: results.documents.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-gold-500/20 text-gold-400'
                          : 'text-gray-400 hover:text-white hover:bg-arcyn-bg'
                      }`}
                    >
                      {tab.label} {tab.count > 0 && `(${tab.count})`}
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {query.length === 0 ? (
                  <div className="p-12 text-center">
                    <Search className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Start typing to search</p>
                    <p className="text-xs text-gray-500 mt-1">Press ⌘K to open search</p>
                  </div>
                ) : query.length <= 2 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-400 text-sm">Type at least 3 characters</p>
                  </div>
                ) : totalResults === 0 && !loading ? (
                  <div className="p-12 text-center">
                    <Search className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No results found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gold-500/10">
                    {/* Channels */}
                    {filteredResults.channels.length > 0 && (
                      <div className="p-4">
                        <p className="text-xs text-gray-400 font-semibold mb-2">CHANNELS</p>
                        <div className="space-y-1">
                          {filteredResults.channels.map((channel: any) => (
                            <motion.button
                              key={channel.id}
                              whileHover={{ x: 5 }}
                              onClick={() => handleResultClick('channel', channel)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-arcyn-bg transition-all text-left"
                            >
                              <div className="w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center">
                                <Hash className="w-5 h-5 text-gold-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{channel.name}</p>
                                {channel.description && (
                                  <p className="text-sm text-gray-400 truncate">{channel.description}</p>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Users */}
                    {filteredResults.users.length > 0 && (
                      <div className="p-4">
                        <p className="text-xs text-gray-400 font-semibold mb-2">USERS</p>
                        <div className="space-y-1">
                          {filteredResults.users.map((user: any) => (
                            <motion.button
                              key={user.id}
                              whileHover={{ x: 5 }}
                              onClick={() => handleResultClick('user', user)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-arcyn-bg transition-all text-left"
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-sm font-bold text-black">
                                {user.full_name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{user.full_name}</p>
                                <p className="text-sm text-gray-400 truncate">@{user.username}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {filteredResults.messages.length > 0 && (
                      <div className="p-4">
                        <p className="text-xs text-gray-400 font-semibold mb-2">MESSAGES</p>
                        <div className="space-y-1">
                          {filteredResults.messages.map((message: any) => (
                            <motion.button
                              key={message.id}
                              whileHover={{ x: 5 }}
                              onClick={() => handleResultClick('message', message)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-arcyn-bg transition-all text-left"
                            >
                              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-400 mb-1">
                                  {message.sender?.full_name}
                                </p>
                                <p className="text-white truncate">{message.content}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    {filteredResults.documents.length > 0 && (
                      <div className="p-4">
                        <p className="text-xs text-gray-400 font-semibold mb-2">DOCUMENTS</p>
                        <div className="space-y-1">
                          {filteredResults.documents.map((doc: any) => (
                            <motion.button
                              key={doc.id}
                              whileHover={{ x: 5 }}
                              onClick={() => handleResultClick('document', doc)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-arcyn-bg transition-all text-left"
                            >
                              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-orange-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{doc.title}</p>
                                <p className="text-sm text-gray-400">{doc.file_type}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
