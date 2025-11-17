// lib/hooks/useChannels.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useChannels() {
  const [channels, setChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let realtimeChannel: RealtimeChannel

    async function fetchChannels() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ No user found')
          }
          setLoading(false)
          return
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('📡 Fetching channels for user:', user.id)
        }

        // Fetch channels the user is a member of
        const { data: memberChannels, error: memberError } = await supabase
          .from('channel_members')
          .select(`
            *,
            channel:channels(*)
          `)
          .eq('user_id', user.id)

        if (memberError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Error fetching channel members:', memberError)
          }
          setLoading(false)
          return
        }

        // Extract channels from the results
        const channelList = memberChannels?.map(mc => mc.channel).filter(Boolean) || []
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Fetched channels:', channelList.length)
        }
        setChannels(channelList)
        setLoading(false)
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('💥 Failed to fetch channels:', err)
        }
        setLoading(false)
      }
    }

    fetchChannels()

    // Subscribe to real-time channel updates
    realtimeChannel = supabase
      .channel('channels-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels',
        },
        (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('📢 Channel event:', payload.eventType)
          }
          
          if (payload.eventType === 'INSERT') {
            setChannels((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setChannels((prev) =>
              prev.map((ch) => (ch.id === payload.new.id ? payload.new : ch))
            )
          } else if (payload.eventType === 'DELETE') {
            setChannels((prev) => prev.filter((ch) => ch.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      realtimeChannel.unsubscribe()
    }
  }, [])

  return { channels, loading }
}

// Create a new channel
export async function createChannel({
  name,
  description,
  branch,
  isPrivate = false,
}: {
  name: string
  description?: string
  branch?: 'arcyn_x' | 'modulex' | 'nexalab'
  isPrivate?: boolean
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Creating channel:', { name, branch, isPrivate })
    }

    // Step 1: Create the channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert({
        name,
        description: description || null,
        branch: branch || null,
        is_private: isPrivate,
        created_by: user.id,
      })
      .select()
      .single()

    if (channelError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error creating channel:', channelError)
      }
      throw channelError
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Channel created:', channel)
    }

    // Step 2: Add creator as a member with admin role
    const { error: memberError } = await supabase
      .from('channel_members')
      .insert({
        channel_id: channel.id,
        user_id: user.id,
        role: 'admin',
      })

    if (memberError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error adding channel member:', memberError)
      }
      // Don't throw - channel is created, just membership failed
    }

    // Step 3: Log activity
    try {
      await supabase.from('activity_log').insert({
        user_id: user.id,
        activity_type: 'channel_created',
        points_earned: 20,
      })
    } catch (activityError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Failed to log activity:', activityError)
      }
    }

    return channel
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('💥 Create channel failed:', error)
    }
    throw error
  }
}

// Join a channel
export async function joinChannel(channelId: string) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('channel_members')
    .insert({
      channel_id: channelId,
      user_id: user.id,
      role: 'member',
    })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error joining channel:', error)
    }
    throw error
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Joined channel:', channelId)
  }
}

// Leave a channel
export async function leaveChannel(channelId: string) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('channel_members')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', user.id)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error leaving channel:', error)
    }
    throw error
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Left channel:', channelId)
  }
}

// Get channel details
export async function getChannel(channelId: string) {
  const { data, error } = await supabase
    .from('channels')
    .select(`
      *,
      created_by_profile:profiles!created_by(*)
    `)
    .eq('id', channelId)
    .single()

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error fetching channel:', error)
    }
    throw error
  }

  return data
}