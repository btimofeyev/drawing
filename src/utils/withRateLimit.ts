import { NextRequest, NextResponse } from 'next/server'
import { getClientIdentifier } from '@/lib/rateLimiter'

interface RateLimiter {
  check(identifier: string): {
    allowed: boolean
    limit: number
    remaining: number
    resetTime: number
  }
}

/**
 * Higher-order function to add rate limiting to API routes
 */
export function withRateLimit(rateLimiter: RateLimiter) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const identifier = getClientIdentifier(request)
      const result = rateLimiter.check(identifier)
      
      // Add rate limit headers
      const headers = new Headers()
      headers.set('X-RateLimit-Limit', result.limit.toString())
      headers.set('X-RateLimit-Remaining', result.remaining.toString())
      headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
      
      if (!result.allowed) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
        headers.set('Retry-After', retryAfter.toString())
        
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded', 
            retryAfter,
            message: 'Too many requests. Please try again later.'
          },
          { 
            status: 429,
            headers 
          }
        )
      }
      
      // Rate limit passed, call the original handler
      const response = await handler(request, ...args)
      
      // Add rate limit headers to successful response
      for (const [key, value] of headers.entries()) {
        response.headers.set(key, value)
      }
      
      return response
    }
  }
}