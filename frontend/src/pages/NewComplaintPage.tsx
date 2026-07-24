import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../hooks'
import { addComplaint } from '../store/slices/complaintsSlice'
import { complaintsApi, customersApi, productsApi } from '../api/client'
import type { Customer, Product, ComplaintCreate, UploadedFile } from '../types'
import { ArrowLeft, Save, Loader2, CheckCircle, FileText, Upload, Type, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import FileUploader from '../components/complaints/FileUploader'

export default function NewComplaintPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  
  const [draftId, setDraftId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const [activeTab, setActiveTab] = useState<'manual' | 'upload' | 'email'>('manual')
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [emailText, setEmailText] = useState('')

  const [formData, setFormData] = useState<ComplaintCreate>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
    customer_id: '',
    product_id: '',
    lot_number: '',
    quantity_affected: 1,
    is_draft: True,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customersApi.getAll({ limit: 100 }),
          productsApi.getAll({ limit: 100 })
        ])
        setCustomers(custRes.data)
        setProducts(prodRes.data)
      } catch (error) {
        toast.error('Failed to load customers and products')
      }
    }
    fetchData()
  }, [])

  // Auto-save logic
  const saveDraft = useCallback(async () => {
    if (!formData.title && !formData.description) return
    setIsSavingDraft(true)
    
    const payload = { ...formData, is_draft: true }
    if (!payload.customer_id) delete payload.customer_id
    if (!payload.product_id) delete payload.product_id

    try {
      if (draftId) {
        await complaintsApi.update(draftId, payload)
      } else {
        const res = await complaintsApi.createDraft(payload)
        setDraftId(res.data.id)
      }
    } catch (error) {
      console.error('Failed to save draft', error)
    } finally {
      setIsSavingDraft(false)
    }
  }, [formData, draftId])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep === 2) {
        saveDraft()
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [formData, currentStep, saveDraft])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUploadComplete = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file])
    if (file.extracted_text) {
      setFormData(prev => ({
        ...prev,
        description: prev.description ? prev.description + '\n\n-- Extracted Text --\n' + file.extracted_text : file.extracted_text
      }))
    }
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (activeTab === 'email' && emailText) {
        setFormData(prev => ({ ...prev, description: emailText }))
      }
      // Ensure we have a draft ID before moving to form if we plan to upload files later
      if (!draftId && (formData.title || formData.description || emailText)) {
         await saveDraft()
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const payload = { ...formData, is_draft: false }
    if (!payload.customer_id) delete payload.customer_id
    if (!payload.product_id) delete payload.product_id

    try {
      let finalData
      if (draftId) {
        const res = await complaintsApi.update(draftId, payload)
        finalData = res.data
      } else {
        const res = await complaintsApi.create(payload)
        finalData = res.data
      }
      dispatch(addComplaint(finalData))
      toast.success('Complaint submitted successfully')
      navigate(`/complaints/${finalData.id}`)
    } catch (error) {
      toast.error('Failed to submit complaint')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/complaints')} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Complaint Intake</h1>
            <p className="text-sm text-slate-500">
              {isSavingDraft ? <span className="text-primary-500 animate-pulse">Saving draft...</span> : draftId ? <span className="text-green-500">Draft saved</span> : 'Start intake process'}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {[
          { num: 1, label: 'Source', icon: FileText },
          { num: 2, label: 'Details', icon: Type },
          { num: 3, label: 'Preview', icon: Eye }
        ].map((step, idx) => (
          <div key={step.num} className="flex items-center">
            <div className={clsx(
              "flex flex-col items-center gap-2",
              currentStep >= step.num ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-600"
            )}>
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                currentStep >= step.num 
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              )}>
                <step.icon size={18} />
              </div>
              <span className="text-xs font-semibold">{step.label}</span>
            </div>
            {idx < 2 && (
              <div className={clsx(
                "w-24 h-0.5 mx-4",
                currentStep > step.num ? "bg-primary-500" : "bg-slate-200 dark:bg-slate-700"
              )} />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6 sm:p-8">
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">Select Intake Method</h2>
            
            <div className="flex gap-4 justify-center border-b border-slate-200 dark:border-slate-700 pb-6">
              {[
                { id: 'manual', label: 'Manual Entry', icon: Type },
                { id: 'upload', label: 'Upload Document', icon: Upload },
                { id: 'email', label: 'Paste Email', icon: FileText },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-32",
                    activeTab === tab.id 
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400" 
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary-300"
                  )}
                >
                  <tab.icon size={24} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="min-h-[200px] flex items-center justify-center">
              {activeTab === 'manual' && (
                <p className="text-slate-500 text-center">Skip document parsing and enter the complaint details directly.</p>
              )}
              {activeTab === 'upload' && (
                <div className="w-full max-w-lg space-y-4">
                  {draftId ? (
                    <FileUploader complaintId={draftId} onUploadComplete={handleUploadComplete} />
                  ) : (
                    <div className="text-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                      <p className="text-slate-500 mb-4">Please provide a title first to enable uploads.</p>
                      <input 
                        type="text" 
                        placeholder="Complaint Title..." 
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="form-input max-w-sm mx-auto"
                      />
                      <button onClick={saveDraft} disabled={!formData.title} className="btn-primary mt-4">Save & Continue to Upload</button>
                    </div>
                  )}
                  {uploadedFiles.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mt-4 space-y-2">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Extracted Files:</h4>
                      {uploadedFiles.map(f => (
                        <div key={f.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle size={16} className="text-green-500" />
                          {f.original_filename}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'email' && (
                <div className="w-full">
                  <label className="form-label">Paste Email Content</label>
                  <textarea
                    rows={8}
                    value={emailText}
                    onChange={e => setEmailText(e.target.value)}
                    placeholder="Paste the raw email text here..."
                    className="form-input resize-y"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button 
                onClick={handleNext} 
                disabled={activeTab === 'upload' && !draftId && !formData.title}
                className="btn-primary"
              >
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <form className="space-y-6 animate-fade-in" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">General Information</h3>
              <div>
                <label className="form-label" htmlFor="title">Complaint Title <span className="text-red-500">*</span></label>
                <input
                  id="title" name="title" required
                  value={formData.title} onChange={handleChange}
                  placeholder="Brief summary of the issue" className="form-input"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="description">Detailed Description <span className="text-red-500">*</span></label>
                <textarea
                  id="description" name="description" required rows={8}
                  value={formData.description} onChange={handleChange}
                  placeholder="Provide all relevant details..." className="form-input resize-y"
                />
                {uploadedFiles.length > 0 && <p className="text-xs text-slate-500 mt-2">Text has been pre-filled from your uploaded document via OCR.</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">Classification</h3>
                <div>
                  <label className="form-label" htmlFor="category">Category <span className="text-red-500">*</span></label>
                  <select id="category" name="category" value={formData.category} onChange={handleChange} className="form-select">
                    <option value="product_quality">Product Quality</option>
                    <option value="packaging">Packaging</option>
                    <option value="labeling">Labeling</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="priority">Priority <span className="text-red-500">*</span></label>
                  <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="form-select">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">References</h3>
                <div>
                  <label className="form-label" htmlFor="customer_id">Customer / Source</label>
                  <select id="customer_id" name="customer_id" value={formData.customer_id} onChange={handleChange} className="form-select">
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="product_id">Product Involved</label>
                  <select id="product_id" name="product_id" value={formData.product_id} onChange={handleChange} className="form-select">
                    <option value="">-- Select Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label" htmlFor="lot_number">Lot / Batch #</label>
                    <input id="lot_number" name="lot_number" value={formData.lot_number} onChange={handleChange} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="quantity_affected">Qty Affected</label>
                    <input id="quantity_affected" name="quantity_affected" type="number" min="1" value={formData.quantity_affected} onChange={handleChange} className="form-input" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
              <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary">Back</button>
              <button type="submit" className="btn-primary">Review Complaint</button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl border border-primary-100 dark:border-primary-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Preview Submission</h2>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Title</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.title}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Category & Priority</span>
                  <div className="flex gap-2">
                    <span className="badge badge-open capitalize">{formData.category.replace('_', ' ')}</span>
                    <span className={`badge badge-${formData.priority} capitalize`}>{formData.priority}</span>
                  </div>
                </div>
                {formData.customer_id && (
                  <div>
                    <span className="text-slate-500 block mb-1">Customer</span>
                    <span className="font-medium text-slate-900 dark:text-white">{customers.find(c => c.id === formData.customer_id)?.name}</span>
                  </div>
                )}
                {formData.product_id && (
                  <div>
                    <span className="text-slate-500 block mb-1">Product</span>
                    <span className="font-medium text-slate-900 dark:text-white">{products.find(p => p.id === formData.product_id)?.name}</span>
                  </div>
                )}
              </div>
              
              <div>
                <span className="text-slate-500 block mb-2 text-sm">Description</span>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap border border-slate-200 dark:border-slate-700">
                  {formData.description}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button type="button" onClick={() => setCurrentStep(2)} className="btn-secondary">Edit Details</button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <><Save size={18} /> Submit Final Complaint</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
