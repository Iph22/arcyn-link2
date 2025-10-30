'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, File, Image as ImageIcon, Video, Music, FileText, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { uploadFile, formatFileSize } from '@/lib/storage/fileUpload'
import toast from 'react-hot-toast'

interface FileUploaderProps {
  onUploadComplete: (fileData: any) => void
  onClose: () => void
  maxSize?: number // in MB
  accept?: string[]
}

export default function FileUploader({ 
  onUploadComplete, 
  onClose,
  maxSize = 50,
  accept = ['image/*', 'video/*', 'audio/*', 'application/pdf', '.doc', '.docx', '.txt']
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File size must be less than ${maxSize}MB`)
        return
      }
      setSelectedFile(file)
    }
  }, [maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const fileData = await uploadFile(selectedFile)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      toast.success('File uploaded successfully!')
      onUploadComplete(fileData)
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon
    if (type.startsWith('video/')) return Video
    if (type.startsWith('audio/')) return Music
    if (type.includes('pdf') || type.includes('document')) return FileText
    return File
  }

  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : Upload

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-arcyn-surface border border-gold-500/20 rounded-3xl p-8 max-w-lg w-full shadow-gold-glow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Upload File</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gold-500/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Dropzone */}
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-gold-500 bg-gold-500/10'
                : 'border-gold-500/20 hover:border-gold-500/40 hover:bg-gold-500/5'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 text-gold-500 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">
              {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
            </p>
            <p className="text-sm text-gray-400 mb-4">or click to browse</p>
            <p className="text-xs text-gray-500">
              Max file size: {maxSize}MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Preview */}
            <div className="bg-arcyn-bg rounded-2xl p-6 border border-gold-500/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gold-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileIcon className="w-8 h-8 text-gold-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{selectedFile.name}</p>
                  <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>

              {/* Image Preview */}
              {selectedFile.type.startsWith('image/') && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Uploading...</span>
                  <span className="text-gold-500 font-semibold">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-arcyn-bg rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-600"
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
                className="flex-1 px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl text-gray-400 hover:text-white hover:border-gold-500/40 transition-all disabled:opacity-50"
              >
                Change File
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold rounded-xl hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
