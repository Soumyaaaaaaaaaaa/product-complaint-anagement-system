import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchComplaintsThunk, setFilters } from '../store/slices/complaintsSlice'
import { Search, Filter, Plus, ChevronLeft, ChevronRight, AlertCircle, Download } from 'lucide-react'
import { format } from 'date-fns'
import { TableSkeleton } from '../components/common/Skeleton'
import { motion } from 'framer-motion'

export default function ComplaintsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, totalCount, isLoading, filters } = useAppSelector(state => state.complaints)
  
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchComplaintsThunk(filters))
  }, [dispatch, filters])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        dispatch(setFilters({ search: localSearch }))
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearch, filters.search, dispatch])

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    dispatch(setFilters({ [key]: value }))
  }

  const totalPages = Math.ceil(totalCount / (filters.limit || 20))
  const currentPage = Math.floor((filters.skip || 0) / (filters.limit || 20)) + 1

  const handleExportExcel = () => {
    const token = localStorage.getItem('access_token')
    window.open(`http://localhost:8000/api/v1/complaints/export/excel?token=${token}`, '_blank')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Complaints</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and track all product quality and customer complaints.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handleExportExcel} className="btn-secondary whitespace-nowrap">
            <Download size={18} className="mr-2" /> Export Excel
          </button>
          <Link to="/complaints/new" className="btn-primary whitespace-nowrap">
            <Plus size={18} /> New
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by ticket number, title, or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          <div className="flex gap-4 flex-wrap md:flex-nowrap">
            <div className="w-full md:w-40 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter size={16} />
              </div>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-select pl-10 w-full"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="form-select w-full md:w-36"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input 
              type="date"
              className="form-input w-full md:w-40"
              title="From Date"
              value={filters.from_date as string || ''}
              onChange={(e) => handleFilterChange('from_date', e.target.value)}
            />
            <input 
              type="date"
              className="form-input w-full md:w-40"
              title="To Date"
              value={filters.to_date as string || ''}
              onChange={(e) => handleFilterChange('to_date', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container bg-white dark:bg-slate-800/50">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr>
              <th className="table-header w-24">Ticket</th>
              <th className="table-header">Details</th>
              <th className="table-header w-32">Status</th>
              <th className="table-header w-32">Priority</th>
              <th className="table-header w-40">Date</th>
              <th className="table-header w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-4">
                  <TableSkeleton rows={5} columns={6} />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-base font-medium">No complaints found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((complaint) => (
                <tr key={complaint.id} className="table-row group cursor-pointer" onClick={() => navigate(`/complaints/${complaint.id}`)}>
                  <td className="table-cell font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {complaint.ticket_number}
                  </td>
                  <td className="table-cell">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors truncate max-w-[300px]">
                      {complaint.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1 truncate max-w-[300px]">
                      {complaint.customer?.name || 'Unknown Customer'} • {complaint.category.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge badge-${complaint.status} capitalize`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge badge-${complaint.priority} capitalize`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="table-cell text-sm text-slate-500 dark:text-slate-400">
                    {format(new Date(complaint.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="table-cell text-center">
                    <span className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
                      View
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {!isLoading && items.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium">{(filters.skip || 0) + 1}</span> to <span className="font-medium">{Math.min((filters.skip || 0) + (filters.limit || 20), totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handleFilterChange('skip', (filters.skip || 0) - (filters.limit || 20))}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handleFilterChange('skip', (filters.skip || 0) + (filters.limit || 20))}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
