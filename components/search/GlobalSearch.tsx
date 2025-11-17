'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Hash, Users, FileText, MessageSquare, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
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
    setMounted(true)
  }, [])

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
    const timeoutId = setTimeout(() => {
      if (query.length > 2) {
        performSearch()
      } else {
        setResults({ channels: [], users: [], messages: [], documents: [] })
      }
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(timeoutId)
  }, [query])

  async function performSearch() {
    setLoading(true)
    try {
      // Sanitize search query to prevent SQL injection
      const sanitizedQuery = query.trim().replace(/[%_]/g, '')
      if (!sanitizedQuery || sanitizedQuery.length < 3) {
        setResults({ channels: [], users: [], messages: [], documents: [] })
        setLoading(false)
        return
      }

      const searchQuery = `%${sanitizedQuery}%`

      const [channelsData, usersData, messagesData, documentsData] = await Promise.all([
        supabase
          .from('channels')
          .select('*')
          .or(`name.ilike."${searchQuery}",description.ilike."${searchQuery}"`)
          .limit(5),
        supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike."${searchQuery}",username.ilike."${searchQuery}"`)
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Search error:', error)
      }
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

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center pt-20 px-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-white border border-arcyn-border rounded-3xl shadow-ios-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Search Input */}
              <div className="p-4 border-b border-arcyn-border">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-ios-gray-500" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search channels, users, messages..."
                    autoFocus
                    className="flex-1 bg-transparent text-ios-gray-900 placeholder-ios-gray-400 outline-none"
                  />
                  {loading && <Loader2 className="w-5 h-5 text-ios-blue animate-spin" />}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-ios-gray-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-ios-gray-500" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              {query.length > 2 && totalResults > 0 && (
                <div className="flex gap-2 px-4 py-2 border-b border-arcyn-border overflow-x-auto">
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
                          ? 'bg-ios-blue/10 text-ios-blue border border-ios-blue/20'
                          : 'text-ios-gray-600 hover:text-ios-gray-900 hover:bg-ios-gray-50'
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
                    <Search className="w-12 h-12 text-ios-gray-400 mx-auto mb-2" />
                    <p className="text-ios-gray-600 text-sm">Start typing to search</p>
                    <p className="text-xs text-ios-gray-500 mt-1">Press ⌘K to open search</p>
                  </div>
                ) : query.length <= 2 ? (
                  <div className="p-12 text-center">
                    <p className="text-ios-gray-600 text-sm">Type at least 3 characters</p>
                  </div>
                ) : totalResults === 0 && !loading ? (
                  <div className="p-12 text-center">
                    <Search className="w-12 h-12 text-ios-gray-400 mx-auto mb-2" />
                    <p className="text-ios-gray-600 text-sm">No results found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-arcyn-border">
                    {/* Channels */}
                    {filteredResults.channels.length > 0 && (
                      <div className="p-4">
                        <p className="text-xs text-ios-gray-500 font-semibold mb-2">CHANNELS</p>
                        <div className="space-y-1">
                          {filteredResults.channels.map((channel: any) => (
                            <motion.button
                              key={channel.id}
                              whileHover={{ x: 5 }}
                              onClick={() => handleResultClick('channel', channel)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-ios-gray-50 transition-all text-left"
                            >
                              <div className="w-10 h-10 bg-ios-blue/10 rounded-lg flex items-center justify-center">
                                <Hash className="w-5 h-5 text-ios-blue" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-ios-gray-900 truncate">{channel.name}</p>
                                {channel.description && (
                                  <p className="text-sm text-ios-gray-600 truncate">{channel.description}</p>
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
                        <p className="text-xs text-ios-gray-500 font-semibold mb-2">USERS</p>
                        <div className="space-y-1">
                          {filteredResults.users.map((user: any) => (
                            <motion.button
                              key={user.id}
                              whileHover={{ x: 5 }}
                              onClick={() => handleResultClick('user', user)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-ios-gray-50 transition-all text-left"
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-ios-blue to-ios-blue-light rounded-full flex items-center justify-center text-sm font-bold text-white">
                                {user.full_name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-ios-gray-900 truncate">{user.full_name}</p>
                                <p className="text-sm text-ios-gray-600 truncate">@{user.username}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {filteredResults.messages.length > 0 && (
                      <div className="p-4">
                        <p className="text-xs text-ios-gray-500 font-semibold mb-2">MESSAGES</p>
                        <div className="space-y-1">
                          {filteredResults.messages.map((message: any) => (
                            <motion.button
                              key={message.id}
                              whileHover={{ x: 5 }}
                              onClick={() => handleResultClick('message', message)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-ios-gray-50 transition-all text-left"
                            >
                              <div className="w-10 h-10 bg-ios-blue/10 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-ios-blue" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-ios-gray-600 mb-1">
                                  {message.sender?.full_name}
                                </p>
                                <p className="text-ios-gray-900 truncate">{message.content}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    {filteredResults.documents.length > 0 && (
                      <div className="p-4">
                        <p className="text-xs text-ios-gray-500 font-semibold mb-2">DOCUMENTS</p>
                        <div className="space-y-1">
                          {filteredResults.documents.map((doc: any) => (
                            <motion.button
                              key={doc.id}
                              whileHover={{ x: 5 }}
                              onClick={() => handleResultClick('document', doc)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-ios-gray-50 transition-all text-left"
                            >
                              <div className="w-10 h-10 bg-ios-orange/10 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-ios-orange" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-ios-gray-900 truncate">{doc.title}</p>
                                <p className="text-sm text-ios-gray-600">{doc.file_type}</p>
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
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {/* Search Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-arcyn-border rounded-xl hover:border-ios-blue/40 transition-all text-ios-gray-600 hover:text-ios-gray-900 shadow-ios-inner"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Search...</span>
        <kbd className="px-2 py-0.5 bg-ios-gray-50 border border-arcyn-border rounded text-xs text-ios-gray-600">⌘K</kbd>
      </motion.button>

      {/* Render modal in portal to escape parent container constraints */}
      {mounted && typeof window !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  )
}
