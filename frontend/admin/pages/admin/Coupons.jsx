import { useState, useEffect } from 'react';
import { 
  Plus, Search, Ticket, Calendar, 
  Trash2, Edit2, CheckCircle, XCircle, 
  Tag, Percent, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/coupons');
      console.log('Coupons Data:', res.data);
      if (res.data?.success && res.data.data) {
        const couponsData = res.data.data || [];
        setCoupons(Array.isArray(couponsData) ? couponsData : []);
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error('Coupons Fetch Error:', err);
      setError(err.response?.data?.message || 'Failed to connect to promotion server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await api.delete(`/coupons/${id}`);
        toast.success('Promotion deleted.');
        setCoupons(coupons.filter(c => c._id !== id));
      } catch (err) { toast.error('Failed to delete promotion'); }
    }
  };

  if (error) {
    return (
      <div className="p-12 glass-card border-rose-500/20 text-center space-y-6">
        <AlertCircle size={48} className="text-rose-500 mx-auto" />
        <p className="text-rose-500 font-bold">{error}</p>
        <button onClick={fetchCoupons} className="bg-rose-500 text-white px-8 py-2 rounded-xl text-sm font-bold">Retry Sync</button>
      </div>
    );
  }

  const displayCoupons = Array.isArray(coupons) ? coupons : [];

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="space-y-1">
            <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Promotions</h1>
            <p className="text-sm text-slate-500 font-light">Manage exclusive offer codes and promotional campaigns.</p>
         </div>
         <div className="flex gap-3">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest">
               <Plus size={18} /> New Promotion
            </button>
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
         {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
            ))
         ) : displayCoupons.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card border-dashed border-white/10">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                  <Ticket size={32} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">No active promotions</h3>
               <p className="text-slate-500 max-w-xs mx-auto">Generate your first promotional code to start rewarding your members.</p>
            </div>
         ) : displayCoupons.map((c) => (
           <div key={c._id} className="relative group overflow-hidden glass-card p-8 space-y-8 bg-gradient-to-br from-indigo-500/5 to-transparent hover:border-indigo-500/30 transition-all shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleDelete(c._id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                    <Trash2 size={16} />
                 </button>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner border border-indigo-500/20">
                    {c.discountType === 'percentage' ? <Percent size={24} /> : <Tag size={24} />}
                 </div>
                 <div>
                    <p className="text-2xl font-bold text-white tracking-tight">{c.code}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Reward Code</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-slate-500 font-medium">Discount</span>
                    <span className="font-bold text-white">{c.discountValue}{c.discountType === 'percentage' ? '%' : ' INR'} OFF</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-slate-500 font-medium">Min Order</span>
                    <span className="font-bold text-white">₹{c.minOrderAmount || 0}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className={`flex items-center gap-1.5 font-bold ${c.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                       {c.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                       {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                 </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                 <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Expires {new Date(c.expiresAt).toLocaleDateString()}
                    </span>
                 </div>
                 <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Edit2 size={16} />
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}