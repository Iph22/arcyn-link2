'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Phone, Video, Clock, Users, PhoneCall, VideoIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import VideoCallWindow from '@/components/calls/VideoCallWindow'
import toast from 'react-hot-toast'

export default function CallsPage() {
  const [callHistory, setCallHistory] = useState<any[]>([])
  const [activeCall, setActiveCall] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCallHistory()
  }, [])

  async function loadCallHistory() {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('call_participants')
        .select(`
          *,
          call:calls(*)
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setCallHistory(data.map(p => p.call).filter(Boolean))
      }
    } catch (error) {
      console.error('Error loading call history:', error)
    } finally {
      setLoading(false)
    }
  }

  async function startCall(type: 'audio' | 'video') {
    try {
      const user = await getCurrentUser()
      if (!user) return

      // Generate Agora token (this should be done server-side in production)
      const channelName = `call-${Date.now()}`
      const token = 'temp-token' // Replace with actual token generation

      const { data: call, error } = await supabase
        .from('calls')
        .insert({
          call_type: type,
          initiator_id: user.id,
          agora_channel_name: channelName,
          agora_token: token,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Add participant
      await supabase.from('call_participants').insert({
        call_id: call.id,
        user_id: user.id,
        joined_at: new Date().toISOString(),
      })

      setActiveCall(call)
      toast.success(`${type === 'video' ? 'Video' : 'Audio'} call started!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to start call')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (activeCall) {
    return (
      <VideoCallWindow
        callId={activeCall.id}
        channelName={activeCall.agora_channel_name}
        token={activeCall.agora_token}
        onLeave={() => setActiveCall(null)}
      />
    )
  }

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
          <h1 className="text-4xl font-display font-bold text-white mb-2">Calls</h1>
          <p className="text-gray-400">Start a call or view your call history</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startCall('audio')}
            className="bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl p-8 text-left hover:shadow-gold-glow transition-all"
          >
            <Phone className="w-12 h-12 text-white mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Start Audio Call</h3>
            <p className="text-white/80">High-quality voice communication</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startCall('video')}
            className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-8 text-left hover:shadow-gold-glow transition-all"
          >
            <Video className="w-12 h-12 text-white mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Start Video Call</h3>
            <p className="text-white/80">Face-to-face collaboration</p>
          </motion.button>
        </div>

        {/* Call History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-arcyn-surface rounded-3xl border border-gold-500/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gold-500/20">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-gold-500" />
              Call History
            </h2>
          </div>

          {callHistory.length === 0 ? (
            <div className="p-12 text-center">
              <PhoneCall className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No call history yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gold-500/10">
              {callHistory.map((call, index) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="p-6 hover:bg-arcyn-bg/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        call.call_type === 'video'
                          ? 'bg-blue-500/20'
                          : 'bg-green-500/20'
                      }`}>
                        {call.call_type === 'video' ? (
                          <VideoIcon className="w-6 h-6 text-blue-400" />
                        ) : (
                          <Phone className="w-6 h-6 text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white capitalize">
                          {call.call_type} Call
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(call.started_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        call.status === 'ended' ? 'text-gray-400' :
                        call.status === 'missed' ? 'text-red-400' :
                        'text-green-400'
                      }`}>
                        {call.status}
                      </p>
                      {call.duration && (
                        <p className="text-sm text-gray-400">
                          {formatDuration(call.duration)}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
