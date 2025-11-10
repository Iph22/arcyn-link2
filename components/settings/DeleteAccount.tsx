'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DeleteAccount() {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    setDeleting(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Delete user profile (cascade will handle related data)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) throw profileError

      // Sign out
      await supabase.auth.signOut()

      toast.success('Account deleted successfully')
      router.push('/signin')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-red-500/10 rounded-2xl border border-red-500/20 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Danger Zone</h3>
            <p className="text-sm text-gray-400">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowConfirmModal(true)}
          className="w-full px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 font-semibold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Delete Account
        </motion.button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-arcyn-surface rounded-3xl border border-red-500/20 p-8 max-w-md w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Delete Account</h2>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-2 hover:bg-arcyn-bg rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Warning */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-400 font-semibold mb-2">
                  ⚠️ This action cannot be undone!
                </p>
                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                  <li>All your messages will be deleted</li>
                  <li>You will be removed from all channels</li>
                  <li>Your profile and data will be permanently erased</li>
                  <li>You cannot recover your account after deletion</li>
                </ul>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Type <span className="text-red-400 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 bg-arcyn-bg border border-red-500/20 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder-gray-500 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-arcyn-bg border border-gold-500/20 rounded-xl text-gray-400 font-semibold hover:text-white hover:border-gold-500/40 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || confirmText !== 'DELETE'}
                  className="flex-1 px-4 py-3 bg-red-500 rounded-xl text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
