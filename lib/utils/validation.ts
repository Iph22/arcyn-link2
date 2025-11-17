/**
 * Input validation utilities
 */

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 */
export function isValidPassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters')
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validates username format
 */
export function isValidUsername(username: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters')
  }

  if (username.length > 30) {
    errors.push('Username must be less than 30 characters')
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validates channel name
 */
export function isValidChannelName(name: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (name.length < 2) {
    errors.push('Channel name must be at least 2 characters')
  }

  if (name.length > 50) {
    errors.push('Channel name must be less than 50 characters')
  }

  if (!/^[a-zA-Z0-9\s_-]+$/.test(name)) {
    errors.push('Channel name can only contain letters, numbers, spaces, underscores, and hyphens')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validates file type
 */
export function isValidFileType(
  file: File,
  allowedTypes: string[] = ['image/*', 'video/*', 'audio/*', 'application/pdf']
): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type || file.name.endsWith(type)
  })
}

/**
 * Validates file size
 */
export function isValidFileSize(file: File, maxSizeMB: number = 50): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

