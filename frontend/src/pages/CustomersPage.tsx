import { useState, useEffect } from 'react'
import { customersApi } from '../api/client'
import type { Customer } from '../types'
import { Users, Search, Plus, Mail, Phone, MapPin } from 'lucide-react'
import { format } from 'date-fns'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        const res = await customersApi.getAll({ search })
        setCustomers(res.data)
      } catch (error) {
        console.error('Failed to fetch customers', error)
      } finally {
        setIsLoading(false)
      }
    }
    const timer = setTimeout(() => {
      fetchCustomers()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="text-primary-500" /> Customers
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage healthcare providers, pharmacies, and patients.</p>
        </div>
        <button className="btn-primary w-full sm:w-auto self-start">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : customers.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-slate-500">
            No customers found.
          </div>
        ) : (
          customers.map(customer => (
            <div key={customer.id} className="card p-5 hover:border-primary-500/50 transition-colors cursor-pointer group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{customer.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{customer.company || 'Independent'}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {customer.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail size={14} className="text-slate-400" /> {customer.email}
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone size={14} className="text-slate-400" /> {customer.phone}
                  </div>
                )}
                {(customer.city || customer.country) && (
                  <div className="flex items-center gap-2 truncate">
                    <MapPin size={14} className="text-slate-400" /> {[customer.city, customer.country].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500">
                Added {format(new Date(customer.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
