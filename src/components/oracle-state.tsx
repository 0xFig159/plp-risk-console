import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getOracleState, type OracleState } from '@/lib/predict'

export function OracleStatePanel() {
  const [oracles, setOracles] = useState<OracleState[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOracleState()
      .then(setOracles)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Oracle Prices</CardTitle></CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Oracle Prices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {oracles.map((o) => (
            <div
              key={o.pair}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{o.pair}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-semibold">
                  ${parseFloat(o.price.replace(/,/g, '')).toLocaleString()}
                </p>
                <Badge
                  className={o.isActive ? 'bg-green-600' : 'bg-red-600'}
                >
                  {o.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
