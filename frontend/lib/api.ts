import axios from 'axios'
import { getKeycloak, getToken } from './keycloak'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token from Keycloak
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      try {
        const keycloak = getKeycloak()

        // Refresh token if needed (60 seconds before expiry)
        if (keycloak.authenticated && keycloak.isTokenExpired(60)) {
          await keycloak.updateToken(60)
        }

        const token = getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error getting token:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401, redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const keycloak = getKeycloak()
        keycloak.logout({ redirectUri: window.location.origin + '/login' })
      }
    }

    return Promise.reject(error)
  }
)

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
