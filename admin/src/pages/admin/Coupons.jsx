import { useState, useEffect } from 'react';
import {
  Plus, Ticket, Calendar, Trash2, Tag,
  Percent, AlertCircle, X, ToggleLeft, ToggleRight,
  Edit3, Users, CheckCircle, XCircle, Search, Copy
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  code: '', discountType: 'percentage', discountValue: '',
  minOrderAmount: '', maxDiscount: '', usageLimit: '', expiresAt: ''
};

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal state — mode: 'create' | 'edit' | null
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/coupons');
      setCoupons(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load promotions.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit = (c) => {
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minOrderAmount: String(c.minOrderAmount || ''),
      maxDiscount: String(c.maxDiscount || ''),
      usageLimit: String(c.usageLimit || ''),
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : '',
      _id: c._id,
    });
    setModal('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        usageLimit: Number(form.usageLimit) || 0,
        expiresAt: form.expiresAt,
      };

      if (modal === 'create') {
        const res = await api.post('/coupons', payload);
        setCoupons(prev => [res.data.coupon, ...prev]);
        toast.success('Coupon created.');
      } else {
        const res = await api.put(`/coupons/${form._id}`, payload);
        setCoupons(prev => prev.map(c => c._id === form._id ? res.data.coupon : c));
        toast.success('Coupon updated.');
      }
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/coupons/${id}`);
      setCoupons(prev => prev.map(c => c._id === id ? res.data.coupon : c));
      toast.success(res.data.message);
    } catch { toast.error('Failed to toggle coupon.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon permanently?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(prev => prev.filter(c => c._id !== id));
      toast.success('Coupon deleted.');
    } catch { toast.error('Failed to delete coupon.'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied "${code}"`);
  };

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const isExpired = (date) => new Date(date) < new Date();

  if (error) return (
    <div className="p-12 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-center space-y-4">
      <AlertCircle size={40} className="text-rose-500 mx-auto" />
      <p className="text-rose-400 font-bold">{error}</p>
      <button onClick={fetchCoupons} className="px-6 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold">Retry</button>
    </div>
  );

  return (
    <>
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Promotions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage coupon codes and discount campaigns.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Coupons', value: coupons.length, color: 'text-white' },
          { label: 'Active', value: coupons.filter(c => c.isActive && !isExpired(c.expiresAt)).length, color: 'text-emerald-400' },
          { label: 'Expired', value: coupons.filter(c => isExpired(c.expiresAt)).length, color: 'text-rose-400' },
          { label: 'Total Uses', value: coupons.reduce((s, c) => s + (c.usedCount || 0), 0), color: 'text-indigo-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f172a] border border-white/[0.07] rounded-2xl px-5 py-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by coupon code..."
          className="w-full md:w-80 bg-[#0f172a] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
      </div>

      {/* Table */}
      <div className="bg-[#0f172a] border border-white/[0.07] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Ticket size={40} className="text-slate-700 mx-auto" />
            <p className="text-slate-500 font-medium">{search ? 'No coupons match your search.' : 'No coupons yet. Create your first one!'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.06] text-left">
                  {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(c => {
                  const expired = isExpired(c.expiresAt);
                  const active = c.isActive && !expired;
                  const usagePct = c.usageLimit > 0 ? Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100)) : null;

                  return (
                    <tr key={c._id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Code */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.discountType === 'percentage' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                            {c.discountType === 'percentage' ? <Percent size={14} /> : <Tag size={14} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-white tracking-wider">{c.code}</span>
                              <button onClick={() => copyCode(c.code)} className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-white transition-all">
                                <Copy size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-white">
                          {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} OFF
                        </span>
                        {c.maxDiscount > 0 && c.discountType === 'percentage' && (
                          <p className="text-[11px] text-slate-500 mt-0.5">Max ₹{c.maxDiscount}</p>
                        )}
                      </td>

                      {/* Min Order */}
                      <td className="px-6 py-4 text-slate-300">
                        {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : <span className="text-slate-600">None</span>}
                      </td>

                      {/* Usage */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={12} className="text-slate-500" />
                          <span className="text-slate-300">
                            {c.usedCount}{c.usageLimit > 0 ? ` / ${c.usageLimit}` : ''}
                          </span>
                        </div>
                        {usagePct !== null && (
                          <div className="mt-1.5 w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${usagePct >= 90 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${usagePct}%` }} />
                          </div>
                        )}
                      </td>

                      {/* Expires */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className={expired ? 'text-rose-400' : 'text-slate-500'} />
                          <span className={`text-xs font-medium ${expired ? 'text-rose-400' : 'text-slate-300'}`}>
                            {new Date(c.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {expired && <p className="text-[10px] text-rose-400 font-bold mt-0.5">EXPIRED</p>}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          active
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : expired
                            ? 'bg-slate-500/15 text-slate-500 border-slate-500/20'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}>
                          {active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          {expired ? 'Expired' : active ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {/* Toggle active */}
                          <button onClick={() => handleToggle(c._id)}
                            title={c.isActive ? 'Deactivate' : 'Activate'}
                            className={`p-2 rounded-lg transition-all ${c.isActive ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                            {c.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          {/* Edit */}
                          <button onClick={() => openEdit(c)}
                            className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all">
                            <Edit3 size={15} />
                          </button>
                          {/* Delete */}
                          <button onClick={() => handleDelete(c._id)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {/* Create / Edit Modal */}
    {modal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">{modal === 'create' ? 'New Coupon' : 'Edit Coupon'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{modal === 'create' ? 'Create a new discount code' : `Editing ${form.code}`}</p>
            </div>
            <button onClick={() => setModal(null)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Code */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Coupon Code *</label>
              <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className={inputCls} placeholder="e.g. SAVE20" disabled={modal === 'edit'} />
              {modal === 'edit' && <p className="text-[10px] text-slate-600 mt-1">Code cannot be changed after creation.</p>}
            </div>

            {/* Type + Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Discount Type *</label>
                <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}
                  className={inputCls}>
                  <option value="percentage" className="bg-[#0f172a]">Percentage (%)</option>
                  <option value="flat" className="bg-[#0f172a]">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                  Value * {form.discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input required type="number" min="1" value={form.discountValue}
                  onChange={e => setForm({ ...form, discountValue: e.target.value })}
                  className={inputCls} placeholder={form.discountType === 'percentage' ? '20' : '100'} />
              </div>
            </div>

            {/* Min Order + Max Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Min Order Amount (₹)</label>
                <input type="number" min="0" value={form.minOrderAmount}
                  onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                  className={inputCls} placeholder="0 = no minimum" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                  Max Discount (₹) {form.discountType === 'flat' && <span className="text-slate-600 normal-case">(n/a for flat)</span>}
                </label>
                <input type="number" min="0" value={form.maxDiscount}
                  onChange={e => setForm({ ...form, maxDiscount: e.target.value })}
                  className={inputCls} placeholder="0 = no cap"
                  disabled={form.discountType === 'flat'} />
              </div>
            </div>

            {/* Usage Limit + Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Usage Limit</label>
                <input type="number" min="0" value={form.usageLimit}
                  onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                  className={inputCls} placeholder="0 = unlimited" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Expiry Date *</label>
                <input required type="date" value={form.expiresAt}
                  onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                  className={inputCls} min={new Date().toISOString().slice(0, 10)} />
              </div>
            </div>

            {/* Preview */}
            {form.discountValue && (
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
                <span className="font-bold">Preview: </span>
                {form.discountType === 'percentage'
                  ? `${form.discountValue}% off${form.maxDiscount > 0 ? `, max ₹${form.maxDiscount}` : ''}${form.minOrderAmount > 0 ? ` on orders above ₹${form.minOrderAmount}` : ''}`
                  : `₹${form.discountValue} flat off${form.minOrderAmount > 0 ? ` on orders above ₹${form.minOrderAmount}` : ''}`
                }
                {form.usageLimit > 0 ? ` · ${form.usageLimit} uses max` : ' · Unlimited uses'}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition-all disabled:opacity-50">
                {saving ? 'Saving...' : modal === 'create' ? 'Create Coupon' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
