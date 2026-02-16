import { Router } from 'express'
import { getTokenInfo } from '../services/xrpl'

export const tokenRoutes = Router()

tokenRoutes.get('/:currency/:issuer', async (req, res) => {
  try {
    const info = await getTokenInfo(req.params.currency, req.params.issuer)
    res.json({ success: true, data: info })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

tokenRoutes.get('/:currency/:issuer/holders', async (req, res) => {
  // This would require iterating trust lines - simplified version
  try {
    const info = await getTokenInfo(req.params.currency, req.params.issuer)
    res.json({
      success: true,
      data: {
        currency: req.params.currency,
        issuer: req.params.issuer,
        totalSupply: info.supply,
        note: 'Full holder enumeration available on Pro plan',
      },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})
