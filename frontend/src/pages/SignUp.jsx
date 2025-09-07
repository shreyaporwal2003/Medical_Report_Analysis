
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const { signUp, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    const res = await signUp(name, email, password)
    if (res.ok) navigate('/dashboard')
    else setError(res.error)
  }

  return (
    <div className="max-w-md mx-auto mt-10 card">
      <h2 className="text-2xl font-bold mb-6">Create account</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div>
          <label className="label">Full name</label>
          <input className="input" value={name} onChange={(e)=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Already have an account? <Link className="text-blue-600" to="/signin">Sign In</Link>
      </p>
    </div>
  )
}
