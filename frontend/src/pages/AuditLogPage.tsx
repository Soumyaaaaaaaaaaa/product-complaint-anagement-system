import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Activity, Search, AlertCircle } from 'lucide-react'
import { auditApi } from '../api/client'
import { format } from 'date-fns'
import { TableSkeleton } from '../components/common/Skeleton'
import toast from 'react-hot-toast'

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await auditApi.getLogs({ limit: 100 })
        setLogs(res.data)
      } catch (err) {
        toast.error('Failed to fetch audit logs')
      } finally {
        setIsLoading(false)
      }
    }
    fetchLogs()
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Trail</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            System-wide security and activity logging.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Activity</h2>
        </div>
        
        <div className="table-container bg-white dark:bg-slate-800/50">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr>
                <th className="table-header w-40">Timestamp</th>
                <th className="table-header">Action</th>
                <th className="table-header w-32">Entity Type</th>
                <th className="table-header w-48">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-4">
                    <TableSkeleton rows={5} columns={4} />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-base font-medium">No logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="table-row">
                    <td className="table-cell text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {log.action}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 max-w-xl truncate">
                        {JSON.stringify(log.changes)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-default uppercase">{log.entity_type}</span>
                    </td>
                    <td className="table-cell text-xs font-mono text-slate-500">
                      {log.user_id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
