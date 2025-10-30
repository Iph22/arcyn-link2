'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Monitor, MoreVertical } from 'lucide-react'
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng'

interface VideoCallWindowProps {
  callId: string
  channelName: string
  token: string
  onLeave: () => void
}

export default function VideoCallWindow({ callId, channelName, token, onLeave }: VideoCallWindowProps) {
  const [client] = useState<IAgoraRTCClient>(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }))
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<any[]>([])
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [joined, setJoined] = useState(false)
  const localVideoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    joinCall()

    return () => {
      leaveCall()
    }
  }, [])

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current)
    }
  }, [localVideoTrack])

  const joinCall = async () => {
    try {
      // Subscribe to remote users
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType)
        
        if (mediaType === 'video') {
          setRemoteUsers((prev) => {
            const exists = prev.find(u => u.uid === user.uid)
            if (exists) {
              return prev.map(u => u.uid === user.uid ? user : u)
            }
            return [...prev, user]
          })
        }
        
        if (mediaType === 'audio') {
          user.audioTrack?.play()
        }
      })

      client.on('user-unpublished', (user) => {
        setRemoteUsers((prev) => prev.filter(u => u.uid !== user.uid))
      })

      client.on('user-left', (user) => {
        setRemoteUsers((prev) => prev.filter(u => u.uid !== user.uid))
      })

      // Join channel
      await client.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        channelName,
        token,
        Math.floor(Math.random() * 100000)
      )

      // Create and publish local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
      
      setLocalAudioTrack(audioTrack)
      setLocalVideoTrack(videoTrack)
      
      await client.publish([audioTrack, videoTrack])
      
      setJoined(true)
    } catch (error) {
      console.error('Failed to join call:', error)
    }
  }

  const leaveCall = async () => {
    localAudioTrack?.close()
    localVideoTrack?.close()
    
    await client.leave()
    setJoined(false)
    setRemoteUsers([])
    onLeave()
  }

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!audioEnabled)
      setAudioEnabled(!audioEnabled)
    }
  }

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!videoEnabled)
      setVideoEnabled(!videoEnabled)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote Videos Grid */}
      <div className="flex-1 grid grid-cols-2 gap-2 p-4">
        {remoteUsers.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Waiting for others to join...</p>
            </div>
          </div>
        ) : (
          remoteUsers.map((user) => (
            <RemoteVideo key={user.uid} user={user} />
          ))
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <motion.div
        drag
        dragMomentum={false}
        className="absolute top-4 right-4 w-48 h-36 bg-arcyn-surface rounded-xl overflow-hidden border-2 border-gold-500/30 cursor-move shadow-gold-glow"
      >
        <div ref={localVideoRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
          You
        </div>
        {!videoEnabled && (
          <div className="absolute inset-0 bg-arcyn-bg flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </motion.div>

      {/* Call Info */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-4 py-2 rounded-xl">
        <p className="text-white font-semibold">{channelName}</p>
        <p className="text-xs text-gray-400">{remoteUsers.length + 1} participants</p>
      </div>

      {/* Call Controls */}
      <div className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="flex items-center justify-center gap-4">
          {/* Mute Audio */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              audioEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-500 hover:bg-red-600'
            } transition-colors`}
          >
            {audioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </motion.button>

          {/* Toggle Video */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              videoEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-500 hover:bg-red-600'
            } transition-colors`}
          >
            {videoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </motion.button>

          {/* End Call */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={leaveCall}
            className="p-5 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </motion.button>

          {/* Screen Share */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Monitor className="w-6 h-6 text-white" />
          </motion.button>

          {/* More Options */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <MoreVertical className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function RemoteVideo({ user }: { user: any }) {
  const videoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user.videoTrack && videoRef.current) {
      user.videoTrack.play(videoRef.current)
    }
  }, [user.videoTrack])

  return (
    <div className="relative bg-arcyn-surface rounded-xl overflow-hidden">
      <div ref={videoRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded">
        User {user.uid}
      </div>
    </div>
  )
}
