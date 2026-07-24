import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '../../api/client'
import type { Complaint, ComplaintFilters, PaginatedResponse } from '../../types'

interface ComplaintsState {
  items: Complaint[]
  currentComplaint: Complaint | null
  totalCount: number
  isLoading: boolean
  error: string | null
  uploadProgress: number
  filters: ComplaintFilters
  stats: {
    total: number
    open: number
    in_progress: number
    resolved: number
    critical: number
  }
}

const initialState: ComplaintsState = {
  items: [],
  currentComplaint: null,
  totalCount: 0,
  isLoading: false,
  uploadProgress: 0,
  error: null,
  filters: {
    search: '',
    status: '',
    priority: '',
    category: '',
    skip: 0,
    limit: 20,
  },
  stats: { total: 0, open: 0, in_progress: 0, resolved: 0, critical: 0 },
}

export const fetchComplaintsThunk = createAsyncThunk(
  'complaints/fetchAll',
  async (filters: ComplaintFilters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== undefined && v !== null) params.append(k, String(v))
      })
      const response = await apiClient.get(`/complaints?${params.toString()}`)
      return response.data
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      return rejectWithValue(error?.response?.data?.detail || 'Failed to fetch complaints')
    }
  }
)

export const fetchComplaintByIdThunk = createAsyncThunk(
  'complaints/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/complaints/${id}`)
      return response.data
    } catch {
      return rejectWithValue('Complaint not found')
    }
  }
)

export const fetchStatsThunk = createAsyncThunk(
  'complaints/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/complaints/stats')
      return response.data
    } catch {
      return rejectWithValue('Failed to fetch stats')
    }
  }
)

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ComplaintFilters>>) {
      state.filters = { ...state.filters, ...action.payload, skip: 0 }
    },
    clearCurrentComplaint(state) {
      state.currentComplaint = null
    },
    addComplaint(state, action: PayloadAction<Complaint>) {
      state.items.unshift(action.payload)
      state.totalCount += 1
    },
    updateComplaint(state, action: PayloadAction<Complaint>) {
      const idx = state.items.findIndex(c => c.id === action.payload.id)
      if (idx !== -1) state.items[idx] = action.payload
      if (state.currentComplaint?.id === action.payload.id) {
        state.currentComplaint = action.payload
      }
    },
    removeComplaint(state, action: PayloadAction<string>) {
      state.items = state.items.filter(c => c.id !== action.payload)
      state.totalCount -= 1
    },
    setUploadProgress(state, action: PayloadAction<number>) {
      state.uploadProgress = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaintsThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchComplaintsThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.items || []
        state.totalCount = action.payload.total || state.items.length
      })
      .addCase(fetchComplaintsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchComplaintByIdThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchComplaintByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentComplaint = action.payload
      })
      .addCase(fetchComplaintByIdThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload
      })
  },
})

export const { setFilters, clearCurrentComplaint, addComplaint, updateComplaint, removeComplaint, setUploadProgress } = complaintsSlice.actions
export default complaintsSlice.reducer
