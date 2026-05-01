import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, ChevronRight, ExternalLink, 
  Clock, CheckCircle2, Truck, AlertCircle,
  Calendar, CreditCard, MapPin, Hash
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        // Ensure data is an array
        setOrders(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    window.scrollTo(0, 0);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
    </div>
  );

  return (
    <div className="pt-32 pb-24 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
           <div className="space-y-4">
              <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-primary/20">
                Acquisition Registry
              </span>
              <h1 className="text-6xl font-bold tracking-tight text-[var(--text-heading)]">Your Orders</h1>
              <p className="text-slate-500 font-light max-w-md">Track your exclusive digital artifacts and lifestyle essentials.</p>
           </div>
           <Link to="/products" className="group flex items-center gap-3 text-xs font-bold text-primary uppercase tracking-widest hover:text-primary-light transition-colors">
              Continue Exploration <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>

        {orders.length === 0 ? (
          <div className="glass-card p-24 text-center space-y-10">
             <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-slate-700">
                <Package size={48} strokeWidth={1.5} />
             </div>
             <div className="space-y-4">
                <h3 className="text-3xl font-bold text-[var(--text-heading)]">Registry Empty</h3>
                <p className="text-slate-500 max-w-xs mx-auto font-light leading-relaxed">You haven't initiated any acquisitions yet. Explore our curated selection to begin.</p>
             </div>
             <Link to="/products" className="btn-primary inline-flex py-4 px-10 text-xs uppercase tracking-widest">
               Browse Catalog
             </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {orders.map((order) => (
              <div key={order._id} className="glass-card overflow-hidden group hover:border-primary/30 transition-all duration-500">
                {/* Order Header */}
                <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white/[0.01]">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-12 flex-1">
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <Calendar size={12} className="text-primary" /> Timestamp
                         </div>
                         <p className="text-sm font-bold text-[var(--text-heading)]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <CreditCard size={12} className="text-emerald-500" /> Investment
                         </div>
                         <p className="text-xl font-bold text-primary">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <MapPin size={12} className="text-rose-500" /> Destination
                         </div>
                         <p className="text-sm font-bold text-[var(--text-heading)] truncate max-w-[150px]">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <Hash size={12} className="text-indigo-400" /> Registry ID
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-3">
                      <Badge variant={order.status.toLowerCase()}>{order.status}</Badge>
                   </div>
                </div>

                {/* Order Items */}
                <div className="p-10 space-y-10">
                   <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                      <div className="xl:col-span-7 space-y-8">
                         {order.orderItems.map((item, idx) => (
                           <div key={idx} className="flex gap-8 items-center bg-white/[0.02] p-4 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                              <div className="w-24 h-28 bg-space-950 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                                 <img src={item.image} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                              </div>
                              <div className="flex-1 space-y-2">
                                 <div className="flex justify-between items-start">
                                    <h4 className="text-xl font-bold text-[var(--text-heading)] leading-tight">{item.name}</h4>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">x{item.quantity}</span>
                                 </div>
                                 <p className="text-lg font-bold text-primary">₹{item.price.toLocaleString()}</p>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="xl:col-span-5 bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 flex flex-col justify-between shadow-inner">
                         <div className="space-y-8">
                            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                               <h5 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Logistics Intelligence</h5>
                               {order.status === 'Delivered' ? (
                                 <CheckCircle2 size={20} className="text-emerald-500" />
                               ) : (
                                 <Truck size={20} className="text-primary animate-pulse" />
                               )}
                            </div>
                            
                            <div className="space-y-3">
                               <p className="text-2xl font-bold text-[var(--text-heading)] tracking-tight">
                                  {order.status === 'Delivered' ? 'Acquisition Finalized' : 'Status: Synchronizing'}
                               </p>
                               <p className="text-xs text-slate-500 font-light leading-relaxed">
                                 {order.status === 'Pending' ? 'Your order is currently awaiting verification by our elite fulfillment core.' : 
                                  order.status === 'Processing' ? 'System assets are being allocated for your selection.' : 
                                  order.status === 'Shipped' ? 'Selection dispatched. Currently in high-velocity transit.' : 
                                  'The artifacts have been successfully integrated into your designated destination.'}
                               </p>
                            </div>
                         </div>
                         
                         <div className="pt-10 flex flex-col sm:flex-row gap-4">
                            <Button variant="outline" className="flex-1 py-4 text-[10px] uppercase tracking-widest">
                               Track Node
                            </Button>
                            <Button variant="ghost" className="flex-1 py-4 text-[10px] uppercase tracking-widest border border-white/5">
                               Acquire Invoice
                            </Button>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
