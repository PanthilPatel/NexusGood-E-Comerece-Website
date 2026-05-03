import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from);
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-space-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        <div className="text-center space-y-2">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-xl shadow-primary/40 mb-6">
              <LogIn className="text-white" size={32} />
           </div>
           <h2 className="text-4xl font-outfit font-bold text-white tracking-tight">Welcome Back</h2>
           <p className="text-slate-400 font-light">Enter your credentials to access your account.</p>
        </div>

        <div className="glass-card p-8 md:p-10 space-y-8">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="email" 
                      placeholder="name@example.com"
                      className="input-field pl-12"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                    <Link to="/forgot-password" size={16} className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest">Forgot?</Link>
                 </div>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="input-field pl-12"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>
              </div>

              <button 
                type="submit" 
                className="w-full btn-primary py-4 flex items-center justify-center gap-3 group"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
           </form>

           <div className="text-center text-sm text-slate-500">
              New here? <Link to="/register" className="text-primary hover:underline font-bold">Create an account</Link>
           </div>
        </div>

        <div className="text-center">
           <Link to="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors uppercase font-bold tracking-widest">← Back to Store</Link>
        </div>
      </div>
    </div>
  );
}