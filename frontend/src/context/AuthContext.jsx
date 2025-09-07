
import { createContext, useContext, useEffect, useState } from 'react'
import { me } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await (await import('../services/api')).signin(email, password)
      setUser(data.user)
      setToken(data.token)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.response?.data?.error || e.message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (name, email, password) => {
    setLoading(true)
    try {
      const { data } = await (await import('../services/api')).signup(name, email, password)
      setUser(data.user)
      setToken(data.token)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.response?.data?.error || e.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
