import axios from 'axios'

// Configure your backend base URL here
const BASE_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: BASE_URL,
})

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// -------- Auth --------
export function signup(name, email, password) {
  return api.post('/api/auth/signup', { name, email, password })
}

export function signin(email, password) {
  return api.post('/api/auth/signin', { email, password })
}

export function me() {
  return api.get('/api/auth/me')
}

// -------- Reports --------
export function uploadReport(file) {
  const form = new FormData()
  form.append('report', file)
  return api.post('/api/reports/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function listReports() {
  return api.get('/api/reports')
}

export function getReport(id) {
  return api.get(`/api/reports/${id}`)
}

export function getDashboardSummary() {
  return api.get('/api/reports/summary')
}
