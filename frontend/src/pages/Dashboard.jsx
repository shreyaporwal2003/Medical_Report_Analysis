
import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import ChartCard from '../components/ChartCard'
import MetricBadge from '../components/MetricBadge'
import { getDashboardSummary, listReports } from '../services/api'

// Helper to compute summary from reports if summary API not available
function computeFromReports(reports) {
  const counts = { normal: 0, high: 0, low: 0 }
  const trendMap = {} // metric -> [{label, value}]
  for (const r of reports) {
    const tests = r.parsedData?.tests || []
    for (const t of tests) {
      const status = (t.status || 'normal').toLowerCase()
      if (counts[status] !== undefined) counts[status]++
      const key = t.testName || t.name || 'Metric'
      const label = new Date(r.timestamp || r.createdAt || Date.now()).toLocaleDateString()
      if (!trendMap[key]) trendMap[key] = []
      trendMap[key].push({ label, value: Number(t.value) || 0 })
    }
  }
  // pick up to 3 charts
  const charts = Object.entries(trendMap).slice(0,3).map(([k,v]) => ({ name: k, data: v }))
  return { counts, charts }
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [fallback, setFallback] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getDashboardSummary()
        setSummary(data)
      } catch {
        try {
          const { data } = await listReports()
          setFallback(computeFromReports(data.reports || data || []))
        } catch (e) {
          setError(e.response?.data?.error || e.message)
        }
      }
    })()
  }, [])

  const counts = summary?.counts || fallback?.counts || { normal: 0, high: 0, low: 0 }
  const charts = summary?.charts || fallback?.charts || []

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Normal">
          <p className="text-3xl font-bold text-green-600">{counts.normal}</p>
        </Card>
        <Card title="High">
          <p className="text-3xl font-bold text-red-600">{counts.high}</p>
        </Card>
        <Card title="Low">
          <p className="text-3xl font-bold text-yellow-600">{counts.low}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {charts.length === 0 ? (
          <Card title="AI Insights">
            <p className="text-gray-600">Upload a report to see trends and insights.</p>
          </Card>
        ) : charts.map((c) => (
          <ChartCard key={c.name} title={c.name} data={c.data} />
        ))}
      </div>
    </div>
  )
}
