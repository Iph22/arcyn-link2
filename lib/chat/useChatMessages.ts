import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import type { Message } from '@/lib/supabase/client'

export function useChatMessages(channelId?: string, conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel: RealtimeChannel

    async function fetchMessages() {
      const query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(*),
          reactions:message_reactions(*),
          reply_to:messages(*)
        `)
        .order('created_at', { ascending: true })

      if (channelId) {
        query.eq('channel_id', channelId)
      } else if (conversationId) {
        query.eq('conversation_id', conversationId)
      }

      const { data, error } = await query

      if (!error && data) {
        setMessages(data)
      }
      setLoading(false)
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
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
            )
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
          }
        }
      )
      .subscribe()

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
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      content,
      message_type: messageType,
      sender_id: user?.id,
      channel_id: channelId,
      conversation_id: conversationId,
      file_url: fileUrl,
      reply_to_id: replyToId,
    })
    .select()
    .single()

  if (error) throw error
  
  // Log activity
  await supabase.from('activity_log').insert({
    user_id: user?.id,
    activity_type: 'message',
    points_earned: 1,
  })
  
  return data
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

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      content: originalMessage.content,
      message_type: originalMessage.message_type,
      sender_id: user?.id,
      channel_id: targetChannelId,
      conversation_id: targetConversationId,
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
