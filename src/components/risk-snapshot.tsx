import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { uploadToWalrus, type VaultSummary, type OracleState, type PerformanceMetric } from '@/lib/predict'
// ponytail: simple export, no heavy lib needed

interface RiskSnapshotProps {
  vault: VaultSummary | null
  oracles: OracleState[]
  perf: PerformanceMetric | null
  btcScenario?: string
}

export function RiskSnapshot({ vault, oracles, perf, btcScenario }: RiskSnapshotProps) {
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<{
    json: string
    markdown: string
    walrus: { blobId: string; url: string } | null
  } | null>(null)

  async function handleExport() {
    setExporting(true)
    setResult(null)

    const snapshot = {
      timestamp: new Date().toISOString(),
      vault: vault
        ? {
            id: vault.id,
            totalBalance: vault.totalBalance,
            plpSupply: vault.plpSupply,
            maxPayout: vault.maxPayout,
            mtmLiability: vault.mtmLiability,
            withdrawalAvailable: vault.withdrawalAvailable,
            vaultUtilization: vault.vaultUtilization,
          }
        : null,
      performance: perf
        ? {
            periodPnl: perf.periodPnl,
            totalPnl: perf.totalPnl,
            tradeCount: perf.tradeCount,
            winRate: perf.winRate,
          }
        : null,
      oracles: oracles.map((o) => ({
        pair: o.pair,
        price: o.price,
        timestamp: o.timestamp,
        isActive: o.isActive,
      })),
      btcScenario: btcScenario ?? null,
      disclaimer:
        'This risk snapshot is for informational purposes only. Not financial advice.',
    }

    const markdown = generateMarkdown(snapshot)
    const json = JSON.stringify(snapshot, null, 2)

    // ponytail: Walrus upload is best-effort
    const walrus = await uploadToWalrus(json, `risk-snapshot-${Date.now()}.json`)

    setResult({ json, markdown, walrus })
    setExporting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Snapshot Export</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Export current vault risk state as a verifiable snapshot. Optionally
          anchor to Walrus for verifiable storage.
        </p>

        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : '📸 Export Risk Snapshot'}
        </Button>

        {result && (
          <div className="mt-4 space-y-3">
            {result.walrus && (
              <div className="rounded-lg border border-green-600/30 bg-green-600/10 p-3">
                <p className="mb-1 text-xs font-medium text-green-500">
                  ✓ Uploaded to Walrus
                </p>
                <p className="font-mono text-xs text-muted-foreground break-all">
                  Blob ID: {result.walrus.blobId}
                </p>
                <a
                  href={result.walrus.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-blue-500 underline"
                >
                  View on Walrus
                </a>
              </div>
            )}

            {!result.walrus && (
              <Badge className="bg-yellow-600">Not uploaded to Walrus</Badge>
            )}

            <details className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                Preview JSON ({result.json.length.toLocaleString()} bytes)
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-2 text-[10px]">
                {result.json.slice(0, 2000)}
                {result.json.length > 2000 ? '...' : ''}
              </pre>
            </details>

            <details className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                Markdown Report
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-2 text-[10px] whitespace-pre-wrap">
                {result.markdown}
              </pre>
            </details>

            <Button
              onClick={() => {
                const blob = new Blob([result.json], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `risk-snapshot-${Date.now()}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="w-full"
            >
              Download JSON
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function generateMarkdown(snapshot: any): string {
  const lines = [
    `# PLP Risk Snapshot`,
    ``,
    `**Generated:** ${snapshot.timestamp}`,
    ``,
    `## Vault Summary`,
    ``,
    `| Metric | Value |`,
    `|--------|-------|`,
  ]

  if (snapshot.vault) {
    lines.push(
      `| Total Balance | ${snapshot.vault.totalBalance} |`,
      `| PLP Supply | ${snapshot.vault.plpSupply} |`,
      `| Max Payout | ${snapshot.vault.maxPayout} |`,
      `| MTM Liability | ${snapshot.vault.mtmLiability} |`,
      `| Withdrawal Available | ${snapshot.vault.withdrawalAvailable} |`,
      `| Utilization | ${snapshot.vault.vaultUtilization}% |`,
    )
  }

  if (snapshot.oracles?.length) {
    lines.push(``, `## Oracle Prices`, ``, `| Pair | Price | Status |`, `|------|-------|--------|`)
    for (const o of snapshot.oracles) {
      lines.push(`| ${o.pair} | ${o.price} | ${o.isActive ? 'Active' : 'Inactive'} |`)
    }
  }

  if (snapshot.performance) {
    lines.push(
      ``,
      `## Performance`,
      ``,
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Period PnL | ${snapshot.performance.periodPnl} |`,
      `| Total PnL | ${snapshot.performance.totalPnl} |`,
      `| Trades | ${snapshot.performance.tradeCount} |`,
      `| Win Rate | ${snapshot.performance.winRate}% |`,
    )
  }

  lines.push(
    ``,
    `---`,
    `*${snapshot.disclaimer}*`,
  )

  return lines.join('\n')
}
