import { Request, Response, NextFunction } from 'express'

// Simple API key auth - in production, check against database
const VALID_API_KEYS = new Set(
  (process.env.API_KEYS || 'demo-key-free').split(',').map((k) => k.trim())
)

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string || req.query.api_key as string

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Include X-API-Key header or ?api_key= query parameter',
    })
  }

  if (!VALID_API_KEYS.has(apiKey)) {
    return res.status(403).json({ error: 'Invalid API key' })
  }

  next()
}
