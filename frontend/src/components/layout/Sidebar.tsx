import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { logout } from '../../store/slices/authSlice'
import clsx from 'clsx'
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Bot,
  ShieldCheck,
  Activity,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/complaints', icon: FileText, label: 'Complaints' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/products', icon: Package, label: 'Products' },
]

const secondaryItems = [
  { to: '/audit', icon: ShieldCheck, label: 'Audit Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const collapsed = useAppSelector(state => state.ui.sidebarCollapsed)
  const user = useAppSelector(state => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300 ease-in-out',
        'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-pharma-teal flex items-center justify-center shadow-glow">
            <FlaskConical className="h-4.5 w-4.5 text-white" size={18} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate leading-tight">PharmaComplaint</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">AI Management</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapse button (when collapsed) */}
      {collapsed && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex justify-center py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-2.5 py-4 space-y-1">
        {!collapsed && (
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-3 mb-3">
            Main Menu
          </p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              )
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={clsx(
                    'flex-shrink-0 transition-colors',
                    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-primary-500'
                  )}
                />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Secondary nav */}
      <div className="px-2.5 pb-2 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">
        {secondaryItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0 text-slate-400" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* User + logout */}
        <div className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl',
          collapsed ? 'justify-center' : ''
        )}>
          <NavLink to="/profile" className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-pharma-violet flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer hover:opacity-80">
            {user?.full_name?.charAt(0) || 'U'}
          </NavLink>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <NavLink to="/profile" className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate hover:text-primary-600 block">{user?.full_name}</NavLink>
              <p className="text-xs text-slate-400 capitalize truncate">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
