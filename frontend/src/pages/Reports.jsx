
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listReports } from '../services/api'
import MetricBadge from '../components/MetricBadge'
import Card from '../components/Card'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await listReports()
        setReports(data.reports || data || [])
      } catch (e) {
        setError(e.response?.data?.error || e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Report History</h2>
      <div className="grid grid-cols-1 gap-3">
        {reports.length === 0 && <Card title="No Reports"><p className="text-gray-600">Upload your first report to see history.</p></Card>}
        {reports.map((r) => {
          const ts = new Date(r.timestamp).toLocaleString()
          const tests = r.parsedData?.tests || []
          const first = tests[0]
          return (
            <Link key={r._id || r.id} to={`/reports/${r._id || r.id}`} className="card hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Report {r._id?.slice(-6) || ''}</p>
                  <p className="text-xs text-gray-500">{ts}</p>
                </div>
                {first && <MetricBadge status={(first.status || 'normal').toLowerCase()} />}
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{r.summary || 'No summary available.'}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
