import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validateProfileForm,
  validateSecurityForm
} from '../utils/validation'

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('a.b+c@sub.domain.io')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('notanemail')).toBe(false)
    expect(validateEmail('@missing-local.com')).toBe(false)
  })
})

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    const result = validatePassword('MyStr0ng!Pass')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a password shorter than 12 characters', () => {
    const result = validatePassword('Short1!')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('12'))).toBe(true)
  })

  it('rejects a password missing uppercase', () => {
    const result = validatePassword('alllower123!abc')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('uppercase'))).toBe(true)
  })

  it('rejects a password missing a number', () => {
    const result = validatePassword('NoNumbers!Here')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('number'))).toBe(true)
  })

  it('rejects a password missing a special character', () => {
    const result = validatePassword('NoSpecialChar123')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('special'))).toBe(true)
  })

  it('returns an error for empty input', () => {
    const result = validatePassword('')
    expect(result.isValid).toBe(false)
  })
})

describe('validateProfileForm', () => {
  const valid = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' }

  it('passes a valid form', () => {
    expect(validateProfileForm(valid).isValid).toBe(true)
  })

  it('fails when firstName is missing', () => {
    const result = validateProfileForm({ ...valid, firstName: '' })
    expect(result.isValid).toBe(false)
    expect(result.errors.firstName).toBeTruthy()
  })

  it('fails when email is invalid', () => {
    const result = validateProfileForm({ ...valid, email: 'bad-email' })
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBeTruthy()
  })
})

describe('validateSecurityForm', () => {
  const valid = {
    currentPassword: 'OldPass!23456',
    newPassword: 'NewStr0ng!Pass',
    confirmPassword: 'NewStr0ng!Pass'
  }

  it('passes a valid form', () => {
    expect(validateSecurityForm(valid).isValid).toBe(true)
  })

  it('fails when passwords do not match', () => {
    const result = validateSecurityForm({ ...valid, confirmPassword: 'Mismatch1!' })
    expect(result.isValid).toBe(false)
    expect(result.errors.confirmPassword).toMatch(/match/)
  })

  it('fails when currentPassword is empty', () => {
    const result = validateSecurityForm({ ...valid, currentPassword: '' })
    expect(result.isValid).toBe(false)
    expect(result.errors.currentPassword).toBeTruthy()
  })
})
