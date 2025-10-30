import { supabase } from '@/lib/supabase/client'

export async function uploadFile(file: File, channelId?: string): Promise<{
  url: string
  name: string
  size: number
  type: string
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${channelId || 'direct'}/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export async function deleteFile(filePath: string) {
  try {
    const { error } = await supabase.storage
      .from('files')
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

export function getFileType(mimeType: string): 'image' | 'video' | 'audio' | 'file' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'file'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
