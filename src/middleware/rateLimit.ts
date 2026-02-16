import { Request, Response, NextFunction } from 'express'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const limiter = new RateLimiterMemory({
  points: 100, // requests
  duration: 3600, // per hour
})

export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-api-key'] as string || req.ip || 'unknown'

  try {
    await limiter.consume(key)
    next()
  } catch {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Free tier: 100 requests/hour. Upgrade for higher limits.',
      retryAfter: 3600,
    })
  }
}
