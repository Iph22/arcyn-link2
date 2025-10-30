'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Code, FileText, MessageSquare, Send, Sparkles, Loader2 } from 'lucide-react'
import { chatWithClaude, getCodeHelp, analyzeDocument, summarizeChat } from '@/lib/ai/claude'
import toast from 'react-hot-toast'

type Mode = 'chat' | 'code' | 'document' | 'summary'

export default function AIPlaygroundPage() {
  const [mode, setMode] = useState<Mode>('chat')
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const modes = [
    { id: 'chat' as Mode, name: 'AI Chat', icon: MessageSquare, color: 'from-blue-500 to-purple-500', description: 'General conversation with Claude' },
    { id: 'code' as Mode, name: 'Code Help', icon: Code, color: 'from-green-500 to-teal-500', description: 'Get coding assistance' },
    { id: 'document' as Mode, name: 'Doc Analysis', icon: FileText, color: 'from-orange-500 to-red-500', description: 'Analyze documents' },
    { id: 'summary' as Mode, name: 'Summarize', icon: Sparkles, color: 'from-pink-500 to-rose-500', description: 'Summarize text' },
  ]

  const handleSubmit = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)

    try {
      let response

      switch (mode) {
        case 'chat':
          response = await chatWithClaude([...messages, userMessage])
          break
        case 'code':
          response = await getCodeHelp(input, 'Please help me with this code')
          break
        case 'document':
          response = await analyzeDocument(input)
          break
        case 'summary':
          const textToSummarize = messages.map(m => m.content).concat(input)
          response = await summarizeChat(textToSummarize)
          break
      }

      const assistantMessage = {
        role: 'assistant',
        content: typeof response === 'string' ? response : response.content[0]?.text || 'No response'
      }

      setMessages([...messages, userMessage, assistantMessage])
      toast.success('Response received!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to get AI response')
      setMessages([...messages, userMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const clearChat = () => {
    setMessages([])
    toast.success('Chat cleared')
  }

  return (
    <div className="flex h-screen bg-arcyn-bg">
      {/* Sidebar - Mode Selection */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 bg-arcyn-surface border-r border-gold-500/20 p-6 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-gold-glow">
            <Bot className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">AI Playground</h1>
            <p className="text-sm text-gray-400">Powered by Claude</p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-3 flex-1">
          {modes.map((m) => (
            <motion.button
              key={m.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setMode(m.id)
                setMessages([])
              }}
              className={`w-full p-4 rounded-xl border transition-all text-left ${
                mode === m.id
                  ? `bg-gradient-to-r ${m.color} border-transparent text-white shadow-gold-glow`
                  : 'bg-arcyn-bg border-gold-500/20 text-gray-400 hover:border-gold-500/40'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <m.icon className="w-5 h-5" />
                <span className="font-semibold">{m.name}</span>
              </div>
              <p className="text-xs opacity-80">{m.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-6 p-4 bg-arcyn-bg rounded-xl border border-gold-500/20">
          <p className="text-sm text-gray-400 mb-2">Current Session</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gold-500">{messages.length}</span>
            <span className="text-gray-400">messages</span>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-gold-500/20 flex items-center justify-between px-6 bg-arcyn-surface/50 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {modes.find(m => m.id === mode)?.name}
            </h2>
            <p className="text-xs text-gray-400">
              {modes.find(m => m.id === mode)?.description}
            </p>
          </div>
          <button
            onClick={clearChat}
            className="px-4 py-2 bg-arcyn-bg border border-gold-500/20 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gold-500/40 transition-all"
          >
            Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-gold-glow-lg"
                >
                  <Bot className="w-12 h-12 text-black" />
                </motion.div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  Start a Conversation
                </h3>
                <p className="text-gray-400">
                  {mode === 'chat' && 'Ask me anything! I\'m here to help with your questions.'}
                  {mode === 'code' && 'Paste your code and ask for help, explanations, or improvements.'}
                  {mode === 'document' && 'Paste document text for analysis, insights, and summaries.'}
                  {mode === 'summary' && 'Provide text or conversation to get a concise summary.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-black'
                          : 'bg-arcyn-surface text-white border border-gold-500/20'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-gold-500" />
                          <span className="text-xs text-gray-400 font-semibold">Claude AI</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-arcyn-surface p-4 rounded-2xl border border-gold-500/20">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
                      <span className="text-sm text-gray-400">Claude is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-arcyn-surface border-t border-gold-500/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  mode === 'code'
                    ? 'Paste your code here...'
                    : mode === 'document'
                    ? 'Paste document text here...'
                    : 'Type your message...'
                }
                disabled={loading}
                className="flex-1 px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 resize-none max-h-40 transition-all disabled:opacity-50"
                rows={3}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="p-4 bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 text-black animate-spin" />
                ) : (
                  <Send className="w-6 h-6 text-black" />
                )}
              </motion.button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
