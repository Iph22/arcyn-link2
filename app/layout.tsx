import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast-provider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import AuthStateHandler from '@/components/AuthStateHandler'

export const metadata: Metadata = {
  title: 'Arcyn Link - Accelerating AI Evolution in Africa',
  description: 'Revolutionary cross-platform collaboration platform for Arcyn workers',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AuthStateHandler />
          {children}
          <ToastProvider />
        </ErrorBoundary>
      </body>
    </html>
  )
}
