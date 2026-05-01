import { useState, useEffect } from 'react';
import { 
  Star, CheckCircle, XCircle, Trash2, 
  Search, Filter, User, Package, MessageSquare 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); // pending | approved | rejected
  const [search, setSearch] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/admin/all', { params: { status: filter } });
      setReviews(res.data.data);
    } catch (err) {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  const handleModerate = async (id, status) => {
    try {
      await api.patch(`/reviews/${id}/moderate`, { status });
      toast.success(`Review ${status}`);
      fetchReviews();
    } catch (err) {
      toast.error('Moderation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted.');
      fetchReviews();
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  const filtered = reviews.filter(r => 
    r.comment.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    r.product?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Review Moderation</h1>
          <p className="text-sm text-slate-500 mt-1">Approve or reject customer feedback.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search reviews, users or products..." 
            className="w-full bg-[#030712]/50 border border-white/10 pl-12 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="bg-[#030712]/50 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-white uppercase tracking-widest outline-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Review List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center glass-card border-white/5 space-y-4">
             <MessageSquare size={48} className="text-slate-700 mx-auto" />
             <p className="text-slate-500 italic">No reviews found in this category.</p>
          </div>
        ) : filtered.map(review => (
          <div key={review._id} className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group relative overflow-hidden">
             {review.status === 'pending' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}
             
             <div className="flex flex-col lg:flex-row gap-8">
                {/* Product & User Info */}
                <div className="lg:w-64 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                         <User size={20} />
                      </div>
                      <div>
                         <p className="font-bold text-white text-sm">{review.user?.name}</p>
                         <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{review.user?.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                      <Package size={16} className="text-slate-500" />
                      <p className="text-xs font-bold text-slate-300 truncate">{review.product?.name}</p>
                   </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex gap-1 text-amber-500">
                         {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                         ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                         {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                   </div>
                   <p className="text-slate-300 text-sm leading-relaxed italic">"{review.comment}"</p>
                   
                   <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        review.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        review.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                         {review.status}
                      </span>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col justify-end gap-2 pt-4 lg:pt-0">
                   {review.status !== 'approved' && (
                      <button 
                        onClick={() => handleModerate(review._id, 'approved')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-xs font-bold transition-all"
                      >
                         <CheckCircle size={14} /> Approve
                      </button>
                   )}
                   {review.status !== 'rejected' && (
                      <button 
                        onClick={() => handleModerate(review._id, 'rejected')}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all"
                      >
                         <XCircle size={14} /> Reject
                      </button>
                   )}
                   <button 
                      onClick={() => handleDelete(review._id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                   >
                      <Trash2 size={16} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
