import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
            { refresh_token: refreshToken }
          )

          const { access_token, refresh_token } = response.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/api/v1/auth/login', data),
  register: (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone: string
  }) => api.post('/api/v1/auth/register', data),
  refresh: (refreshToken: string) =>
    api.post('/api/v1/auth/refresh', { refresh_token: refreshToken }),
  logout: () => api.post('/api/v1/auth/logout'),
}

// Members
export const membersApi = {
  list: (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    organization_id?: string
  }) => api.get('/api/v1/members', { params }),
  get: (id: string) => api.get(`/api/v1/members/${id}`),
  create: (data: any) => api.post('/api/v1/members', data),
  update: (id: string, data: any) => api.put(`/api/v1/members/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/members/${id}`),
  updateStatus: (id: string, data: { status: string; reason?: string }) =>
    api.post(`/api/v1/members/${id}/status`, data),
  getHistory: (id: string) => api.get(`/api/v1/members/${id}/history`),
}

// Organizations
export const organizationsApi = {
  list: (params?: {
    page?: number
    limit?: number
    level?: string
    province_id?: string
  }) => api.get('/api/v1/organizations', { params }),
  get: (id: string) => api.get(`/api/v1/organizations/${id}`),
  create: (data: any) => api.post('/api/v1/organizations', data),
  update: (id: string, data: any) => api.put(`/api/v1/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/organizations/${id}`),
  getMembers: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/api/v1/organizations/${id}/members`, { params }),
  getStats: (id: string) => api.get(`/api/v1/organizations/${id}/stats`),
}

// Events
export const eventsApi = {
  list: (params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
    organization_id?: string
  }) => api.get('/api/v1/events', { params }),
  get: (id: string) => api.get(`/api/v1/events/${id}`),
  create: (data: any) => api.post('/api/v1/events', data),
  update: (id: string, data: any) => api.put(`/api/v1/events/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/events/${id}`),
  register: (id: string) => api.post(`/api/v1/events/${id}/register`),
  markAttendance: (id: string, data: { member_ids: string[]; attended: boolean }) =>
    api.post(`/api/v1/events/${id}/attendance`, data),
  getParticipants: (id: string) => api.get(`/api/v1/events/${id}/participants`),
}

// Fees
export const feesApi = {
  list: (params?: {
    page?: number
    limit?: number
    member_id?: string
    year?: number
    status?: string
  }) => api.get('/api/v1/fees', { params }),
  get: (id: string) => api.get(`/api/v1/fees/${id}`),
  create: (data: any) => api.post('/api/v1/fees', data),
  update: (id: string, data: any) => api.put(`/api/v1/fees/${id}`, data),
  getByMember: (memberId: string) => api.get(`/api/v1/fees/member/${memberId}`),
  bulkCreate: (data: any) => api.post('/api/v1/fees/bulk', data),
}

// Reports
export const reportsApi = {
  members: (params?: { organization_id?: string }) =>
    api.get('/api/v1/reports/members', { params }),
  fees: (params?: { organization_id?: string; year?: number }) =>
    api.get('/api/v1/reports/fees', { params }),
  events: (params?: { organization_id?: string; start_date?: string; end_date?: string }) =>
    api.get('/api/v1/reports/events', { params }),
  dashboard: () => api.get('/api/v1/reports/dashboard'),
}

// Profile
export const profileApi = {
  get: () => api.get('/api/v1/profile'),
  update: (data: any) => api.put('/api/v1/profile', data),
  getFees: () => api.get('/api/v1/profile/fees'),
  getEvents: () => api.get('/api/v1/profile/events'),
}

export default api
