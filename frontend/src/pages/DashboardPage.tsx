import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchStatsThunk, fetchComplaintsThunk } from '../store/slices/complaintsSlice'
import { FileText, AlertTriangle, CheckCircle, Clock, Activity, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

const mockChartData = [
  { name: 'Mon', total: 12, critical: 2 },
  { name: 'Tue', total: 19, critical: 1 },
  { name: 'Wed', total: 15, critical: 3 },
  { name: 'Thu', total: 22, critical: 4 },
  { name: 'Fri', total: 18, critical: 2 },
  { name: 'Sat', total: 8, critical: 0 },
  { name: 'Sun', total: 5, critical: 0 },
]

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { stats, items: recentComplaints, isLoading } = useAppSelector(state => state.complaints)

  useEffect(() => {
    dispatch(fetchStatsThunk())
    dispatch(fetchComplaintsThunk({ limit: 5 }))
  }, [dispatch])

  const statCards = [
    { title: 'Total Complaints', value: stats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Open', value: stats.open, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { title: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time insights into your quality assurance metrics.
          </p>
        </div>
        <Link to="/complaints/new" className="btn-primary w-full sm:w-auto">
          + New Complaint
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card flex-col items-start p-6">
            <div className="flex items-center justify-between w-full mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                <TrendingUp size={12} className="mr-1" /> +2.5%
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                {isLoading ? <div className="h-9 w-16 skeleton mb-1" /> : stat.value}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="text-primary-500" size={20} />
              Weekly Complaint Trend
            </h3>
            <select className="form-select w-32 py-1.5 text-sm">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Total" />
                <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCritical)" name="Critical" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Complaints</h3>
            <Link to="/complaints" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View All
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 skeleton" />
                    <div className="h-3 w-1/2 skeleton" />
                  </div>
                </div>
              ))
            ) : recentComplaints.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent complaints found.</p>
            ) : (
              recentComplaints.map((complaint) => (
                <div key={complaint.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                    complaint.priority === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                    complaint.priority === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                  }`}>
                    {complaint.ticket_number.split('-').pop()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/complaints/${complaint.id}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 truncate block">
                      {complaint.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`badge badge-${complaint.status} text-[10px]`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {format(new Date(complaint.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
