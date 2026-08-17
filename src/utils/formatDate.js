import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

function toDate(value) {
  if (!value) return null
  const date = typeof value === 'string' ? parseISO(value) : new Date(value)
  return isValid(date) ? date : null
}

export function formatDate(value, pattern = 'dd MMM yyyy') {
  const date = toDate(value)
  return date ? format(date, pattern) : '—'
}

export function formatDateTime(value) {
  return formatDate(value, 'dd MMM yyyy, hh:mm a')
}

export function formatRelative(value) {
  const date = toDate(value)
  return date ? formatDistanceToNow(date, { addSuffix: true }) : '—'
}
