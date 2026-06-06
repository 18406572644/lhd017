import type { ExpiryStatus } from '@/types/medicine'

export function calculateExpiryStatus(expiryDate: string): {
  status: ExpiryStatus
  daysLeft: number
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffTime = expiry.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return { status: 'expired', daysLeft }
  } else if (daysLeft <= 30) {
    return { status: 'warning', daysLeft }
  } else {
    return { status: 'normal', daysLeft }
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayString(): string {
  return formatDate(new Date().toISOString())
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatDaysLeft(daysLeft: number): string {
  if (daysLeft < 0) {
    return `已过期 ${Math.abs(daysLeft)} 天`
  } else if (daysLeft === 0) {
    return '今天到期'
  } else if (daysLeft === 1) {
    return '还剩 1 天'
  } else {
    return `还剩 ${daysLeft} 天`
  }
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
