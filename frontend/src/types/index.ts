// ===================== Auth =====================
export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  department?: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  last_login?: string
}

export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

// ===================== Customer =====================
export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
  country?: string
  city?: string
  notes?: string
  created_at: string
  updated_at: string
}

// ===================== Product =====================
export type ProductCategory = 
  | 'tablet' | 'capsule' | 'injection' | 'syrup'
  | 'cream' | 'ointment' | 'inhaler' | 'drops' | 'other'

export interface Product {
  id: string
  name: string
  sku: string
  batch_number?: string
  category: ProductCategory
  manufacturer?: string
  description?: string
  active_ingredient?: string
  strength?: string
  storage_conditions?: string
  expiry_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ===================== Complaint =====================
export type ComplaintStatus =
  | 'open' | 'in_progress' | 'under_review' | 'resolved' | 'closed' | 'rejected'

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical'

export type ComplaintCategory =
  | 'product_quality' | 'packaging' | 'labeling' | 'adverse_reaction'
  | 'contamination' | 'efficacy' | 'delivery' | 'other'

export interface Complaint {
  id: string
  ticket_number: string
  title: string
  description: string
  status: ComplaintStatus
  priority: ComplaintPriority
  category: ComplaintCategory
  customer_id?: string
  product_id?: string
  assigned_to?: string
  created_by: string
  resolution_notes?: string
  ai_summary?: string
  ai_suggested_action?: string
  lot_number?: string
  quantity_affected?: number
  due_date?: string
  is_draft: boolean
  created_at: string
  updated_at: string
  resolved_at?: string
  // Joined relations
  customer?: Customer
  product?: Product
  assignee?: User
  creator?: User
}

export interface ComplaintCreate {
  title: string
  description: string
  priority: ComplaintPriority
  category: ComplaintCategory
  customer_id?: string
  product_id?: string
  assigned_to?: string
  lot_number?: string
  quantity_affected?: number
  due_date?: string
  is_draft?: boolean
}

export interface ComplaintFilters {
  search?: string
  status?: string
  priority?: string
  category?: string
  assigned_to?: string
  from_date?: string
  to_date?: string
  skip?: number
  limit?: number
}

// ===================== File =====================
export interface UploadedFile {
  id: string
  complaint_id: string
  uploaded_by: string
  filename: string
  original_filename: string
  filepath: string
  file_type?: string
  file_size?: number
  extracted_text?: string
  uploaded_at: string
}

// ===================== Chat =====================
export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  user_id: string
  complaint_id?: string
  role: ChatRole
  message: string
  tokens_used?: string
  model_used?: string
  created_at: string
}

// ===================== Audit =====================
export interface AuditLog {
  id: string
  user_id?: string
  entity_type: string
  entity_id?: string
  action: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address?: string
  description?: string
  created_at: string
}

// ===================== Pagination =====================
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

// ===================== Dashboard Stats =====================
export interface ComplaintStats {
  total: number
  open: number
  in_progress: number
  resolved: number
  critical: number
}
