import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { walletRoutes } from './routes/wallet'
import { tokenRoutes } from './routes/token'
import { networkRoutes } from './routes/network'
import { apiKeyMiddleware } from './middleware/auth'
import { rateLimiter } from './middleware/rateLimit'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(express.json())

// Public routes
app.get('/', (_req, res) => {
  res.json({
    name: 'XRPL Analytics API',
    version: '1.0.0',
    docs: '/docs',
    endpoints: {
      wallet: '/api/v1/wallet/:address',
      walletScore: '/api/v1/wallet/:address/score',
      walletTokens: '/api/v1/wallet/:address/tokens',
      walletTransactions: '/api/v1/wallet/:address/transactions',
      tokenInfo: '/api/v1/token/:currency/:issuer',
      tokenHolders: '/api/v1/token/:currency/:issuer/holders',
      networkStatus: '/api/v1/network/status',
      networkFee: '/api/v1/network/fee',
      whales: '/api/v1/network/whales',
    },
  })
})

app.get('/docs', (_req, res) => {
  res.json({
    title: 'XRPL Analytics API Documentation',
    base_url: 'https://api.xrplanalytics.com/api/v1',
    authentication: 'API key via X-API-Key header or ?api_key= query parameter',
    rate_limits: {
      free: '100 requests/hour',
      pro: '10,000 requests/hour',
      enterprise: 'Unlimited',
    },
    endpoints: [
      {
        method: 'GET',
        path: '/wallet/:address',
        description: 'Get wallet info: balance, sequence, flags, settings',
      },
      {
        method: 'GET',
        path: '/wallet/:address/score',
        description: 'Wallet trust score (0-100) based on age, activity, balance, connections',
      },
      {
        method: 'GET',
        path: '/wallet/:address/tokens',
        description: 'List all tokens held by wallet with balances and trust lines',
      },
      {
        method: 'GET',
        path: '/wallet/:address/transactions',
        description: 'Recent transactions with parsed metadata. Query: ?limit=20&type=Payment',
      },
      {
        method: 'GET',
        path: '/token/:currency/:issuer',
        description: 'Token metadata: supply, holder count, trust line count, issuer info',
      },
      {
        method: 'GET',
        path: '/token/:currency/:issuer/holders',
        description: 'Top token holders with balances. Query: ?limit=100',
      },
      {
        method: 'GET',
        path: '/network/status',
        description: 'XRPL network status: ledger index, close time, validation quorum',
      },
      {
        method: 'GET',
        path: '/network/fee',
        description: 'Current transaction fees: minimum, median, open ledger',
      },
      {
        method: 'GET',
        path: '/network/whales',
        description: 'Top XRP holders by balance. Query: ?limit=50',
      },
    ],
  })
})

// API routes (authenticated + rate limited)
app.use('/api/v1/wallet', rateLimiter, apiKeyMiddleware, walletRoutes)
app.use('/api/v1/token', rateLimiter, apiKeyMiddleware, tokenRoutes)
app.use('/api/v1/network', rateLimiter, apiKeyMiddleware, networkRoutes)

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err.message)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

app.listen(PORT, () => {
  console.log(`🔍 XRPL Analytics API running on port ${PORT}`)
})

export default app
