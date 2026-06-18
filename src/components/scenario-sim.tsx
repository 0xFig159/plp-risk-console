import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { simulateBtcScenario, type ScenarioResult } from '@/lib/predict'

const CURRENT_BTC = 67890.12
const VAULT_BALANCE = 1_234_567
const MAX_PAYOUT = 250_000

export function ScenarioSim() {
  const [changePct, setChangePct] = useState(0)

  const scenarios = useMemo(
    () => simulateBtcScenario(CURRENT_BTC, VAULT_BALANCE, MAX_PAYOUT),
    [],
  )

  const current = useMemo(() => {
    const idx = scenarios.findIndex((s) => s.description === '0%')
    // find the nearest scenario to our slider value
    const sorted = [...scenarios].sort(
      (a, b) =>
        Math.abs(a.btcPrice - CURRENT_BTC * (1 + changePct / 100)) -
        Math.abs(b.btcPrice - CURRENT_BTC * (1 + changePct / 100)),
    )
    return sorted[0]
  }, [changePct, scenarios])

  return (
    <Card>
      <CardHeader>
        <CardTitle>BTC Scenario Simulation</CardTitle>
        <p className="text-xs text-muted-foreground">
          Estimate vault payout at different BTC expiry prices
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">
            BTC Price Change:
            <span
              className={`ml-2 font-mono ${changePct >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {changePct >= 0 ? '+' : ''}
              {changePct}%
            </span>
          </label>
          <input
            type="range"
            min={-40}
            max={40}
            step={1}
            value={changePct}
            onChange={(e) => setChangePct(Number(e.target.value))}
            className="w-full cursor-pointer accent-blue-500"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>-40% ($40,734)</span>
            <span>Current ($67,890)</span>
            <span>+40% ($95,046)</span>
          </div>
        </div>

        {current && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Simulated BTC Price</p>
                <p className="font-mono text-xl font-bold">
                  ${current.btcPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Payout</p>
                <p
                  className={`font-mono text-xl font-bold ${current.payout > 0 ? 'text-yellow-500' : 'text-green-500'}`}
                >
                  ${current.payout.toLocaleString()} USDC
                </p>
              </div>
            </div>
            {current.isStress && (
              <p className="mt-3 text-xs font-medium text-red-500">
                ⚠️ Stress scenario — payout near max cap
              </p>
            )}
          </div>
        )}

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Payout Profile
          </p>
          <div className="flex h-20 items-end gap-[2px]">
            {scenarios.map((s, i) => {
              const max = Math.max(...scenarios.map((x) => x.payout))
              const h = max > 0 ? (s.payout / max) * 100 : 0
              const isSelected =
                s.btcPrice === current?.btcPrice
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${
                    isSelected
                      ? 'bg-blue-500'
                      : s.isStress
                        ? 'bg-red-500/50'
                        : 'bg-blue-500/30'
                  }`}
                  style={{ height: `${Math.max(h, 2)}%` }}
                  title={`${s.description}: $${s.payout.toLocaleString()}`}
                />
              )
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>-40%</span>
            <span>0%</span>
            <span>+40%</span>
          </div>
        </div>

        <p className="mt-4 text-[10px] text-muted-foreground">
          * Estimation only. Not financial advice. Actual payouts depend on
          oracle settlement and position composition.
        </p>
      </CardContent>
    </Card>
  )
}
