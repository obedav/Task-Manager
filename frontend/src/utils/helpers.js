import { ERROR_MESSAGES, DATE_FORMATS, VALIDATION } from './constants'

/**
 * Parse error from various sources (Error object, API response, string)
 * @param {Error|Object|string} error - The error to parse
 * @returns {string} - Formatted error message
 */
export const parseError = (error) => {
  if (!error) return ERROR_MESSAGES.GENERIC_ERROR

  // If it's already a string
  if (typeof error === 'string') {
    return error
  }

  // If it's an Error object
  if (error instanceof Error) {
    return error.message || ERROR_MESSAGES.GENERIC_ERROR
  }

  // If it's an API response object
  if (error.data && error.data.message) {
    return error.data.message
  }

  if (error.message) {
    return error.message
  }

  // Handle specific HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED
      case 403:
        return ERROR_MESSAGES.FORBIDDEN
      case 404:
        return ERROR_MESSAGES.NOT_FOUND
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR
      case 408:
        return ERROR_MESSAGES.TIMEOUT_ERROR
      default:
        return ERROR_MESSAGES.GENERIC_ERROR
    }
  }

  return ERROR_MESSAGES.GENERIC_ERROR
}

/**
 * Format date to various formats
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = DATE_FORMATS.SHORT) => {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }

  switch (format) {
    case DATE_FORMATS.LONG:
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case DATE_FORMATS.WITH_TIME:
      return d.toLocaleDateString('en-US', {
        ...options,
        hour: '2-digit',
        minute: '2-digit'
      })
    case DATE_FORMATS.ISO:
      return d.toISOString()
    default:
      return d.toLocaleDateString('en-US', options)
  }
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string} date - Date to compare
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const absDiffMs = Math.abs(diffMs)
  
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365

  const isFromNow = diffMs > 0

  if (absDiffMs < minute) {
    return 'just now'
  } else if (absDiffMs < hour) {
    const minutes = Math.floor(absDiffMs / minute)
    return isFromNow ? `in ${minutes} minute${minutes > 1 ? 's' : ''}` : `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (absDiffMs < day) {
    const hours = Math.floor(absDiffMs / hour)
    return isFromNow ? `in ${hours} hour${hours > 1 ? 's' : ''}` : `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (absDiffMs < week) {
    const days = Math.floor(absDiffMs / day)
    return isFromNow ? `in ${days} day${days > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''} ago`
  } else if (absDiffMs < month) {
    const weeks = Math.floor(absDiffMs / week)
    return isFromNow ? `in ${weeks} week${weeks > 1 ? 's' : ''}` : `${weeks} week${weeks > 1 ? 's' : ''} ago`
  } else if (absDiffMs < year) {
    const months = Math.floor(absDiffMs / month)
    return isFromNow ? `in ${months} month${months > 1 ? 's' : ''}` : `${months} month${months > 1 ? 's' : ''} ago`
  } else {
    const years = Math.floor(absDiffMs / year)
    return isFromNow ? `in ${years} year${years > 1 ? 's' : ''}` : `${years} year${years > 1 ? 's' : ''} ago`
  }
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  return VALIDATION.EMAIL_REGEX.test(email.trim())
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with strength score and messages
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      strength: 0,
      messages: ['Password is required']
    }
  }

  const messages = []
  let strength = 0

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    messages.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`)
  } else {
    strength += 1
  }

  if (!/[a-z]/.test(password)) {
    messages.push('Password must contain at least one lowercase letter')
  } else {
    strength += 1
  }

  if (!/[A-Z]/.test(password)) {
    messages.push('Password must contain at least one uppercase letter')
  } else {
    strength += 1
  }

  if (!/\d/.test(password)) {
    messages.push('Password must contain at least one number')
  } else {
    strength += 1
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    messages.push('Password must contain at least one special character')
  } else {
    strength += 1
  }

  return {
    isValid: messages.length === 0,
    strength,
    messages
  }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, wait) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, wait)
    }
  }
}

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} - Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} - Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone(obj[key])
    })
    return clonedObj
  }
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} - Whether object is empty
 */
export const isEmpty = (obj) => {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  return Object.keys(obj).length === 0
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} - File extension
 */
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return ''
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Whether copy was successful
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback method
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after timeout
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with function result
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries) {
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, i)
      await sleep(delay)
    }
  }
}