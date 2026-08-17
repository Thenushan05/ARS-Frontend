import { clsx } from 'clsx'

/** Thin wrapper around clsx so class-merging has one canonical import site. */
export function cn(...inputs) {
  return clsx(...inputs)
}
