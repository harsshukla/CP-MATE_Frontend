import axios from 'axios'

// Set up axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateHandles: (handles) => api.put('/auth/handles', handles),
}

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
  updateHandles: (handles) => api.put('/auth/handles', handles),
  updatePreferences: (preferences) => api.put('/user/preferences', preferences),
  changePassword: (passwordData) => api.put('/user/password', passwordData),
  deleteAccount: (password) => api.delete('/user/account', { data: { password } }),
}

// Stats API
export const statsAPI = {
  getStats: () => api.get('/stats'),
  fetchStats: () => api.post('/stats/fetch'),
  getDashboard: () => api.get('/stats/dashboard'),
}

// LeetCode API
export const leetcodeAPI = {
  getContestHistory: (username) => api.get(`/leetcode/contest/${username}`),
  getFullRatingTimeline: (username) => api.get(`/leetcode/full-rating-history/${username}`),
}

export default api 