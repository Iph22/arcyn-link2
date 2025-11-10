'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Loader2, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/storage/fileUpload'
import toast from 'react-hot-toast'

interface AvatarUploadProps {
  currentAvatarUrl?: string
  userId: string
  onUploadComplete: (url: string) => void
}

export default function AvatarUpload({ currentAvatarUrl, userId, onUploadComplete }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Upload to storage
      const uploadedFile = await uploadFile(file, 'avatars')

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: uploadedFile.url })
        .eq('id', userId)

      if (error) throw error

      toast.success('Avatar updated successfully!')
      onUploadComplete(uploadedFile.url)
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar')
      setPreviewUrl(currentAvatarUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-6">
      {/* Avatar Preview */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-arcyn-bg border-2 border-gold-500/20">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-600" />
            </div>
          )}
        </div>

        {/* Upload Button Overlay */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center shadow-lg hover:bg-gold-600 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 text-black animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-black" />
          )}
        </motion.button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Info */}
      <div>
        <p className="text-sm font-semibold text-white mb-1">Profile Picture</p>
        <p className="text-xs text-gray-400 mb-2">
          JPG, PNG or GIF. Max size 5MB.
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-gold-500 hover:text-gold-400 font-semibold transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Change Avatar'}
        </button>
      </div>
    </div>
  )
}
