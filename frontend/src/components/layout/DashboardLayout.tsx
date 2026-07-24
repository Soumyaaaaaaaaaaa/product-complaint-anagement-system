import { Outlet } from 'react-router-dom'
import { useAppSelector } from '../../hooks'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import AIAssistantPanel from './AIAssistantPanel'
import clsx from 'clsx'

export default function DashboardLayout() {
  const sidebarCollapsed = useAppSelector(state => state.ui.sidebarCollapsed)
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Sidebar />
      <Navbar />
      
      <main className={clsx(
        'transition-all duration-300 ease-in-out pt-16 min-h-screen',
        sidebarCollapsed ? 'pl-16' : 'pl-64'
      )}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in relative">
          <Outlet />
        </div>
      </main>

      <AIAssistantPanel />
    </div>
  )
}
