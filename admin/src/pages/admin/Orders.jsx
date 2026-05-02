import { useState, useEffect } from 'react';
import { Search, ExternalLink, AlertCircle, ChevronLeft, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/orders', {
        params: { status: statusFilter === 'all' ? undefined : statusFilter },
      });
      if (res.data?.success && res.data.data) {
        setOrders(Array.isArray(res.data.data.orders) ? res.data.data.orders : []);
      } else {
        setOrders([]);
      }
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated.');
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch {
      toast.error('Failed to update status.');
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedOrder]);

  if (error) {
    return (
      <div className="p-12 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-center space-y-4">
        <AlertCircle size={40} className="text-rose-500 mx-auto" />
        <p className="text-rose-400 font-bold">{error}</p>
        <button onClick={fetchOrders} className="px-6 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold">Retry</button>
      </div>
    );
  }

  const displayOrders = Array.isArray(orders) ? orders : [];

  return (
    <div className="h-full flex flex-col relative overflow-hidden">

      {/* ── ORDER DETAIL PANEL — Global Viewport Overlay ── */}
      {selectedOrder && (
        <div 
          className="fixed top-0 right-0 bottom-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300"
          style={{ 
            left: 'var(--sidebar-width, 18rem)',
            width: 'calc(100vw - var(--sidebar-width, 18rem))'
          }}
        >
          {/* Click-to-close overlay */}
          <div className="absolute inset-0" onClick={() => setSelectedOrder(null)} />
          
          {/* Modal Card - Strictly Centered */}
          <div className="relative w-full max-w-2xl m-0 p-0 bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all duration-300">
            {/* Fixed Header */}
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Acquisition Details</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Order Ref: {selectedOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                <ChevronLeft size={20} className="rotate-90" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 overscroll-contain [transform:translateZ(0)]">
              {/* Customer & Shipping */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><User size={12} /> Requester Profile</p>
                  <p className="text-sm font-bold text-white">{selectedOrder.user?.name || 'Guest'}</p>
                  <p className="text-xs text-slate-400">{selectedOrder.user?.email}</p>
                  <p className="text-xs text-slate-400">{selectedOrder.user?.phone}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Delivery Coordinates</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedOrder.shippingAddress?.street}<br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br />
                    {selectedOrder.shippingAddress?.zipCode}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><ShoppingBag size={12} /> Artifact Manifest</p>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#030712] border border-white/5 flex items-center justify-center text-slate-600 overflow-hidden">
                          {item.product?.images?.[0]?.url
                            ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                            : <ShoppingBag size={14} />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.product?.name || 'Product'}</p>
                          <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <p className="font-bold text-white text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Payment</span>
                  <span className="font-semibold text-white">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Status</span>
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleStatusUpdate(selectedOrder._id, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-indigo-400 px-3 py-1.5 focus:outline-none focus:border-indigo-500/50 cursor-pointer hover:bg-white/10 transition-all uppercase tracking-widest"
                  >
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s} className="bg-[#0f172a]">{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between text-xl font-bold text-white pt-2">
                  <span>Grand Total</span>
                  <span className="text-indigo-500 font-outfit">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT — blurred when detail panel is open ── */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar p-8 transition-all duration-200 ${selectedOrder ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Orders</h1>
            <p className="text-sm text-slate-500 font-light">Monitor and manage all customer orders.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full bg-[#030712]/50 border border-white/10 pl-12 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all border ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                    : 'bg-white/5 text-slate-500 border-white/10 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5 text-center">Total</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="5" className="px-8 py-10">
                          <div className="h-8 w-full bg-white/5 rounded-xl animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : displayOrders.length === 0
                  ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-slate-500 italic">
                        No orders found.
                      </td>
                    </tr>
                  )
                  : displayOrders.map(o => (
                    <tr key={o._id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6 font-bold text-sm text-indigo-400 tracking-tight">
                        #{o._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 font-bold text-[10px] uppercase">
                            {o.user?.name?.[0] || 'G'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">{o.user?.name || 'Guest'}</p>
                            <p className="text-[10px] text-slate-500">{o.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center font-bold text-white">
                        ₹{o.totalAmount?.toLocaleString('en-IN') || '0'}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <select
                          value={o.status}
                          onChange={e => handleStatusUpdate(o._id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white px-3 py-1.5 focus:outline-none focus:border-indigo-500/50 cursor-pointer hover:bg-white/10 transition-all uppercase tracking-widest"
                        >
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                            <option key={s} value={s} className="bg-[#0f172a]">{s.toUpperCase()}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <ExternalLink size={16} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
