'use client'

import { useEffect } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    // This effect is handled in useTheme hook
    // This component just ensures the hook is initialized
  }, [theme, resolvedTheme])

  return <>{children}</>
}

