import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, MoreVertical, Package, AlertCircle, Eye, EyeOff } from 'lucide-react';
import useProductStore from '../../store/productStore';
import toast from 'react-hot-toast';
import ProductModal from '../../components/admin/ProductModal';

export default function AdminProducts() {
  const { products, fetchProducts, isLoading, error, deleteProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCreate = () => { setSelectedProduct(null); setIsModalOpen(true); };
  const handleEdit = (product) => { setSelectedProduct(product); setIsModalOpen(true); };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product removed successfully');
        fetchProducts();
      } catch { toast.error('Failed to delete product'); }
    }
  };

  const displayProducts = Array.isArray(products) ? products : [];

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* ── MODAL — anchored to fixed viewport container ── */}
      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          onSuccess={() => { fetchProducts(); setIsModalOpen(false); }}
        />
      )}

      {/* ── SCROLLABLE CONTENT ── */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar p-8 transition-all duration-200 ${isModalOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">

          {/* Error state */}
          {error && (
            <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-4">
              <AlertCircle size={40} className="text-rose-500 mx-auto" />
              <p className="text-rose-500 font-bold">{error}</p>
              <button onClick={fetchProducts} className="bg-rose-500 text-white px-6 py-2 rounded-xl text-sm font-bold">Retry</button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Inventory</h1>
              <p className="text-sm text-slate-500 font-light">Manage your product catalog and stock levels.</p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest"
            >
              <Plus size={18} /> New Product
            </button>
          </div>

          {/* Toolbar */}
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
            <div className="relative w-full md:w-96 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full bg-[#030712]/50 border border-white/10 pl-12 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Total: {displayProducts.length} Items
            </span>
          </div>

          {/* Empty state */}
          {!isLoading && displayProducts.length === 0 && !error && (
            <div className="p-12 bg-[#0f172a] border border-white/5 rounded-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <Package size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">No Products Yet</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm">Add your first product to get started.</p>
              </div>
              <button onClick={handleCreate} className="bg-indigo-600 text-white px-8 py-2 rounded-xl text-sm font-bold">
                Add Product
              </button>
            </div>
          )}

          {/* Table */}
          {(isLoading || displayProducts.length > 0) && (
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="px-8 py-5">Product Details</th>
                      <th className="px-8 py-5">Category</th>
                      <th className="px-8 py-5 text-center">Price</th>
                      <th className="px-8 py-5 text-center">Availability</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            <td colSpan="5" className="px-8 py-10">
                              <div className="h-8 w-full bg-white/5 rounded-xl animate-pulse" />
                            </td>
                          </tr>
                        ))
                      : displayProducts
                          .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map(p => (
                            <tr key={p._id} className="hover:bg-white/[0.01] transition-colors group">
                              {/* Product details and actions as before... */}
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-[#030712] rounded-xl border border-white/5 overflow-hidden flex-shrink-0">
                                    <img
                                      src={p.images?.[0]?.url || '/placeholder.jpg'}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      alt=""
                                      onError={e => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm text-white tracking-tight">{p.name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
                                      SKU: {p._id.slice(-6).toUpperCase()}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {p.category?.name || 'Standard'}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <p className="font-bold text-sm text-white">₹{p.price?.toLocaleString('en-IN') || '0'}</p>
                                {p.comparePrice > p.price && (
                                  <p className="text-xs text-slate-500 line-through">₹{p.comparePrice?.toLocaleString('en-IN')}</p>
                                )}
                              </td>
                              <td className="px-8 py-6 text-center">
                                <div className="inline-flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${p.stock < 10 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                  <span className="text-xs font-bold text-white">{p.stock || 0} Units</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-1 items-center">
                                  <button onClick={() => handleEdit(p)} className="p-2.5 text-slate-500 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all">
                                    <Edit2 size={15} />
                                  </button>
                                  <button onClick={() => handleDelete(p._id)} className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
