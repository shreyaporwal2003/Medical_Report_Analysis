
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from './Card'

export default function ChartCard({ title, data, dataKey='value', yLabel }) {
  return (
    <Card title={title}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
