import { Menu, Search, Sun, Moon, Bell } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { toggleTheme } from '../../store/slices/themeSlice'
import clsx from 'clsx'

export default function Navbar() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(state => state.theme.mode)
  const sidebarCollapsed = useAppSelector(state => state.ui.sidebarCollapsed)

  return (
    <header className={clsx(
      'fixed top-0 right-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300',
      sidebarCollapsed ? 'left-16' : 'left-64'
    )}>
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left side */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden sm:flex max-w-md w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search complaints, products, customers..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent rounded-full text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-slate-900"></span>
          </button>
        </div>
      </div>
    </header>
  )
}
