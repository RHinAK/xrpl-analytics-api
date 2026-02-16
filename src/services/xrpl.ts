import { Client, AccountInfoRequest, AccountLinesRequest, AccountTxRequest, GatewayBalancesRequest, ServerInfoRequest, FeeRequest } from 'xrpl'

const XRPL_SERVER = process.env.XRPL_SERVER || 'wss://xrplcluster.com'

let client: Client | null = null

async function getClient(): Promise<Client> {
  if (!client || !client.isConnected()) {
    client = new Client(XRPL_SERVER)
    await client.connect()
  }
  return client
}

export async function getAccountInfo(address: string) {
  const c = await getClient()
  const req: AccountInfoRequest = {
    command: 'account_info',
    account: address,
    ledger_index: 'validated',
  }
  const res = await c.request(req)
  const info = res.result.account_data
  return {
    address: info.Account,
    balance: Number(info.Balance) / 1_000_000,
    balanceDrops: info.Balance,
    sequence: info.Sequence,
    ownerCount: info.OwnerCount,
    flags: info.Flags,
    previousTxnID: info.PreviousTxnID,
  }
}

export async function getAccountTokens(address: string) {
  const c = await getClient()
  const req: AccountLinesRequest = {
    command: 'account_lines',
    account: address,
    ledger_index: 'validated',
  }
  const res = await c.request(req)
  return res.result.lines.map((line) => ({
    currency: line.currency,
    issuer: line.account,
    balance: Number(line.balance),
    limit: Number(line.limit),
    qualityIn: line.quality_in,
    qualityOut: line.quality_out,
    noRipple: line.no_ripple || false,
  }))
}

export async function getAccountTransactions(address: string, limit = 20) {
  const c = await getClient()
  const req: AccountTxRequest = {
    command: 'account_tx',
    account: address,
    limit,
    ledger_index_min: -1,
    ledger_index_max: -1,
  }
  const res = await c.request(req)
  return res.result.transactions.map((tx: any) => ({
    hash: tx.tx?.hash || tx.hash,
    type: tx.tx?.TransactionType,
    date: tx.tx?.date,
    fee: tx.tx?.Fee ? Number(tx.tx.Fee) / 1_000_000 : 0,
    result: tx.meta?.TransactionResult,
    destination: tx.tx?.Destination,
    amount: tx.tx?.Amount,
    ledgerIndex: tx.tx?.ledger_index,
  }))
}

export async function getTokenInfo(currency: string, issuer: string) {
  const c = await getClient()
  const req: GatewayBalancesRequest = {
    command: 'gateway_balances',
    account: issuer,
    ledger_index: 'validated',
  }
  const res = await c.request(req)
  const obligations = (res.result as any).obligations || {}
  const supply = obligations[currency] ? Number(obligations[currency]) : 0

  // Get issuer account info
  const issuerInfo = await getAccountInfo(issuer)

  return {
    currency,
    issuer,
    supply,
    issuerBalance: issuerInfo.balance,
    issuerOwnerCount: issuerInfo.ownerCount,
  }
}

export async function getNetworkStatus() {
  const c = await getClient()
  const req: ServerInfoRequest = { command: 'server_info' }
  const res = await c.request(req)
  const info = res.result.info
  return {
    buildVersion: info.build_version,
    completeLedgers: info.complete_ledgers,
    validatedLedger: info.validated_ledger,
    serverState: info.server_state,
    uptime: info.uptime,
    peerCount: info.peers,
  }
}

export async function getNetworkFee() {
  const c = await getClient()
  const req: FeeRequest = { command: 'fee' }
  const res = await c.request(req)
  const drops = res.result.drops
  return {
    minimumFee: Number(drops.minimum_fee) / 1_000_000,
    medianFee: Number(drops.median_fee) / 1_000_000,
    openLedgerFee: Number(drops.open_ledger_fee) / 1_000_000,
    currentLedger: res.result.current_ledger_size,
    expectedLedger: res.result.expected_ledger_size,
    maxQueueSize: res.result.max_queue_size,
  }
}

export async function calculateWalletScore(address: string): Promise<{
  score: number
  breakdown: Record<string, number>
  tier: string
}> {
  const info = await getAccountInfo(address)
  const tokens = await getAccountTokens(address)
  const txs = await getAccountTransactions(address, 50)

  let score = 0
  const breakdown: Record<string, number> = {}

  // Balance score (0-25)
  const balanceScore = Math.min(25, Math.floor(info.balance / 100))
  breakdown.balance = balanceScore
  score += balanceScore

  // Activity score (0-25) - based on recent transactions
  const activityScore = Math.min(25, txs.length / 2)
  breakdown.activity = activityScore
  score += activityScore

  // Diversity score (0-25) - token holdings
  const diversityScore = Math.min(25, tokens.length * 3)
  breakdown.diversity = diversityScore
  score += diversityScore

  // Owner count score (0-25) - objects owned (trust lines, offers, etc.)
  const ownerScore = Math.min(25, info.ownerCount * 2)
  breakdown.ownerObjects = ownerScore
  score += ownerScore

  const tier = score >= 80 ? 'whale' : score >= 60 ? 'active' : score >= 30 ? 'regular' : 'new'

  return { score: Math.min(100, score), breakdown, tier }
}
