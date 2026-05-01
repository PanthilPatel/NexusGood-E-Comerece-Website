import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { register, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Welcome to ShopElite!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-space-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        <div className="text-center space-y-2">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl shadow-xl shadow-secondary/40 mb-6">
              <UserPlus className="text-white" size={32} />
           </div>
           <h2 className="text-4xl font-outfit font-bold text-white tracking-tight">Create Account</h2>
           <p className="text-slate-400 font-light">Join our exclusive community today.</p>
        </div>

        <div className="glass-card p-8 md:p-10 space-y-8">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                 <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Julian Alexander"
                      className="input-field pl-12"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors" size={18} />
                    <input 
                      type="email" 
                      placeholder="name@example.com"
                      className="input-field pl-12"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="input-field"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="input-field"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full px-6 py-4 bg-secondary hover:bg-secondary-light text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-secondary/20 hover:shadow-secondary/40 flex items-center justify-center gap-3 group"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Get Started'}
                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
           </form>

           <div className="text-center text-sm text-slate-500">
              Already a member? <Link to="/login" className="text-secondary hover:underline font-bold">Sign In</Link>
           </div>
        </div>
      </div>
    </div>
  );
}