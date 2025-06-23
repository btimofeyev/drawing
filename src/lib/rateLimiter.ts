/**
 * Rate limiting implementation using in-memory storage
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  
  constructor(private config: RateLimitConfig) {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }

  check(identifier: string): { allowed: boolean; limit: number; remaining: number; resetTime: number } {
    const now = Date.now()
    const resetTime = now + this.config.windowMs
    
    let entry = this.store.get(identifier)
    
    if (!entry || entry.resetTime <= now) {
      // First request or window expired, reset
      entry = { count: 1, resetTime }
      this.store.set(identifier, entry)
      
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime
      }
    }
    
    // Increment request count
    entry.count++
    
    const allowed = entry.count <= this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - entry.count)
    
    return {
      allowed,
      limit: this.config.maxRequests,
      remaining,
      resetTime: entry.resetTime
    }
  }
}

// Create rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts per 15 minutes
})

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3 // 3 uploads per minute
})

export const generalRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute
})

export const likeRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30 // 30 likes per minute
})

// Helper function to get client identifier (IP + User Agent hash)
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Simple hash function for user agent
  let hash = 0
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return `${ip}:${hash}`
}