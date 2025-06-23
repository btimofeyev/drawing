/**
 * Timezone utilities for Daily Scribble
 * Handles Eastern Time (ET) for consistent daily cycles
 */

// Daily Scribble operates on Eastern Time (UTC-4/-5 depending on DST)
const TIMEZONE = 'America/New_York'

/**
 * Get current date in Eastern Time
 * Returns YYYY-MM-DD format
 */
export function getCurrentDateET(): string {
  const now = new Date()
  const etDate = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }))
  
  const year = etDate.getFullYear()
  const month = String(etDate.getMonth() + 1).padStart(2, '0')
  const day = String(etDate.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Get date for a specific offset from today in Eastern Time
 * @param offsetDays - Number of days to offset (negative for past, positive for future)
 */
export function getDateET(offsetDays: number = 0): string {
  const now = new Date()
  const etDate = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }))
  
  etDate.setDate(etDate.getDate() + offsetDays)
  
  const year = etDate.getFullYear()
  const month = String(etDate.getMonth() + 1).padStart(2, '0')
  const day = String(etDate.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Get start and end of day in Eastern Time as UTC ISO strings
 * Useful for database queries that need UTC timestamps
 */
export function getDayBoundsET(date?: string): { start: string; end: string } {
  const targetDate = date || getCurrentDateET()
  
  // Create start of day in ET
  const startET = new Date(`${targetDate}T00:00:00`)
  const startUTC = new Date(startET.toLocaleString('en-US', { timeZone: 'UTC' }))
  
  // Create end of day in ET  
  const endET = new Date(`${targetDate}T23:59:59.999`)
  const endUTC = new Date(endET.toLocaleString('en-US', { timeZone: 'UTC' }))
  
  return {
    start: startUTC.toISOString(),
    end: endUTC.toISOString()
  }
}

/**
 * Check if a UTC timestamp falls on a specific Eastern Time date
 */
export function isOnDateET(utcTimestamp: string, etDate: string): boolean {
  const utcDate = new Date(utcTimestamp)
  const etDateTime = utcDate.toLocaleDateString('en-CA', { timeZone: TIMEZONE })
  return etDateTime === etDate
}

/**
 * Convert UTC timestamp to Eastern Time date string
 */
export function utcToDateET(utcTimestamp: string): string {
  const utcDate = new Date(utcTimestamp)
  return utcDate.toLocaleDateString('en-CA', { timeZone: TIMEZONE })
}

/**
 * Get Eastern Time zone offset in minutes
 */
export function getETOffset(): number {
  const now = new Date()
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
  const et = new Date(utc.toLocaleString('en-US', { timeZone: TIMEZONE }))
  
  return Math.round((et.getTime() - utc.getTime()) / 60000)
}

/**
 * Check if two dates are consecutive in Eastern Time
 * Useful for streak calculations
 */
export function areConsecutiveDatesET(date1: string, date2: string): boolean {
  const d1 = new Date(`${date1}T12:00:00`)
  const d2 = new Date(`${date2}T12:00:00`)
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays === 1
}

/**
 * Get array of dates for a streak calculation
 * Returns dates in reverse chronological order (newest first)
 */
export function getStreakDatesET(startDate: string, days: number): string[] {
  const dates: string[] = []
  const baseDate = new Date(`${startDate}T12:00:00`)
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - i)
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    dates.push(`${year}-${month}-${day}`)
  }
  
  return dates
}