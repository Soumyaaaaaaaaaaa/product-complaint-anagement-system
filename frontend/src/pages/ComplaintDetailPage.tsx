import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchComplaintByIdThunk, updateComplaint } from '../store/slices/complaintsSlice'
import { toggleAIPanel } from '../store/slices/uiSlice'
import { complaintsApi } from '../api/client'
import { ArrowLeft, Sparkles, Clock, User, Package, Calendar, AlertCircle, FileText, CheckCircle, XCircle, Download } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentComplaint: complaint, isLoading } = useAppSelector(state => state.complaints)
  
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchComplaintByIdThunk(id))
    }
  }, [id, dispatch])

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    if (!complaint) return
    setIsUpdating(true)
    try {
      const res = await complaintsApi.update(complaint.id, { status: newStatus })
      dispatch(updateComplaint(res.data))
      toast.success('Status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExportPdf = () => {
    if (!complaint) return
    const token = localStorage.getItem('access_token')
    window.open(`http://localhost:8000/api/v1/complaints/${complaint.id}/export/pdf?token=${token}`, '_blank')
  }

  if (isLoading && !complaint) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        <p className="text-slate-500 font-medium">Loading complaint details...</p>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle size={48} className="text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Complaint Not Found</h2>
        <p className="text-slate-500 mb-6">The complaint you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/complaints')} className="btn-primary">
          Back to Complaints
        </button>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col items-start gap-2">
          <button onClick={() => navigate('/complaints')} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to list
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              {complaint.ticket_number}
            </h1>
            <span className={`badge badge-${complaint.status} capitalize text-sm px-3 py-1`}>
              {complaint.status.replace('_', ' ')}
            </span>
            <span className={`badge badge-${complaint.priority} capitalize text-sm px-3 py-1`}>
              {complaint.priority} Priority
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <select 
            value={complaint.status}
            onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus)}
            disabled={isUpdating}
            className="form-select w-40"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={handleExportPdf} className="btn-secondary whitespace-nowrap">
            <Download size={18} className="mr-1" /> PDF
          </button>
          <button 
            onClick={() => dispatch(toggleAIPanel())}
            className="btn-primary bg-gradient-to-r from-primary-600 to-pharma-teal hover:from-primary-700 hover:to-teal-700 border-none shadow-glow-teal"
          >
            <Sparkles size={18} /> Ask AI Assistant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{complaint.title}</h2>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
              <p className="whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">AI Analysis (Scaffold)</h3>
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4">
                {complaint.ai_summary ? (
                  <p className="text-sm text-slate-700 dark:text-slate-300">{complaint.ai_summary}</p>
                ) : (
                  <div className="flex items-start gap-3 text-sm text-primary-700 dark:text-primary-300">
                    <Sparkles size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">AI Insights not yet generated</p>
                      <p className="text-primary-600/80 dark:text-primary-400/80">Use the AI Assistant panel to analyze this complaint, identify root causes, and suggest corrective actions.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="card p-5 space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Customer</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{complaint.customer?.name || 'Not assigned'}</p>
                  {complaint.customer?.company && <p className="text-xs text-slate-500">{complaint.customer.company}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Product</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{complaint.product?.name || 'Not specified'}</p>
                  {complaint.lot_number && <p className="text-xs text-slate-500">Lot: <span className="font-mono">{complaint.lot_number}</span></p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Category</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{complaint.category.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Created</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {format(new Date(complaint.created_at), 'PPP')}
                  </p>
                  <p className="text-xs text-slate-500">
                    by {complaint.creator?.full_name || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
