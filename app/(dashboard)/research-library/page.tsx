'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, Search, Download, Trash2, Eye, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import { uploadFile, formatFileSize } from '@/lib/storage/fileUpload'
import { analyzeDocument } from '@/lib/ai/claude'
import { isValidFileType, isValidFileSize } from '@/lib/utils/validation'
import FileUploader from '@/components/files/FileUploader'
import toast from 'react-hot-toast'

export default function ResearchLibraryPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploader, setShowUploader] = useState(false)
  const [analyzingDoc, setAnalyzingDoc] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setDocuments(data)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading documents:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(fileData: any) {
    try {
      const user = await getCurrentUser()
      if (!user) return

      // File is already uploaded by FileUploader component
      const uploadedFile = fileData

      // Save document metadata to database
      const { error } = await supabase
        .from('documents')
        .insert({
          title: file.name,
          file_url: uploadedFile.url,
          file_type: uploadedFile.type,
          file_size: uploadedFile.size,
          uploaded_by: user.id,
        })

      if (error) throw error

      toast.success('Document uploaded!')
      loadDocuments()
      setShowUploader(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document')
    }
  }

  async function handleAnalyze(doc: any) {
    setAnalyzingDoc(doc.id)
    try {
      const analysis = await analyzeDocument(doc.file_url)
      
      // Update document with analysis
      await supabase
        .from('documents')
        .update({ 
          ai_summary: analysis 
        })
        .eq('id', doc.id)

      toast.success('Document analyzed!')
      loadDocuments()
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze document')
    } finally {
      setAnalyzingDoc(null)
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId)

      if (error) throw error

      toast.success('Document deleted')
      loadDocuments()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document')
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-display font-bold text-white mb-2">Research Library</h1>
            <p className="text-gray-400">Manage and analyze your documents with AI</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploader(true)}
            className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold rounded-xl hover:shadow-gold-glow transition-all flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Document
          </motion.button>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-arcyn-surface border border-gold-500/20 rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 text-white placeholder-gray-500 transition-all"
          />
        </motion.div>
      </div>

      {/* Documents Grid */}
      <div className="max-w-6xl mx-auto">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No documents found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? 'Try a different search term' : 'Upload your first document to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowUploader(true)}
                className="px-6 py-3 bg-gold-500/20 text-gold-500 font-semibold rounded-xl hover:bg-gold-500/30 transition-all"
              >
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-arcyn-surface rounded-2xl border border-gold-500/20 p-6 hover:border-gold-500/40 transition-all"
              >
                {/* Document Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>

                {/* Document Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-2 truncate">{doc.title}</h3>
                  <p className="text-sm text-gray-400">{formatFileSize(doc.file_size)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* AI Summary */}
                {doc.ai_summary && (
                  <div className="mb-4 p-3 bg-arcyn-bg rounded-lg border border-gold-500/10">
                    <p className="text-xs text-gray-400 line-clamp-3">{doc.ai_summary}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="flex-1 px-3 py-2 bg-arcyn-bg border border-gold-500/20 rounded-lg text-gray-400 hover:text-white hover:border-gold-500/40 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleAnalyze(doc)}
                    disabled={analyzingDoc === doc.id}
                    className="flex-1 px-3 py-2 bg-gold-500/20 border border-gold-500/40 rounded-lg text-gold-500 hover:bg-gold-500/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {analyzingDoc === doc.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-3 py-2 bg-arcyn-bg border border-red-500/20 rounded-lg text-red-400 hover:border-red-500/40 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-arcyn-surface rounded-3xl border border-gold-500/20 p-8 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-white">Upload Document</h2>
              <button
                onClick={() => setShowUploader(false)}
                className="p-2 hover:bg-arcyn-bg rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <FileUploader
              onUploadComplete={handleFileUpload}
              onClose={() => setShowUploader(false)}
              maxSize={50} // 50MB
            />
          </motion.div>
        </div>
      )}
    </div>
  )
}
