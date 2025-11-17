'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
    // In production, you'd send this to an error reporting service
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback
        return <Fallback error={this.state.error} resetError={this.resetError} />
      }

      return (
        <div className="min-h-screen bg-arcyn-bg flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-arcyn-border shadow-ios-xl"
          >
            <div className="w-16 h-16 bg-ios-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-ios-red" />
            </div>
            <h1 className="text-2xl font-bold text-ios-gray-900 mb-2">Something went wrong</h1>
            <p className="text-ios-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.resetError}
                className="px-4 py-2 bg-ios-blue text-white font-semibold rounded-xl hover:bg-ios-blue/90 transition-all flex items-center gap-2 shadow-ios-md"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white border border-arcyn-border text-ios-gray-700 font-semibold rounded-xl hover:bg-ios-gray-50 transition-all flex items-center gap-2 shadow-ios-inner"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

