import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File as FileIcon, X, CheckCircle, FileText, Image as ImageIcon } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { setUploadProgress } from '../../store/slices/complaintsSlice'
import { apiClient } from '../../api/client'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { UploadedFile } from '../../types'

interface FileUploaderProps {
  complaintId: string
  onUploadComplete: (file: UploadedFile) => void
}

export default function FileUploader({ complaintId, onUploadComplete }: FileUploaderProps) {
  const dispatch = useAppDispatch()
  const progress = useAppSelector(state => state.complaints.uploadProgress)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await apiClient.post(`/complaints/${complaintId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          dispatch(setUploadProgress(percentCompleted))
        },
      })
      toast.success('File uploaded and text extracted successfully')
      onUploadComplete(res.data)
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      dispatch(setUploadProgress(0))
    }
  }, [complaintId, dispatch, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ease-in-out',
          isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50',
          isDragReject && 'border-red-500 bg-red-50 dark:bg-red-900/20'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
            <Upload className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, DOCX, JPG, PNG (Max 10MB)
            </p>
          </div>
        </div>
      </div>

      {progress > 0 && progress < 100 && (
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
          <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
