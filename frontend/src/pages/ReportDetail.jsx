
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getReport } from '../services/api'
import MetricBadge from '../components/MetricBadge'
import Card from '../components/Card'

export default function ReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getReport(id)
        setReport(data.report || data)
      } catch (e) {
        setError(e.response?.data?.error || e.message)
      }
    })()
  }, [id])

  if (error) return <div className="text-red-600">{error}</div>
  if (!report) return <div>Loading...</div>

  const tests = report.parsedData?.tests || []

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Report Details</h2>
      <Card title="Summary">
        <p className="text-gray-700">{report.summary || 'No summary provided.'}</p>
      </Card>
      <Card title="Tests">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Test</th>
                <th className="text-left p-2">Method</th>
                <th className="text-left p-2">Value</th>
                <th className="text-left p-2">Unit</th>
                <th className="text-left p-2">Reference</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{t.testName || t.name}</td>
                  <td className="p-2">{t.method || '-'}</td>
                  <td className={`p-2 font-medium ${t.status==='high'?'text-red-600': t.status==='low'?'text-yellow-600':'text-green-700'}`}>{t.value}</td>
                  <td className="p-2">{t.unit}</td>
                  <td className="p-2">{t.referenceRange || '-'}</td>
                  <td className="p-2"><MetricBadge status={(t.status || 'normal').toLowerCase()} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {report.filePath && (
        <Card title="Original File">
          <a href={report.filePath.startsWith('http') ? report.filePath : (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL.replace('/api','')}/${report.filePath}` : `http://localhost:5000/${report.filePath}`)} target="_blank" className="text-blue-600">
            View uploaded file
          </a>
        </Card>
      )}
    </div>
  )
}
