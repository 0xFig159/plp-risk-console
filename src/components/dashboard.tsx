import { useState, useEffect } from 'react'
import { VaultSummary } from './vault-summary'
import { OracleStatePanel } from './oracle-state'
import { ScenarioSim } from './scenario-sim'
import { RiskSnapshot } from './risk-snapshot'

export function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <header className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              PLP Risk Console
            </h1>
            <p className="text-sm text-muted-foreground">
              DeepBook Predict LP Risk Dashboard
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Testnet
          </div>
        </div>
      </header>

      {/* Quick Reviewer Flow */}
      <div className="rounded-lg border border-blue-600/30 bg-blue-600/10 p-3 text-xs">
        <p className="font-medium text-blue-500">Reviewer Flow</p>
        <p className="text-muted-foreground">
          1. Vault metrics load from testnet →{' '}
          2. Drag BTC slider to simulate price scenarios →{' '}
          3. Click <strong>Export Risk Snapshot</strong> to generate &amp; optionally upload to Walrus
        </p>
      </div>

      {/* Core Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <VaultSummary />
        <OracleStatePanel />
      </div>

      {/* Scenario Simulator */}
      <ScenarioSim />

      {/* Risk Snapshot Export */}
      <RiskSnapshot vault={null} oracles={[]} perf={null} />

      {/* Footer Disclaimer */}
      <footer className="border-t pt-4 text-center text-[10px] text-muted-foreground">
        <p>
          PLP Risk Console — Estimation only. Not financial advice.{' '}
          Data sourced from DeepBook Predict testnet.
        </p>
      </footer>
    </div>
  )
}
