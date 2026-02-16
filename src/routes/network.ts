import { Router } from 'express'
import { getNetworkStatus, getNetworkFee } from '../services/xrpl'

export const networkRoutes = Router()

networkRoutes.get('/status', async (_req, res) => {
  try {
    const status = await getNetworkStatus()
    res.json({ success: true, data: status })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

networkRoutes.get('/fee', async (_req, res) => {
  try {
    const fee = await getNetworkFee()
    res.json({ success: true, data: fee })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

networkRoutes.get('/whales', async (_req, res) => {
  // Whale tracking would need a database of known large holders
  // For now, return a note about the feature
  res.json({
    success: true,
    data: {
      note: 'Whale tracking requires continuous indexing. Available on Pro plan.',
      knownExchanges: [
        { name: 'Binance', address: 'rEy8TFcrAPvhpKrwyrscNYyqBGUkE9hKaJ' },
        { name: 'Bitstamp', address: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
        { name: 'Kraken', address: 'rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh' },
        { name: 'Upbit', address: 'rPVMhWBsfF9iMXYj3aAzJVkqHDfFgKJ1a5' },
      ],
    },
  })
})
