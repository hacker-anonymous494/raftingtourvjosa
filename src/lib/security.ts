/**
 * Frontend security utilities.
 * NOTE: These are client-side helpers only.
 * All critical security enforcement happens on the backend (Edge Functions).
 */

/** Strip HTML tags and dangerous characters from user input */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
  return re.test(email)
}

/** Validate phone (international) */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().+]/g, '')
  return /^\d{7,15}$/.test(cleaned)
}

/** Generate a nonce for CSP */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

/** Rate-limit guard (client-side, per session — server enforces hard limits) */
const rateLimitMap = new Map<string, number[]>()

export function checkClientRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(key) ?? []
  const recent = timestamps.filter(t => now - t < windowMs)
  if (recent.length >= maxRequests) return false
  recent.push(now)
  rateLimitMap.set(key, recent)
  return true
}

/** Mask email for display */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***@***.***'
  const masked = local.slice(0, 2) + '***'
  return `${masked}@${domain}`
}

/** Format currency */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format date */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

/** Get min booking date (tomorrow) */
export function getMinBookingDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

/** Get max booking date (6 months ahead) */
export function getMaxBookingDate(): string {
  const max = new Date()
  max.setMonth(max.getMonth() + 6)
  return max.toISOString().split('T')[0]
}