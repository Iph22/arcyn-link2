'use client'

import { User } from 'lucide-react'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-32 h-32 text-5xl',
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size]
  const initials = name ? name.charAt(0).toUpperCase() : '?'

  // Check if className overrides the shape (e.g., rounded-3xl)
  const isRounded = className.includes('rounded-3xl') || className.includes('rounded-xl')
  const shapeClass = isRounded ? '' : 'rounded-full'

  return (
    <div className={`${sizeClass} ${shapeClass} overflow-hidden bg-gradient-to-br from-ios-blue to-ios-blue-light flex items-center justify-center text-white font-bold ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = `<span class="flex items-center justify-center w-full h-full">${initials}</span>`
            }
          }}
        />
      ) : (
        <span className="flex items-center justify-center w-full h-full">
          {name ? initials : <User className="w-1/2 h-1/2" />}
        </span>
      )}
    </div>
  )
}

