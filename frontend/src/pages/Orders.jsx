import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ChevronRight, Clock, CheckCircle2,
  Truck, Calendar, CreditCard, MapPin, Hash,
  Banknote, AlertCircle, FileText, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const STATUS_CONFIG = {
  pending:    { color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',   label: 'Pending' },
  processing: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',      label: 'Processing' },
  shipped:    { color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', label: 'Shipped' },
  delivered:  { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Delivered' },
  cancelled:  { color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',      label: 'Cancelled' },
};

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/orders/my')
      .then(({ data }) => {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      })
      .catch(() => setError('Failed to load orders. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderId.slice(-8).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloading invoice...');
    } catch (err) {
      toast.error('Failed to download invoice.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center pt-24 px-4">
      <div className="text-center space-y-4">
        <AlertCircle size={40} className="text-rose-400 mx-auto" />
        <p className="text-white font-semibold">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white font-outfit tracking-tight">My Orders</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage your purchases</p>
          </div>
          <Link to="/products" className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">
            Continue Shopping <ChevronRight size={14} />
          </Link>
        </div>

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="bg-[#0f172a] border border-white/[0.07] rounded-3xl p-16 text-center space-y-6">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
              <Package size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">No orders yet</h3>
              <p className="text-slate-500 text-sm mt-1.5 max-w-xs mx-auto">You haven't placed any orders yet. Start shopping to see them here.</p>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition-all">
              Browse Catalog <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isCOD = order.paymentMethod === 'COD';
              const isCancelled = order.status === 'cancelled';
              const currentStep = STEPS.indexOf(order.status);

              return (
                <div key={order._id} className="bg-[#0f172a] border border-white/[0.07] rounded-2xl overflow-hidden">

                  {/* Order header */}
                  <div className="px-6 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Hash size={10} /> Order ID</p>
                        <p className="font-mono font-bold text-white text-sm mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Calendar size={10} /> Placed On</p>
                        <p className="text-sm font-semibold text-white mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><CreditCard size={10} /> Total</p>
                        <p className="text-sm font-bold text-indigo-400 mt-0.5">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          {isCOD ? <Banknote size={10} /> : <CreditCard size={10} />} Payment
                        </p>
                        <p className={`text-sm font-semibold mt-0.5 ${isCOD ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {isCOD ? 'Cash on Delivery' : 'Paid Online'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleDownloadInvoice(order._id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider"
                        title="Download Invoice"
                      >
                        <FileText size={14} /> Invoice
                      </button>
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-6 py-4 space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0]?.url
                            ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-600"><Package size={16} /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity} · ₹{item.price?.toLocaleString('en-IN')} each</p>
                        </div>
                        <p className="text-sm font-bold text-white flex-shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Delivery address */}
                  <div className="px-6 py-3 border-t border-white/[0.05] flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={12} className="text-slate-600 flex-shrink-0" />
                    <span>
                      Delivering to: <span className="text-slate-300 font-medium">
                        {order.shippingAddress?.address}, {order.shippingAddress?.city} — {order.shippingAddress?.pincode}
                      </span>
                    </span>
                  </div>

                  {/* Progress tracker */}
                  {!isCancelled && (
                    <div className="px-6 py-5 border-t border-white/[0.05]">
                      <div className="flex items-center justify-between relative">
                        {/* Progress line */}
                        <div className="absolute left-0 right-0 top-4 h-0.5 bg-white/[0.06] mx-8" />
                        <div
                          className="absolute left-8 top-4 h-0.5 bg-indigo-500 transition-all duration-700"
                          style={{
                            width: currentStep >= 0
                              ? `${(currentStep / (STEPS.length - 1)) * 100}%`
                              : '0%'
                          }}
                        />
                        {STEPS.map((s, i) => {
                          const done = currentStep >= i;
                          const active = currentStep === i;
                          const icons = [Clock, Package, Truck, CheckCircle2];
                          const Icon = icons[i];
                          const labels = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
                          return (
                            <div key={s} className="flex flex-col items-center gap-2 z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                done
                                  ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/30'
                                  : 'bg-[#0f172a] border-white/10'
                              } ${active ? 'ring-2 ring-indigo-400/30 ring-offset-1 ring-offset-[#0f172a]' : ''}`}>
                                <Icon size={14} className={done ? 'text-white' : 'text-slate-600'} />
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${done ? 'text-indigo-400' : 'text-slate-600'}`}>
                                {labels[i]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="px-6 py-4 border-t border-white/[0.05]">
                      <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
                        <AlertCircle size={16} /> This order was cancelled.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
