import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getVaultSummary, getVaultPerformance, type VaultSummary, type PerformanceMetric } from '@/lib/predict'

export function VaultSummary() {
  const [vault, setVault] = useState<VaultSummary | null>(null)
  const [perf, setPerf] = useState<PerformanceMetric | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getVaultSummary(), getVaultPerformance()])
      .then(([v, p]) => {
        setVault(v)
        setPerf(p)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load vault'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Vault Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !vault) {
    return (
      <Card>
        <CardHeader><CardTitle>Vault Summary</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error ?? 'No data'}</p>
        </CardContent>
      </Card>
    )
  }

  const utilizationColor =
    vault.vaultUtilization < 20
      ? 'text-green-500'
      : vault.vaultUtilization < 50
        ? 'text-yellow-500'
        : 'text-red-500'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vault Summary</CardTitle>
        <Badge className="bg-blue-600 text-xs">Testnet</Badge>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Total Balance</dt>
            <dd className="font-mono text-lg font-semibold">{vault.totalBalance}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">PLP Supply</dt>
            <dd className="font-mono text-lg font-semibold">{vault.plpSupply}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Max Payout</dt>
            <dd className="font-mono text-base text-yellow-500">{vault.maxPayout}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">MTM Liability</dt>
            <dd className="font-mono text-base">{vault.mtmLiability}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Withdrawal Available</dt>
            <dd className="font-mono text-base text-green-500">{vault.withdrawalAvailable}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Vault Utilization</dt>
            <dd className={`font-mono text-lg font-semibold ${utilizationColor}`}>
              {vault.vaultUtilization.toFixed(1)}%
            </dd>
          </div>
        </dl>
        {perf && (
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Performance</p>
            <dl className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <dt className="text-muted-foreground">Period PnL</dt>
                <dd className="font-mono text-green-500">{perf.periodPnl}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Trades</dt>
                <dd className="font-mono">{perf.tradeCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Win Rate</dt>
                <dd className="font-mono">{perf.winRate.toFixed(1)}%</dd>
              </div>
            </dl>
          </div>
        )}
        <p className="mt-3 text-[10px] text-muted-foreground">
          Vault: {vault.id.slice(0, 18)}...
        </p>
      </CardContent>
    </Card>
  )
}
