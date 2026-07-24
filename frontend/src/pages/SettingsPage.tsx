import { useAppSelector } from '../hooks'
import { Settings as SettingsIcon, User, Shield, Bell, Key } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAppSelector(state => state.auth)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-slate-500" /> Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences and system configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl font-medium text-sm transition-colors text-left">
            <User size={18} /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium text-sm transition-colors text-left">
            <Shield size={18} /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium text-sm transition-colors text-left">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-medium text-sm transition-colors text-left">
            <Key size={18} /> API Keys
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">Personal Information</h3>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-pharma-violet flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <button className="btn-secondary text-xs">Change Avatar</button>
                <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input bg-slate-50 dark:bg-slate-800" defaultValue={user?.full_name} disabled />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input bg-slate-50 dark:bg-slate-800" defaultValue={user?.email} disabled />
              </div>
              <div>
                <label className="form-label">Role</label>
                <input type="text" className="form-input bg-slate-50 dark:bg-slate-800 capitalize" defaultValue={user?.role} disabled />
              </div>
              <div>
                <label className="form-label">Department</label>
                <input type="text" className="form-input bg-slate-50 dark:bg-slate-800" defaultValue={user?.department || 'Not specified'} disabled />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button className="btn-primary" disabled>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
