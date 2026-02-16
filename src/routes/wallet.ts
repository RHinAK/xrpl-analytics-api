import { Router } from 'express'
import { getAccountInfo, getAccountTokens, getAccountTransactions, calculateWalletScore } from '../services/xrpl'

export const walletRoutes = Router()

walletRoutes.get('/:address', async (req, res) => {
  try {
    const info = await getAccountInfo(req.params.address)
    res.json({ success: true, data: info })
  } catch (err: any) {
    const status = err.data?.error === 'actNotFound' ? 404 : 500
    res.status(status).json({ success: false, error: err.message || 'Failed to fetch wallet' })
  }
})

walletRoutes.get('/:address/score', async (req, res) => {
  try {
    const score = await calculateWalletScore(req.params.address)
    res.json({ success: true, data: { address: req.params.address, ...score } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

walletRoutes.get('/:address/tokens', async (req, res) => {
  try {
    const tokens = await getAccountTokens(req.params.address)
    res.json({ success: true, data: { address: req.params.address, count: tokens.length, tokens } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

walletRoutes.get('/:address/transactions', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const txs = await getAccountTransactions(req.params.address, limit)
    res.json({ success: true, data: { address: req.params.address, count: txs.length, transactions: txs } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})
