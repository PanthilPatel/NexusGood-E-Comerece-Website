import { useState, useEffect } from 'react';
import {
  X, Upload, Package, DollarSign, Tag, Info,
  CheckCircle2, ChevronDown, Truck, Percent,
  Palette, Plus, Trash2, Shield
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const inputCls = 'w-full bg-[#030712]/60 border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600';
const labelCls = 'text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5';

const PRESET_COLORS = [
  { name: 'Black',  hex: '#000000' }, { name: 'White',  hex: '#ffffff' },
  { name: 'Red',    hex: '#ef4444' }, { name: 'Blue',   hex: '#3b82f6' },
  { name: 'Green',  hex: '#22c55e' }, { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' }, { name: 'Orange', hex: '#f97316' },
  { name: 'Pink',   hex: '#ec4899' }, { name: 'Gray',   hex: '#6b7280' },
  { name: 'Navy',   hex: '#1e3a5f' }, { name: 'Brown',  hex: '#92400e' },
];

const EMPTY_FORM = {
  name: '', description: '', price: '', comparePrice: '',
  stock: '', category: '', tags: '', isActive: true,
  shippingFee: '', gst: '', colors: [],
  isFlashSale: false, flashSalePrice: '', flashSaleEnd: '',
  profitType: 'percentage', profitValue: '',
  isFeatured: false,
};

export default function ProductModal({ isOpen, onClose, product = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [colorInput, setColorInput] = useState({ name: '', hex: '#6366f1' });

  useEffect(() => {
    if (!isOpen) return;
    fetchCategories();
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        comparePrice: product.comparePrice ?? '',
        stock: product.stock ?? '',
        category: product.category?._id || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        isActive: product.isActive ?? true,
        shippingFee: product.shippingFee ?? '',
        gst: product.gst ?? '',
        colors: product.colors || [],
        isFlashSale: product.isFlashSale ?? false,
        flashSalePrice: product.flashSalePrice ?? '',
        flashSaleEnd: product.flashSaleEnd ? new Date(product.flashSaleEnd).toISOString().slice(0, 16) : '',
        profitType: product.profitType || 'percentage',
        profitValue: product.profitValue ?? '',
        isFeatured: product.isFeatured ?? false,
      });
    } else {
      setFormData(EMPTY_FORM);
      setFiles([]);
    }
  }, [isOpen, product]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data?.data || []);
    } catch {}
  };

  const set = (field) => (e) => {
    const { value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [field]: type === 'checkbox' ? checked : value }));
  };

  const addColor = (c) => {
    if (!c.name.trim()) return;
    if (formData.colors.find(x => x.hex === c.hex)) return;
    setFormData(prev => ({ ...prev, colors: [...prev.colors, { name: c.name, hex: c.hex }] }));
    setColorInput({ name: '', hex: '#6366f1' });
  };

  const removeColor = (hex) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c.hex !== hex) }));
  };

  // Computed: price with GST
  const priceWithGST = formData.price && formData.gst
    ? Math.round(Number(formData.price) * (1 + Number(formData.gst) / 100))
    : null;

  // Computed: Profit calculation
  const calculatedProfit = () => {
    if (!formData.price || !formData.profitValue) return 0;
    if (formData.profitType === 'percentage') {
      return Math.round((Number(formData.price) * Number(formData.profitValue)) / 100);
    }
    return Number(formData.profitValue);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'colors') fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      files.forEach(f => fd.append('images', f));

      if (product) {
        await api.put(`/products/${product._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated.');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030712]/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600/15 rounded-xl flex items-center justify-center text-indigo-400">
              <Package size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{product ? 'Edit Product' : 'Add New Product'}</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Inventory Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* Name */}
          <div>
            <label className={labelCls}><Info size={11} /> Product Name *</label>
            <input value={formData.name} onChange={set('name')} required className={inputCls} placeholder="e.g. OnePlus Bullets Wireless Z2" />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description *</label>
            <textarea value={formData.description} onChange={set('description')} required rows={3}
              className={`${inputCls} resize-none`} placeholder="Describe the product features..." />
          </div>

          {/* Pricing & Profit Strategy */}
          <div className="space-y-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <DollarSign size={11} /> Pricing & Profit Strategy
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Selling Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>
                  <input type="number" min="0" value={formData.price} onChange={set('price')} required
                    className={`${inputCls} pl-7`} placeholder="2999" />
                </div>
                <p className="text-[10px] text-slate-600 mt-1">Price shown to customer</p>
              </div>
              <div>
                <label className={labelCls}>Original / MRP (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>
                  <input type="number" min="0" value={formData.comparePrice} onChange={set('comparePrice')}
                    className={`${inputCls} pl-7`} placeholder="3999" />
                </div>
                <p className="text-[10px] text-slate-600 mt-1">Shown with strikethrough</p>
              </div>
            </div>

            {/* Profit Logic Section */}
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Profit Strategy</label>
                <div className="flex bg-[#030712] rounded-lg p-1 border border-white/5">
                  <button 
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, profitType: 'percentage' }))}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${formData.profitType === 'percentage' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                  >
                    Percentage
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, profitType: 'flat' }))}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${formData.profitType === 'flat' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                  >
                    Flat Value
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className={labelCls}>{formData.profitType === 'percentage' ? 'Profit Margin (%)' : 'Flat Profit (₹)'}</label>
                  <div className="relative">
                    {formData.profitType === 'flat' && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>}
                    <input 
                      type="number" 
                      min="0" 
                      value={formData.profitValue} 
                      onChange={set('profitValue')}
                      className={`${inputCls} ${formData.profitType === 'flat' ? 'pl-7' : 'pr-8'}`} 
                      placeholder={formData.profitType === 'percentage' ? '20' : '500'} 
                    />
                    {formData.profitType === 'percentage' && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">%</span>}
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Estimated Profit</p>
                   <p className="text-xl font-outfit font-bold text-emerald-400">₹{calculatedProfit().toLocaleString('en-IN')}</p>
                   {formData.price && (
                     <p className="text-[10px] text-slate-600 italic">Net to Business: ₹{(Number(formData.price) - calculatedProfit()).toLocaleString('en-IN')}</p>
                   )}
                </div>
              </div>
            </div>

            {/* GST & Shipping */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}><Percent size={11} /> GST (%)</label>
                <div className="relative">
                  <input type="number" min="0" max="100" value={formData.gst} onChange={set('gst')}
                    className={`${inputCls} pr-8`} placeholder="18" />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">%</span>
                </div>
                {priceWithGST && (
                  <p className="text-[10px] text-emerald-400 mt-1">Price incl. GST: ₹{priceWithGST.toLocaleString('en-IN')}</p>
                )}
              </div>
              <div>
                <label className={labelCls}><Truck size={11} /> Shipping Fee (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>
                  <input type="number" min="0" value={formData.shippingFee} onChange={set('shippingFee')}
                    className={`${inputCls} pl-7`} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Price preview */}
            {formData.price && formData.comparePrice && Number(formData.comparePrice) > Number(formData.price) && (
              <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <span className="text-xs text-slate-400">Customer sees:</span>
                <span className="text-sm font-bold text-white">₹{Number(formData.price).toLocaleString('en-IN')}</span>
                <span className="text-sm text-slate-500 line-through">₹{Number(formData.comparePrice).toLocaleString('en-IN')}</span>
                <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/15 rounded-full">
                   {Math.round(((Number(formData.comparePrice) - Number(formData.price)) / Number(formData.comparePrice)) * 100)}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Home Page Featured Node */}
          <div className={`p-5 border rounded-2xl space-y-4 transition-all ${formData.isFeatured ? 'bg-indigo-600/10 border-indigo-600/30 shadow-lg shadow-indigo-600/20' : 'bg-[#030712]/40 border-white/10'}`}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.isFeatured ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-white/5 text-slate-500'}`}>
                      <Shield size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">Curated Home Page Feature</h4>
                      <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Home Page Priority</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   {formData.isFeatured && (
                     <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] animate-pulse">Live</span>
                   )}
                   <input 
                      type="checkbox" 
                      checked={formData.isFeatured} 
                      onChange={set('isFeatured')}
                      className="w-5 h-5 accent-indigo-600 cursor-pointer"
                   />
                </div>
             </div>
          </div>

          {/* Flash Sale Section */}
          <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
                      <Percent size={16} />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">Flash Sale Scheduler</h4>
                      <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest">Promotion Logic</p>
                   </div>
                </div>
                <input 
                   type="checkbox" 
                   checked={formData.isFlashSale} 
                   onChange={set('isFlashSale')}
                   className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
             </div>

             {formData.isFlashSale && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div>
                      <label className={labelCls}>Flash Price (₹)</label>
                      <input 
                         type="number" 
                         value={formData.flashSalePrice} 
                         onChange={set('flashSalePrice')}
                         className={inputCls} 
                         placeholder="999" 
                      />
                   </div>
                   <div>
                      <label className={labelCls}>End Date & Time</label>
                      <input 
                         type="datetime-local" 
                         value={formData.flashSaleEnd} 
                         onChange={set('flashSaleEnd')}
                         className={inputCls} 
                      />
                   </div>
                </div>
             )}
          </div>



          {/* Stock + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}><Package size={11} /> Stock *</label>
              <input type="number" min="0" value={formData.stock} onChange={set('stock')} required
                className={inputCls} placeholder="100" />
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <div className="relative">
                <select value={formData.category} onChange={set('category')} required
                  className={`${inputCls} appearance-none cursor-pointer`}>
                  <option value="" className="bg-[#0f172a]">Select category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id} className="bg-[#0f172a]">{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}><Tag size={11} /> Tags (comma separated)</label>
            <input value={formData.tags} onChange={set('tags')} className={inputCls} placeholder="wireless, earphones, oneplus" />
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <label className={labelCls}><Palette size={11} /> Available Colors</label>

            {/* Preset swatches */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => {
                const selected = formData.colors.find(x => x.hex === c.hex);
                return (
                  <button key={c.hex} type="button"
                    onClick={() => selected ? removeColor(c.hex) : addColor(c)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${selected ? 'border-white scale-110 ring-2 ring-indigo-500 ring-offset-1 ring-offset-[#0f172a]' : 'border-white/20'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>

            {/* Custom color */}
            <div className="flex items-center gap-2">
              <input type="color" value={colorInput.hex}
                onChange={e => setColorInput(p => ({ ...p, hex: e.target.value }))}
                className="w-9 h-9 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0.5" />
              <input value={colorInput.name} onChange={e => setColorInput(p => ({ ...p, name: e.target.value }))}
                placeholder="Color name (e.g. Midnight Blue)"
                className={`${inputCls} flex-1`} />
              <button type="button" onClick={() => addColor(colorInput)}
                className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                <Plus size={13} /> Add
              </button>
            </div>

            {/* Selected colors */}
            {formData.colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.colors.map(c => (
                  <div key={c.hex} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white">
                    <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: c.hex }} />
                    {c.name}
                    <button type="button" onClick={() => removeColor(c.hex)} className="text-slate-500 hover:text-rose-400 transition-colors ml-0.5">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <label className={labelCls}><Upload size={11} /> Product Images</label>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-indigo-500/30 transition-all cursor-pointer relative group">
              <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))}
                className="absolute inset-0 opacity-0 cursor-pointer" />
              <Upload size={24} className="text-slate-600 group-hover:text-indigo-400 transition-colors mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">
                {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Click or drag images here'}
              </p>
              <p className="text-xs text-slate-600 mt-1">PNG, JPG, WEBP up to 10MB each</p>
            </div>
            {product?.images?.length > 0 && files.length === 0 && (
              <p className="text-[11px] text-slate-500 mt-1.5">
                {product.images.length} existing image{product.images.length > 1 ? 's' : ''} · Upload new ones to replace
              </p>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <input type="checkbox" checked={formData.isActive} onChange={set('isActive')}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer" />
            <div>
              <p className="text-sm font-semibold text-white">Active / Visible</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Show this product in the store</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving...</>
              : <><CheckCircle2 size={16} /> {product ? 'Save Changes' : 'Create Product'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
