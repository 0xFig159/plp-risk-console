// ─── DeepBook Predict API helpers ───────────────────────────────────────
// MVP uses testnet public endpoints. All data is read-only (no PTB).

// ─── Real Chain Transactions ────────────────────────────────────────────
// These are real Sui Testnet transactions for the PLPRiskConsole contract.
export const CHAIN_CONFIG = {
  packageId: "0xdda63496bc8031bd7521f196d1091330be084ff4974b18e6e5a6603b5bf12125",
  moduleName: "risk_oracle",
  /** Contract publish transaction digest */
  publishDigest: "5sv7BfD93CWRFLbkiqAoFN7dTt9HC2sH786iEXGGdaTV",
  /** record_snapshot() call — recorded a test risk snapshot blob reference */
  recordSnapshotDigest: "Gw3st2YjYxaxLLFNBDtftshGVGDejD7jPbi6csmxa7X6",
}

export interface VaultSummary {
  id: string
  totalBalance: string
  plpSupply: string
  maxPayout: string
  mtmLiability: string
  withdrawalAvailable: string
  vaultUtilization: number
}

export interface OracleState {
  pair: string
  price: string
  timestamp: number
  isActive: boolean
}

export interface PerformanceMetric {
  periodPnl: string
  totalPnl: string
  tradeCount: number
  winRate: number
}

// ─── DeepBook Predict testnet endpoints ─────────────────────────────────
const PREDICT_API = 'https://predict-server.testnet.mystenlabs.com'
const DEFAULT_VAULT_ID = '0x934f173a0e2c452321a4181d85d450a528d291027a34069cf2a76401edf7872c'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Predict API ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function getVaultSummary(vaultId?: string): Promise<VaultSummary> {
  const id = vaultId ?? DEFAULT_VAULT_ID
  // ponytail: mock fallback when API unavailable (testnet sparse)
  try {
    const data = await fetchJson<any>(`${PREDICT_API}/vault/${id}/summary`)
    return {
      id,
      totalBalance: data.totalBalance ?? '1,234,567 USDC',
      plpSupply: data.plpSupply ?? '987,654 PLP',
      maxPayout: data.maxPayout ?? '250,000 USDC',
      mtmLiability: data.mtmLiability ?? '180,000 USDC',
      withdrawalAvailable: data.withdrawalAvailable ?? '890,000 USDC',
      vaultUtilization: data.vaultUtilization ?? 14.6,
    }
  } catch {
    // fallback demo data
    return {
      id,
      totalBalance: '1,234,567 USDC',
      plpSupply: '987,654 PLP',
      maxPayout: '250,000 USDC',
      mtmLiability: '180,000 USDC',
      withdrawalAvailable: '890,000 USDC',
      vaultUtilization: 14.6,
    }
  }
}

export async function getOracleState(): Promise<OracleState[]> {
  try {
    const data = await fetchJson<any>(`${PREDICT_API}/oracles`)
    return (data.oracles ?? []).map((o: any) => ({
      pair: o.pair ?? 'BTC/USD',
      price: o.price ?? '67,890.12',
      timestamp: o.timestamp ?? Date.now(),
      isActive: o.isActive ?? true,
    }))
  } catch {
    return [
      { pair: 'BTC/USD', price: '67,890.12', timestamp: Date.now(), isActive: true },
      { pair: 'ETH/USD', price: '3,456.78', timestamp: Date.now(), isActive: true },
      { pair: 'SUI/USD', price: '2.01', timestamp: Date.now(), isActive: true },
    ]
  }
}

export async function getVaultPerformance(): Promise<PerformanceMetric> {
  try {
    const data = await fetchJson<any>(`${PREDICT_API}/vault/${DEFAULT_VAULT_ID}/performance`)
    return {
      periodPnl: data.periodPnl ?? '+12,345 USDC',
      totalPnl: data.totalPnl ?? '+98,765 USDC',
      tradeCount: data.tradeCount ?? 342,
      winRate: data.winRate ?? 67.8,
    }
  } catch {
    return {
      periodPnl: '+12,345 USDC',
      totalPnl: '+98,765 USDC',
      tradeCount: 342,
      winRate: 67.8,
    }
  }
}

// ─── BTC scenario simulation ────────────────────────────────────────────

export interface ScenarioResult {
  btcPrice: number
  payout: number
  isStress: boolean
  description: string
}

export function simulateBtcScenario(
  currentPrice: number,
  vaultBalance: number,
  maxPayout: number,
): ScenarioResult[] {
  const scenarios: ScenarioResult[] = []
  const steps = [-40, -30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 30, 40]

  // ponytail: simplified convex payout model — small moves absorbed by vault liquidity,
  // large moves hit max payout. Leverage ~2x reflects Predict vault position sizing.
  const leverage = 2.0
  const absorptionZone = 0.03 // 3% price move fully absorbed

  for (const pct of steps) {
    const simulatedPrice = currentPrice * (1 + pct / 100)
    const absPct = Math.abs(pct) / 100

    // payout ramps beyond the absorption zone, up to maxPayout
    let payoutFraction = 0
    if (absPct > absorptionZone) {
      const excess = absPct - absorptionZone
      // sigmoid-like ramp: steep at first, plateau at max
      const raw = excess * leverage * 0.5
      payoutFraction = Math.min(raw, 0.2) // cap at 20% of vault balance
    }

    const payout = vaultBalance * payoutFraction
    const capped = Math.min(Math.round(payout), maxPayout)

    scenarios.push({
      btcPrice: Math.round(simulatedPrice * 100) / 100,
      payout: capped,
      isStress: Math.abs(pct) >= 20,
      description: `${pct > 0 ? '+' : ''}${pct}%`,
    })
  }

  return scenarios
}

// ─── Walrus blob upload ─────────────────────────────────────────────────

const WALRUS_PUBLISHER = 'https://publisher.testnet.walrus.io'

export interface WalrusBlob {
  blobId: string
  suiRef: string
  url: string
}

export async function uploadToWalrus(
  content: string,
  filename: string,
): Promise<WalrusBlob | null> {
  try {
    const blob = new Blob([content], { type: 'application/json' })
    const res = await fetch(`${WALRUS_PUBLISHER}/v1/blobs`, {
      method: 'PUT',
      body: blob,
    })
    if (!res.ok) throw new Error(`Walrus upload failed: ${res.status}`)
    const data = await res.json()
    const blobId: string = data.blobId ?? data.newlyCreated?.blobObject?.blobId ?? ''
    return {
      blobId,
      suiRef: data.suiRef ?? '',
      url: `https://testnet.walrus.site/v1/blobs/${blobId}`,
    }
  } catch (err) {
    console.warn('Walrus upload failed:', err)
    return null
  }
}
