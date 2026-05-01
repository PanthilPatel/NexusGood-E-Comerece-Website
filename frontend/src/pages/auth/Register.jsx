import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, ArrowRight, UserPlus,
  Phone, MapPin, ChevronRight, ChevronLeft,
  CheckCircle, Eye, EyeOff
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STEPS = ['Account', 'Contact & Address'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    referralCode: '',
  });

  const { register, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validateStep1 = () => {
    if (!form.name.trim()) { toast.error('Please enter your name'); return false; }
    if (!form.email.trim()) { toast.error('Please enter your email'); return false; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.phone,
        {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        form.referralCode
      );
      toast.success('Welcome to NexusGood! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const inputCls = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030712] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 animate-fade-in relative z-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 mb-2">
            <UserPlus className="text-white" size={26} />
          </div>
          <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-sm">Join NexusGood and start shopping smarter.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  active ? 'bg-indigo-600 text-white' :
                  done ? 'bg-emerald-600/20 text-emerald-400' :
                  'bg-white/5 text-slate-500'
                }`}>
                  {done
                    ? <CheckCircle size={12} />
                    : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">{n}</span>
                  }
                  {label}
                </div>
                {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-700" />}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-[#0f172a] border border-white/[0.07] rounded-3xl p-8 space-y-5">

          {/* ── STEP 1: Account Details ── */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" className={`${inputCls} pl-11`} placeholder="e.g. Rakesh Sharma"
                    value={form.name} onChange={set('name')} required />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" className={`${inputCls} pl-11`} placeholder="name@example.com"
                    value={form.email} onChange={set('email')} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type={showPassword ? 'text' : 'password'} className={`${inputCls} pl-11 pr-11`}
                      placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Confirm *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="password" className={`${inputCls} pl-11`}
                      placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Referral Code (Optional)</label>
                <div className="relative">
                  <UserPlus size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" className={`${inputCls} pl-11 uppercase`} placeholder="e.g. ELITE123"
                    value={form.referralCode} onChange={set('referralCode')} />
                </div>
              </div>

              {/* Password strength */}
              {form.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                        form.password.length >= i * 3
                          ? i <= 1 ? 'bg-rose-500' : i <= 2 ? 'bg-amber-500' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                          : 'bg-white/10'
                      }`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {form.password.length < 6 ? 'Too short' : form.password.length < 9 ? 'Weak' : form.password.length < 12 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}

              <button type="button" onClick={() => { if (validateStep1()) setStep(2); }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-2">
                Continue <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── STEP 2: Contact & Address ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="tel" className={`${inputCls} pl-11`} placeholder="10-digit mobile number"
                    value={form.phone} maxLength={10}
                    onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) setForm(f => ({ ...f, phone: v })); }}
                    required />
                </div>
                <p className="text-[10px] text-slate-600 mt-1">Used for delivery updates and OTP verification.</p>
              </div>

              <div className="pt-1">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-indigo-400" />
                  <p className="text-sm font-bold text-white">Default Delivery Address</p>
                  <span className="text-[10px] text-slate-500 font-medium">(saves time at checkout)</span>
                </div>

                <div className="space-y-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Street / House No. / Area *</label>
                    <input className={inputCls} placeholder="e.g. 42 MG Road, Apartment 3B"
                      value={form.street} onChange={set('street')} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">City *</label>
                      <input className={inputCls} placeholder="e.g. Surat"
                        value={form.city} onChange={set('city')} required />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">State *</label>
                      <input className={inputCls} placeholder="e.g. Gujarat"
                        value={form.state} onChange={set('state')} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Pincode *</label>
                    <input className={inputCls} placeholder="6-digit pincode"
                      value={form.pincode} maxLength={6}
                      onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 6) setForm(f => ({ ...f, pincode: v })); }}
                      required />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold rounded-xl text-sm transition-all">
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="submit" disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                  {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                    : <><UserPlus size={16} /> Create Account</>
                  }
                </button>
              </div>

              <p className="text-center text-xs text-slate-600">
                You can update your address anytime from your profile.
              </p>
            </form>
          )}

          <div className="text-center text-sm text-slate-500 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
