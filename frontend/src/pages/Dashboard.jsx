import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import Card from "../components/Card"
import ChartCard from "../components/ChartCard"
import { getDashboardSummary } from "../services/api"

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const { data } = await getDashboardSummary()
      setSummary(data)
      setError(null)
    } catch (e) {
      setError(e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  // 🔥 Auto refresh whenever user navigates to dashboard
  useEffect(() => {
    fetchSummary()
  }, [location.pathname])

  const counts = summary?.counts || { normal: 0, high: 0, low: 0 }
  const charts = summary?.charts || []

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading dashboard...</div>
      ) : (
        <>
          {/* ===== STATUS COUNTS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card title="Normal">
              <p className="text-3xl font-bold text-green-600">
                {counts.normal}
              </p>
            </Card>

            <Card title="High">
              <p className="text-3xl font-bold text-red-600">
                {counts.high}
              </p>
            </Card>

            <Card title="Low">
              <p className="text-3xl font-bold text-yellow-600">
                {counts.low}
              </p>
            </Card>
          </div>

          {/* ===== CHARTS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {charts.length === 0 ? (
              <Card title="AI Insights">
                <p className="text-gray-600">
                  Upload reports to see trends and insights.
                </p>
              </Card>
            ) : (
              charts.map((chart) => (
                <ChartCard
                  key={chart.name}
                  title={chart.name}
                  data={chart.data}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}