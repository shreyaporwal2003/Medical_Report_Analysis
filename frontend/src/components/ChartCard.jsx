import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from './Card'

export default function ChartCard({ title, data, dataKey = 'value', yLabel }) {
  return (
    <Card title={title} className="hover:shadow-2xl transition duration-300">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              {/* Gradient for line */}
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fill: "#6b7280" }} />
            <YAxis
              label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: "#6b7280" }}
              tick={{ fill: "#6b7280" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                border: 'none',
              }}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              itemStyle={{ color: '#4f46e5' }}
            />

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2, fill: "#4f46e5", stroke: "white" }}
              activeDot={{ r: 8, stroke: "#06b6d4", strokeWidth: 2, fill: "white" }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
