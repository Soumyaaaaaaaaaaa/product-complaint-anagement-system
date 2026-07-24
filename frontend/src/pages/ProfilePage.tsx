import { useAppSelector } from '../hooks'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Building } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAppSelector(state => state.auth)

  if (!user) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-3xl"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-6 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-bold uppercase">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.full_name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge uppercase ${
                user.role === 'admin' ? 'badge-critical' : 
                user.role === 'manager' ? 'badge-high' : 'badge-default'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
              <Mail size={14} /> Email Address
            </label>
            <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
              <Shield size={14} /> Role Permissions
            </label>
            <p className="font-medium text-slate-900 dark:text-white capitalize">{user.role}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
              <Building size={14} /> Department
            </label>
            <p className="font-medium text-slate-900 dark:text-white">{user.department || 'Not specified'}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
              <User size={14} /> Account Status
            </label>
            <p className="font-medium text-green-600 dark:text-green-400">Active</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
