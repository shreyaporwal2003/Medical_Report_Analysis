
import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="text-center mt-24">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-gray-600 mb-6">Page not found</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  )
}
