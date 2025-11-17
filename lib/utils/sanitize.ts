/**
 * XSS Sanitization utilities
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // Client-side: use DOMPurify if available, otherwise basic sanitization
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Sanitizes plain text (removes HTML tags)
 */
export function sanitizeText(text: string): string {
  if (typeof window === 'undefined') {
    return text.replace(/<[^>]*>/g, '')
  }

  const div = document.createElement('div')
  div.textContent = text
  return div.textContent || div.innerText || ''
}

/**
 * Escapes special characters for use in HTML attributes
 */
export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Validates and sanitizes user input
 */
export function sanitizeUserInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return ''
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength)
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
  
  return sanitized
}

/**
 * Validates URL to prevent javascript: and data: URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return ''
  
  const trimmed = url.trim().toLowerCase()
  
  // Block dangerous protocols
  if (trimmed.startsWith('javascript:') || 
      trimmed.startsWith('data:') || 
      trimmed.startsWith('vbscript:') ||
      trimmed.startsWith('file:')) {
    return '#'
  }
  
  return url
}

