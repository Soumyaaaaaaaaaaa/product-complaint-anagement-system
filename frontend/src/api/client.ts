import axios from 'axios'
import { store } from '../store'
import { logout } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : '/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken || localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 and generic errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = store.getState().auth.refreshToken || localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, null, {
            params: { refresh_token: refreshToken },
          })
          const { access_token } = res.data
          localStorage.setItem('access_token', access_token)
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return apiClient(originalRequest)
        } catch {
          store.dispatch(logout())
        }
      } else {
        store.dispatch(logout())
      }
    } else if (error.response?.status >= 400 && error.response?.status !== 401) {
       // Global error toast
       const message = error.response?.data?.detail || error.message || 'An error occurred'
       if (typeof message === 'string') {
         toast.error(message)
       } else if (Array.isArray(message)) {
         toast.error(message.map((m: any) => m.msg || JSON.stringify(m)).join(', '))
       }
    }
    
    return Promise.reject(error)
  }
)

// Typed API helpers
export const complaintsApi = {
  getAll: (params?: Record<string, string | number>) =>
    apiClient.get('/complaints', { params }),
  getById: (id: string) => apiClient.get(`/complaints/${id}`),
  create: (data: unknown) => apiClient.post('/complaints', data),
  createDraft: (data: unknown) => apiClient.post('/complaints/draft', data),
  update: (id: string, data: unknown) => apiClient.put(`/complaints/${id}`, data),
  delete: (id: string) => apiClient.delete(`/complaints/${id}`),
  getStats: () => apiClient.get('/complaints/stats'),
  getFiles: (id: string) => apiClient.get(`/complaints/${id}/files`),
  uploadFile: (id: string, formData: FormData) =>
    apiClient.post(`/complaints/${id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadAndParse: (formData: FormData) =>
    apiClient.post('/complaints/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const customersApi = {
  getAll: (params?: Record<string, string | number>) =>
    apiClient.get('/customers', { params }),
  getById: (id: string) => apiClient.get(`/customers/${id}`),
  create: (data: unknown) => apiClient.post('/customers', data),
  update: (id: string, data: unknown) => apiClient.put(`/customers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/customers/${id}`),
}

export const productsApi = {
  getAll: (params?: Record<string, string | number>) =>
    apiClient.get('/products', { params }),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  create: (data: unknown) => apiClient.post('/products', data),
  update: (id: string, data: unknown) => apiClient.put(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
}

export const usersApi = {
  getAll: (params?: Record<string, string | number>) =>
    apiClient.get('/users', { params }),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: unknown) => apiClient.post('/users', data),
  update: (id: string, data: unknown) => apiClient.put(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
}

export const chatApi = {
  getHistory: (params?: { complaint_id?: string; limit?: number }) =>
    apiClient.get('/chat/history', { params }),
  sendMessage: (data: unknown) => apiClient.post('/chat/message', data),
  clearHistory: (complaintId?: string) =>
    apiClient.delete('/chat/history', { params: complaintId ? { complaint_id: complaintId } : {} }),
}

export const auditApi = {
  getLogs: (params?: Record<string, string | number>) =>
    apiClient.get('/audit', { params }),
}
