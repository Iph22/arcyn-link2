'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#141416',
          color: '#fff',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '12px',
        },
        success: {
          iconTheme: {
            primary: '#F59E0B',
            secondary: '#141416',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#141416',
          },
        },
      }}
    />
  )
}
