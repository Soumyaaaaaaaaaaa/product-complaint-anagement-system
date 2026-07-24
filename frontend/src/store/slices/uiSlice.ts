import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarCollapsed: boolean
  aiPanelOpen: boolean
  globalLoading: boolean
  notifications: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>
}

const initialState: UIState = {
  sidebarCollapsed: false,
  aiPanelOpen: false,
  globalLoading: false,
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    toggleAIPanel(state) {
      state.aiPanelOpen = !state.aiPanelOpen
    },
    setAIPanelOpen(state, action: PayloadAction<boolean>) {
      state.aiPanelOpen = action.payload
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload
    },
    addNotification(state, action: PayloadAction<Omit<UIState['notifications'][0], 'id'>>) {
      state.notifications.push({
        ...action.payload,
        id: Date.now().toString(),
      })
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
  },
})

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleAIPanel,
  setAIPanelOpen,
  setGlobalLoading,
  addNotification,
  removeNotification,
} = uiSlice.actions
export default uiSlice.reducer
