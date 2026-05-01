import { useState, useEffect } from 'react';
import { 
  Search, Eye, FileText, ChevronLeft, 
  ChevronRight, Filter, Download, Calendar,
  MoreHorizontal, ShoppingBag, Clock, ExternalLink, AlertCircle
} from 'lucide-react';
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
      const res = await api.get('/orders', { params: { status: statusFilter === 'all' ? undefined : statusFilter } });
      if (res.data?.success && res.data.data) {
        setOrders(Array.isArray(res.data.data.orders) ? res.data.data.orders : []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Orders Fetch Error:', err);
      setError('Failed to sync with acquisition database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus.toLowerCase() });
      toast.success('Acquisition synchronized.');
      setOrders(orders.map(o => o._id === orderId ? {...o, status: newStatus.toLowerCase()} : o));
    } catch (err) {
      toast.error('Sync failed.');
    }
  };

  if (error) {
    return (
      <div className="p-12 glass-card border-rose-500/20 text-center space-y-6">
        <AlertCircle size={48} className="text-rose-500 mx-auto" />
        <p className="text-rose-500 font-bold">{error}</p>
        <button onClick={fetchOrders} className="btn-primary bg-rose-600">Retry Sync</button>
      </div>
    );
  }

  const displayOrders = Array.isArray(orders) ? orders : [];

  return (
    <div className="space-y-10 animate-fade-in relative">
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Acquisition Details</h3>
                <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Ref: #{selectedOrder._id.toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                <ChevronLeft size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Customer & Shipping */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Profile</p>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">{selectedOrder.user?.name || 'Guest'}</p>
                    <p className="text-xs text-slate-400">{selectedOrder.user?.email}</p>
                    <p className="text-xs text-slate-400">{selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Destination Node</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedOrder.shippingAddress?.address}<br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inventory Dispatched</p>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-slate-500 overflow-hidden">
                          {item.product?.images?.[0]?.url ? (
                            <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : <ShoppingBag size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="font-outfit font-bold text-white text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="pt-6 border-t border-white/5 space-y-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Payment Strategy</span>
                  <span className="font-bold text-white uppercase tracking-widest">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white pt-2">
                  <span>Grand Total</span>
                  <span className="text-indigo-500 font-outfit">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="space-y-1">
            <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Acquisitions</h1>
            <p className="text-sm text-slate-500 font-light">Monitor and oversee all customer purchase cycles.</p>
         </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
         <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search acquisitions..." 
              className="w-full bg-[#030712]/50 border border-white/10 pl-12 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white" 
            />
         </div>
         <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['all', 'pending', 'processing', 'shipped', 'delivered'].map(s => (
              <button 
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all border ${
                  statusFilter === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-500 border-white/10 hover:text-white'
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
                     <th className="px-8 py-5">Order Reference</th>
                     <th className="px-8 py-5">Client Profile</th>
                     <th className="px-8 py-5 text-center">Grand Total</th>
                     <th className="px-8 py-5 text-center">Fulfillment</th>
                     <th className="px-8 py-5 text-right">Details</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan="5" className="px-8 py-10"><div className="h-8 w-full bg-white/5 rounded-xl animate-pulse" /></td></tr>
                    ))
                  ) : displayOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-slate-500 italic">No acquisitions found.</td>
                    </tr>
                  ) : displayOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-white/[0.01] transition-colors group">
                       <td className="px-8 py-6 font-bold text-sm text-indigo-500 group-hover:text-indigo-400 tracking-tight">
                          #{o._id.slice(-8).toUpperCase()}
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 font-bold text-[10px] uppercase">
                                {o.user?.name?.[0] || 'G'}
                             </div>
                             <div>
                                <p className="font-bold text-sm text-white tracking-tight">{o.user?.name || 'Guest Client'}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{o.user?.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-center font-outfit font-bold text-lg text-white">
                          ₹{o.totalAmount?.toLocaleString() || '0'}
                       </td>
                       <td className="px-8 py-6 text-center">
                          <select 
                            value={o.status}
                            onChange={(e) => handleStatusUpdate(o._id, e.target.value)}
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
                             <ExternalLink size={18} strokeWidth={1.5} />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}