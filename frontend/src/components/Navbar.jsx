
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">AI Health Tracker</Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NavLink to="/dashboard" className={({isActive}) => isActive ? 'font-semibold' : ''}>Dashboard</NavLink>
              <NavLink to="/upload" className={({isActive}) => isActive ? 'font-semibold' : ''}>Upload</NavLink>
              <NavLink to="/reports" className={({isActive}) => isActive ? 'font-semibold' : ''}>Reports</NavLink>
              <span className="text-sm text-gray-600 hidden sm:block">Hi, {user.name}</span>
              <button className="btn btn-outline" onClick={() => { signOut(); navigate('/signin') }}>Sign out</button>
            </>
          ) : (
            <>
              <NavLink to="/signin" className="btn btn-outline">Sign In</NavLink>
              <NavLink to="/signup" className="btn btn-primary">Sign Up</NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
