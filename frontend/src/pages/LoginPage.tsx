import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks'
import { loginThunk } from '../store/slices/authSlice'
import { FlaskConical, Lock, Mail, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector(state => state.auth)
  const [email, setEmail] = useState('admin@pharma.com')
  const [password, setPassword] = useState('Admin@123')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(loginThunk({ email, password })).unwrap()
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error as string || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-pharma-teal shadow-glow mb-6">
              <FlaskConical className="text-white h-8 w-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to access the PharmaComplaint AI Management System
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10 py-3"
                    placeholder="admin@pharma.com"
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10 py-3"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 justify-center text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
            
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Default Admin: admin@pharma.com / Admin@123
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image/Graphic */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/80 to-pharma-teal/80"></div>
        
        <div className="relative z-10 max-w-lg px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Next-Generation <br/><span className="text-primary-200">Quality Assurance</span>
          </h1>
          <p className="text-lg text-primary-100/90 font-light mb-8">
            Leverage AI to streamline complaint management, ensure regulatory compliance, and improve patient safety across your pharmaceutical supply chain.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { title: 'AI Analysis', desc: 'Automated complaint summarization' },
              { title: 'Compliance', desc: 'Full audit trails & reporting' },
              { title: 'Tracking', desc: 'End-to-end resolution workflows' },
              { title: 'Insights', desc: 'Real-time analytics dashboard' }
            ].map((feature, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-primary-200 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
