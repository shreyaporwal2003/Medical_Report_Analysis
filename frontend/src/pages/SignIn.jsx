
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const { signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const onSubmit = async (e) => {
    e.preventDefault()
    const res = await signIn(email, password)
    if (res.ok) navigate(from, { replace: true })
    else setError(res.error)
  }

  return (
    <div className="max-w-md mx-auto mt-10 card">
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        No account? <Link className="text-blue-600" to="/signup">Sign Up</Link>
      </p>
    </div>
  )
}
