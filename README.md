# 🔍 XRPL Analytics API

Real-time analytics for the XRP Ledger. Wallet scoring, token metrics, network stats, and whale tracking.

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/wallet/:address` | Wallet info (balance, sequence, flags) |
| `GET /api/v1/wallet/:address/score` | Trust score 0-100 (balance, activity, diversity) |
| `GET /api/v1/wallet/:address/tokens` | All tokens held with trust line details |
| `GET /api/v1/wallet/:address/transactions` | Recent transactions with parsed metadata |
| `GET /api/v1/token/:currency/:issuer` | Token supply, issuer info |
| `GET /api/v1/token/:currency/:issuer/holders` | Top holders (Pro plan) |
| `GET /api/v1/network/status` | Ledger status, validation quorum |
| `GET /api/v1/network/fee` | Current transaction fees |
| `GET /api/v1/network/whales` | Known large XRP holders |

## Authentication

Include API key as `X-API-Key` header or `?api_key=` query parameter.

## Rate Limits

| Tier | Limit |
|------|-------|
| Free | 100 req/hr |
| Pro ($29/mo) | 10,000 req/hr |
| Enterprise | Unlimited |

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
# Test: curl localhost:3001/api/v1/wallet/rN7n3473SaZBCG4dFL83w7p1W9cgPBKpao?api_key=demo-key-free
```

## Tech Stack

- Express + TypeScript
- xrpl.js (XRPL WebSocket SDK)
- Rate limiting via rate-limiter-flexible
- Helmet for security headers

## Deploy

Works on any Node.js host: Railway, Render, Fly.io, AWS, etc.

© 2026 StackStats Apps LLC
