import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Note: We'll add a simple endpoint for this or just simulate for now
      // await api.post('/auth/forgot-password', { email });
      
      // Simulate API call for now to ensure UI works
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-space-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        <div className="text-center space-y-2">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-xl shadow-primary/40 mb-6">
              <Mail className="text-white" size={32} />
           </div>
           <h2 className="text-4xl font-outfit font-bold text-white tracking-tight">
             {isSent ? 'Check Your Inbox' : 'Forgot Password?'}
           </h2>
           <p className="text-slate-400 font-light">
             {isSent 
               ? `We've sent a recovery link to ${email}`
               : 'No worries! Enter your email and we will send you a reset link.'}
           </p>
        </div>

        <div className="glass-card p-8 md:p-10 space-y-8">
           {!isSent ? (
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

                <button 
                  type="submit" 
                  className="w-full btn-primary py-4 flex items-center justify-center gap-3 group"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                  {!isLoading && <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
             </form>
           ) : (
             <div className="space-y-6">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                   <p className="text-sm text-emerald-400">
                     Reset link expires in 1 hour. If you don't see it, check your spam folder.
                   </p>
                </div>
                <button 
                  onClick={() => setIsSent(false)}
                  className="w-full py-4 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  Try another email
                </button>
             </div>
           )}

           <div className="text-center text-sm text-slate-500">
              Wait, I remember! <Link to="/login" className="text-primary hover:underline font-bold">Sign in</Link>
           </div>
        </div>

        <div className="text-center">
           <Link to="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors uppercase font-bold tracking-widest flex items-center justify-center gap-2">
             <ArrowLeft size={14} /> Back to Login
           </Link>
        </div>
      </div>
    </div>
  );
}
