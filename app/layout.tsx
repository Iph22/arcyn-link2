import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast-provider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import AuthStateHandler from '@/components/AuthStateHandler'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ProfileProvider } from '@/lib/contexts/ProfileContext'

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ProfileProvider>
            <ErrorBoundary>
              <AuthStateHandler />
              {children}
              <ToastProvider />
            </ErrorBoundary>
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
