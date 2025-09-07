
export default function Card({ title, children, right }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  )
}
