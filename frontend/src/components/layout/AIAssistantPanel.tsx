import { useState, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { toggleAIPanel } from '../../store/slices/uiSlice'
import { X, Send, Bot, User as UserIcon, Loader2, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { chatApi } from '../../api/client'
import type { ChatMessage } from '../../types'

export default function AIAssistantPanel() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector(state => state.ui.aiPanelOpen)
  const currentComplaint = useAppSelector(state => state.complaints.currentComplaint)
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && currentComplaint) {
      fetchHistory()
    }
  }, [isOpen, currentComplaint])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchHistory = async () => {
    if (!currentComplaint) return
    try {
      const res = await chatApi.getHistory({ complaint_id: currentComplaint.id })
      setMessages(res.data)
    } catch (error) {
      console.error('Failed to fetch chat history', error)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !currentComplaint) return

    const userText = input.trim()
    setInput('')
    setIsLoading(true)

    // Optimistic UI update
    const tempId = Date.now().toString()
    setMessages(prev => [...prev, {
      id: tempId,
      user_id: '',
      role: 'user',
      message: userText,
      created_at: new Date().toISOString()
    }])

    try {
      await chatApi.sendMessage({
        complaint_id: currentComplaint.id,
        role: 'user',
        message: userText
      })
      await fetchHistory()
    } catch (error) {
      console.error('Failed to send message', error)
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={clsx(
      'fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary-50 to-pharma-teal/10 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-pharma-teal flex items-center justify-center shadow-glow">
            <Sparkles className="text-white" size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">AI Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Powered by gemma2-9b-it</p>
          </div>
        </div>
        <button
          onClick={() => dispatch(toggleAIPanel())}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-slate-50/50 dark:bg-slate-900/50">
        {!currentComplaint ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Bot size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
            <p>Please open a specific complaint to start analyzing it with AI.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
              <Bot size={32} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">How can I help you today?</h4>
            <p className="text-sm text-slate-500">I can analyze the complaint, suggest root causes, or draft responses to the customer.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Summarize complaint', 'Suggest CAPA', 'Draft email to customer'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={clsx(
                'flex gap-3 max-w-[90%]',
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <div className={clsx(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                msg.role === 'user' 
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  : 'bg-gradient-to-br from-primary-500 to-pharma-teal text-white shadow-sm'
              )}>
                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>
              <div className={clsx(
                'p-3 rounded-2xl text-sm shadow-sm',
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 rounded-tl-sm'
              )}>
                {msg.message}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 max-w-[90%] mr-auto">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-pharma-teal flex items-center justify-center text-white">
                <Bot size={16} />
             </div>
             <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-tl-sm shadow-sm flex items-center gap-2">
               <Loader2 size={16} className="animate-spin text-primary-500" />
               <span className="text-xs font-medium text-slate-500">AI is thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!currentComplaint || isLoading}
            placeholder={currentComplaint ? "Ask the AI assistant..." : "Select a complaint first"}
            className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || !currentComplaint || isLoading}
            className="absolute right-2 p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
