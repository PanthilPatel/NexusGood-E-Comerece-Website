import { useState, useEffect } from 'react';
import { X, Upload, Package, DollarSign, Tag, Info, CheckCircle2, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProductModal({ isOpen, onClose, product = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    stock: '',
    category: '',
    tags: '',
    isActive: true
  });
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          comparePrice: product.comparePrice || '',
          stock: product.stock || '',
          category: product.category?._id || '',
          tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
          isActive: product.isActive ?? true
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          comparePrice: '',
          stock: '',
          category: '',
          tags: '',
          isActive: true
        });
        setFiles([]);
      }
    }
  }, [isOpen, product]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      files.forEach(file => {
        data.append('images', file);
      });

      if (product) {
        await api.put(`/products/${product._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030712]/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">{product ? 'Modify Inventory' : 'Add New Inventory'}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Store Management Node</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Basic Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Info size={12} /> Product Designation
              </label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-[#030712]/50 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white" 
                placeholder="Ex: Quantum X-1 Sneakers"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-[#030712]/50 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white resize-none" 
                placeholder="Elaborate on technical specifications..."
              />
            </div>
          </div>

          {/* Logistics & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={12} /> Acquisition Value (INR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                <input 
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#030712]/50 border border-white/10 pl-8 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white" 
                  placeholder="24999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Package size={12} /> Stock Volume
              </label>
              <input 
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full bg-[#030712]/50 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white" 
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Classification Node</label>
                <div className="relative">
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#030712]/50 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0f172a]">Select Category</option>
                    {categories.length > 0 ? categories.map(c => (
                      <option key={c._id} value={c._id} className="bg-[#0f172a]">{c.name}</option>
                    )) : (
                      <>
                        <option value="electronics" className="bg-[#0f172a]">Electronics & Gadgets</option>
                        <option value="apparel" className="bg-[#0f172a]">Apparel & Lifestyle</option>
                        <option value="home" className="bg-[#0f172a]">Home & Sanctuary</option>
                        <option value="digital" className="bg-[#0f172a]">Digital Artifacts</option>
                      </>
                    )}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={12} /> Index Tags
                </label>
                <input 
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full bg-[#030712]/50 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white" 
                  placeholder="modern, sleek, quantum"
                />
             </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Upload size={12} /> Visual Assets
             </label>
             <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 text-center hover:border-indigo-500/30 transition-all group cursor-pointer relative">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                   <Upload className="text-slate-500 group-hover:text-indigo-500 transition-colors" size={32} />
                   <p className="text-sm font-bold text-white">Upload Assets</p>
                   <p className="text-xs text-slate-500">{files.length > 0 ? `${files.length} files selected` : 'Drag and drop or click to browse'}</p>
                </div>
             </div>
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
             <input 
               type="checkbox"
               name="isActive"
               checked={formData.isActive}
               onChange={handleChange}
               className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer"
             />
             <div>
                <p className="text-sm font-bold text-white tracking-tight">Active Status</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Enable visual availability in the marketplace</p>
             </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-all">Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
            {product ? 'Synchronize Updates' : 'Commit to Registry'}
          </button>
        </div>
      </div>
    </div>
  );
}
