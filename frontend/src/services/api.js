import axios from "axios";

// Use .env value in dev/prod, fallback to localhost for safety
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------- Auth --------
export function signup(name, email, password) {
  return api.post("/auth/signup", { name, email, password });
}

export function signin(email, password) {
  return api.post("/auth/signin", { email, password });
}

export function me() {
  return api.get("/auth/me");
}

// -------- Reports --------
export function uploadReport(file) {
  const form = new FormData();
  form.append("report", file);
  return api.post("/reports/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function listReports() {
  return api.get("/reports");
}

export function getReport(id) {
  return api.get(`/reports/${id}`);
}

export function getDashboardSummary() {
  return api.get("/reports/summary");
}
