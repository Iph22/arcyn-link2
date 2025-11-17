'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Phone, Video, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import toast from 'react-hot-toast'
import VideoCallWindow from '@/components/calls/VideoCallWindow'

export default function CallsPage() {
  const [loading, setLoading] = useState(false)
  const [calls, setCalls] = useState<any[]>([])
  const [activeCall, setActiveCall] = useState<{
    callId: string
    channelName: string
    token: string
  } | null>(null)

  useEffect(() => {
    loadCallHistory()
  }, [])

  useEffect(() => {
    // Refresh call history when returning from call
    if (!activeCall) {
      loadCallHistory()
    }
  }, [activeCall])

  async function loadCallHistory() {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('initiator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setCalls(data)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading call history:', error)
      }
    }
  }

  const startCall = async (type: 'audio' | 'video') => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Please sign in to start a call')
      }

      // Create a conversation for the call
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: false,
          name: 'Quick Call',
        })
        .select()
        .single()

      if (convError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Conversation error:', convError)
        }
        throw new Error('Failed to create conversation')
      }

      // Add user as participant
      await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
        })

      const channelName = `call-${Date.now()}`
      
      // Create the call
      const { data: call, error: callError } = await supabase
        .from('calls')
        .insert({
          call_type: type,
          status: 'active',
          initiator_id: user.id,
          conversation_id: conversation.id,
          started_at: new Date().toISOString(),
          agora_channel_name: channelName,
        })
        .select()
        .single()

      if (callError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Call error:', callError)
        }
        throw callError
      }

      // Add caller as participant
      await supabase
        .from('call_participants')
        .insert({
          call_id: call.id,
          user_id: user.id,
          joined_at: new Date().toISOString(),
        })

      // Get Agora token
      const tokenResponse = await fetch('/api/agora-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid: user.id }),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get call token')
      }

      const { token } = await tokenResponse.json()

      // Start the call
      setActiveCall({
        callId: call.id,
        channelName,
        token,
      })

      toast.success(`${type === 'audio' ? 'Audio' : 'Video'} call started!`)
      
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Start call error:', error)
      }
      toast.error(error.message || 'Failed to start call')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveCall = async () => {
    if (activeCall) {
      // Update call status
      await supabase
        .from('calls')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', activeCall.callId)
    }
    setActiveCall(null)
    loadCallHistory()
  }

  // Show video call window if active
  if (activeCall) {
    return (
      <VideoCallWindow
        callId={activeCall.callId}
        channelName={activeCall.channelName}
        token={activeCall.token}
        onLeave={handleLeaveCall}
      />
    )
  }

  return (
    <div className="min-h-screen bg-arcyn-bg p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-ios-blue to-ios-blue-light bg-clip-text text-transparent mb-2">
            Calls
          </h1>
          <p className="text-ios-gray-600">Start a call or view your call history</p>
        </motion.div>

        {/* Call Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Audio Call */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startCall('audio')}
            disabled={loading}
            className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-left hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Start Audio Call</h2>
              <p className="text-white/80">High-quality voice communication</p>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          </motion.button>

          {/* Video Call */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startCall('video')}
            disabled={loading}
            className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-8 text-left hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Start video call"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Start Video Call</h2>
              <p className="text-white/80">Face-to-face collaboration</p>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>

        {/* Call History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-6 shadow-ios-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-ios-blue" />
            <h2 className="text-2xl font-bold text-ios-gray-900">Call History</h2>
          </div>

          {calls.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-ios-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-10 h-10 text-ios-gray-500" />
              </div>
              <p className="text-ios-gray-600">No calls yet</p>
              <p className="text-sm text-ios-gray-500 mt-1">Start your first call above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 bg-ios-gray-50 rounded-xl hover:bg-ios-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      call.call_type === 'video' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {call.call_type === 'video' ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <Phone className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-ios-gray-900 font-semibold">
                        {call.call_type === 'video' ? 'Video Call' : 'Audio Call'}
                      </p>
                      <p className="text-sm text-ios-gray-600">
                        {new Date(call.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    call.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    call.status === 'ended' ? 'bg-gray-500/20 text-gray-400' :
                    call.status === 'missed' ? 'bg-red-500/20 text-red-400' :
                    'bg-ios-blue/20 text-ios-blue'
                  }`}>
                    {call.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
        >
          <p className="text-sm text-blue-400">
            💡 <strong>Note:</strong> Video calls will be available soon! Currently setting up the infrastructure.
          </p>
        </motion.div>
      </div>
    </div>
  )
}