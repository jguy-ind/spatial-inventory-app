import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Space } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Display: "Office " + office number; use trailing digits from code if present (e.g. LAXGLE003 → "Office 3"). */
export function getOfficeDisplayLabel(space: Space): string {
  const value = space.officeNumber ?? space.name ?? space.id
  if (!value) return 'Office'
  const trailingDigits = value.match(/\d+$/)
  const numberPart = trailingDigits ? String(parseInt(trailingDigits[0], 10)) : value
  return `Office ${numberPart}`
}
