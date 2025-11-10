import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import type { MessageWithSender } from '@/lib/supabase/client'

export function useChatMessages(channelId?: string, conversationId?: string) {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel: RealtimeChannel

    async function fetchMessages() {
      try {
        const query = supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!sender_id(*),
            reactions:message_reactions(*)
          `)
          .order('created_at', { ascending: true })

        if (channelId) {
          query.eq('channel_id', channelId)
        } else if (conversationId) {
          query.eq('conversation_id', conversationId)
        }

        const { data, error } = await query

        if (error) {
          console.error('❌ Error fetching messages:', error)
        } else if (data) {
          console.log('✅ Fetched messages:', data.length)
          setMessages(data)
        }
      } catch (err) {
        console.error('💥 Failed to fetch messages:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to real-time updates
    channel = supabase
      .channel(`messages-${channelId || conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: channelId 
            ? `channel_id=eq.${channelId}` 
            : `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log('📨 Real-time message event:', payload.eventType, payload)
          
          if (payload.eventType === 'INSERT') {
            // Fetch the full message with sender details
            const { data: fullMessage } = await supabase
              .from('messages')
              .select(`
                *,
                sender:profiles!sender_id(*),
                reactions:message_reactions(*)
              `)
              .eq('id', payload.new.id)
              .single()

            if (fullMessage) {
              console.log('✅ Adding new message to chat:', fullMessage)
              setMessages((prev) => [...prev, fullMessage])
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch updated message with full details
            const { data: updatedMessage } = await supabase
              .from('messages')
              .select(`
                *,
                sender:profiles!sender_id(*),
                reactions:message_reactions(*)
              `)
              .eq('id', payload.new.id)
              .single()

            if (updatedMessage) {
              setMessages((prev) =>
                prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
              )
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time messages')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time channel error')
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Real-time subscription timed out')
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [channelId, conversationId])

  return { messages, loading }
}

export async function sendMessage({
  content,
  channelId,
  conversationId,
  messageType = 'text',
  fileUrl,
  replyToId,
}: {
  content: string
  channelId?: string
  conversationId?: string
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'code'
  fileUrl?: string
  replyToId?: string
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('📤 Sending message:', { content, channelId, conversationId })
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        message_type: messageType,
        sender_id: user.id,
        channel_id: channelId || null,
        conversation_id: conversationId || null,
        file_url: fileUrl || null,
        reply_to_id: replyToId || null,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error sending message:', error)
      throw error
    }
    
    console.log('✅ Message sent:', data)

    // Log activity (don't fail if this errors)
    try {
      await supabase.from('activity_log').insert({
        user_id: user.id,
        activity_type: 'message',
        points_earned: 1,
      })
    } catch (activityError) {
      console.warn('⚠️ Failed to log activity:', activityError)
    }
    
    return data
  } catch (error) {
    console.error('💥 Send message failed:', error)
    throw error
  }
}

export async function unsendMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ 
      is_deleted: true, 
      deleted_at: new Date().toISOString(),
      content: 'This message was deleted'
    })
    .eq('id', messageId)

  if (error) throw error
}

export async function forwardMessage({
  messageId,
  targetChannelId,
  targetConversationId,
}: {
  messageId: string
  targetChannelId?: string
  targetConversationId?: string
}) {
  const { data: originalMessage } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single()

  if (!originalMessage) {
    throw new Error('Original message not found')
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      content: originalMessage.content,
      message_type: originalMessage.message_type,
      sender_id: user?.id,
      channel_id: targetChannelId || null,
      conversation_id: targetConversationId || null,
      file_url: originalMessage.file_url,
      forwarded_from_id: messageId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addReaction(messageId: string, emoji: string) {
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('message_reactions')
    .insert({
      message_id: messageId,
      user_id: user?.id,
      emoji,
    })

  if (error) throw error
}

export async function updateMessageStatus(messageId: string, status: 'delivered' | 'read') {
  const { data: { user } } = await supabase.auth.getUser()

  const updateData = status === 'delivered' 
    ? { delivered_at: new Date().toISOString() }
    : { read_at: new Date().toISOString() }

  const { error } = await supabase
    .from('message_status')
    .upsert({
      message_id: messageId,
      user_id: user?.id,
      ...updateData,
    })

  if (error) throw error
}