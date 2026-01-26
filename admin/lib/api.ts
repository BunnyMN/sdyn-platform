import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Pagination response type
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API methods
export const api = {
  // GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.get(url, config);
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.post(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.put(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.patch(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.delete(url, config);
    return response.data;
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return api.post<{ token: string; user: unknown }>('/auth/login', { email, password });
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    return api.get<{ user: unknown }>('/auth/me');
  },

  refreshToken: async () => {
    return api.post<{ token: string }>('/auth/refresh');
  },
};

// Members API
export const membersApi = {
  getAll: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    return api.get<PaginatedResponse<Member>>('/members', { params });
  },

  getById: async (id: string) => {
    return api.get<Member>(`/members/${id}`);
  },

  create: async (data: Partial<Member>) => {
    return api.post<Member>('/members', data);
  },

  update: async (id: string, data: Partial<Member>) => {
    return api.put<Member>(`/members/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/members/${id}`);
  },
};

// Organizations API
export const organizationsApi = {
  getAll: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    return api.get<PaginatedResponse<Organization>>('/organizations', { params });
  },

  getById: async (id: string) => {
    return api.get<Organization>(`/organizations/${id}`);
  },

  create: async (data: Partial<Organization>) => {
    return api.post<Organization>('/organizations', data);
  },

  update: async (id: string, data: Partial<Organization>) => {
    return api.put<Organization>(`/organizations/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/organizations/${id}`);
  },
};

// Events API
export const eventsApi = {
  getAll: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    return api.get<PaginatedResponse<Event>>('/events', { params });
  },

  getById: async (id: string) => {
    return api.get<Event>(`/events/${id}`);
  },

  create: async (data: Partial<Event>) => {
    return api.post<Event>('/events', data);
  },

  update: async (id: string, data: Partial<Event>) => {
    return api.put<Event>(`/events/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/events/${id}`);
  },
};

// Fees API
export const feesApi = {
  getAll: async (params?: { page?: number; pageSize?: number; search?: string; status?: string }) => {
    return api.get<PaginatedResponse<MembershipFee>>('/fees', { params });
  },

  getById: async (id: string) => {
    return api.get<MembershipFee>(`/fees/${id}`);
  },

  create: async (data: Partial<MembershipFee>) => {
    return api.post<MembershipFee>('/fees', data);
  },

  update: async (id: string, data: Partial<MembershipFee>) => {
    return api.put<MembershipFee>(`/fees/${id}`, data);
  },

  approve: async (id: string) => {
    return api.post<MembershipFee>(`/fees/${id}/approve`);
  },
};

// Reports API
export const reportsApi = {
  getDashboardStats: async () => {
    return api.get<DashboardStats>('/reports/dashboard');
  },

  getMembershipReport: async (params?: { startDate?: string; endDate?: string }) => {
    return api.get('/reports/membership', { params });
  },

  getFinancialReport: async (params?: { startDate?: string; endDate?: string }) => {
    return api.get('/reports/financial', { params });
  },

  exportReport: async (type: string, format: 'csv' | 'xlsx' | 'pdf') => {
    return api.get(`/reports/export/${type}`, {
      params: { format },
      responseType: 'blob',
    });
  },
};

// Type definitions
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipNumber: string;
  organizationId: string;
  organizationName: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  memberCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registeredCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface MembershipFee {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  year: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalOrganizations: number;
  totalEvents: number;
  upcomingEvents: number;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  memberGrowth: number;
  feeCollectionRate: number;
}

export default apiClient;
