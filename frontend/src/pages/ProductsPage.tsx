import { useState, useEffect } from 'react'
import { productsApi } from '../api/client'
import type { Product } from '../types'
import { Package, Search, Plus, Hash } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const res = await productsApi.getAll({ search })
        setProducts(res.data)
      } catch (error) {
        console.error('Failed to fetch products', error)
      } finally {
        setIsLoading(false)
      }
    }
    const timer = setTimeout(() => {
      fetchProducts()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="text-pharma-teal" /> Product Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage pharmaceutical products and formulations.</p>
        </div>
        <button className="btn-primary w-full sm:w-auto self-start">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name, SKU, or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr>
              <th className="table-header">Product Name</th>
              <th className="table-header w-32">SKU</th>
              <th className="table-header w-32">Category</th>
              <th className="table-header">Manufacturer</th>
              <th className="table-header w-24 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="table-row animate-pulse">
                  <td className="table-cell"><div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                  <td className="table-cell"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                  <td className="table-cell"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                  <td className="table-cell"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                  <td className="table-cell"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto" /></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No products found.</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="table-row hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="table-cell">
                    <div className="font-semibold text-slate-900 dark:text-white">{product.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{product.active_ingredient || 'No active ingredient specified'}</div>
                  </td>
                  <td className="table-cell font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {product.sku}
                  </td>
                  <td className="table-cell capitalize">
                    {product.category}
                  </td>
                  <td className="table-cell text-slate-600 dark:text-slate-300">
                    {product.manufacturer || '-'}
                  </td>
                  <td className="table-cell text-center">
                    <span className={`badge ${product.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
