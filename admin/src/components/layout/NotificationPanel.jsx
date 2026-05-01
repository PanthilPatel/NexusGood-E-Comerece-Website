import { useState, useEffect } from 'react';
import { 
  Bell, Package, ShoppingCart, 
  AlertTriangle, X, Clock,
  ChevronRight, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Fetch low stock and recent orders in parallel
        const [lowStockRes, ordersRes] = await Promise.all([
          api.get('/analytics/low-stock'),
          api.get('/orders?limit=5')
        ]);

        const stockNotifs = (lowStockRes.data?.lowStockProducts || []).map(p => ({
          id: `stock-${p._id}`,
          type: 'stock',
          title: 'Low Stock Alert',
          message: `${p.name} is running low (${p.stock} remaining)`,
          time: 'Active',
          icon: Package,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          link: '/admin/products'
        }));

        const orderNotifs = (ordersRes.data?.data?.orders || []).slice(0, 3).map(o => ({
          id: `order-${o._id}`,
          type: 'order',
          title: 'New Acquisition',
          message: `Order #${o._id.slice(-6).toUpperCase()} from ${o.user?.name || 'Guest'}`,
          time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          icon: ShoppingCart,
          color: 'text-indigo-500',
          bg: 'bg-indigo-500/10',
          link: '/admin/orders'
        }));

        setNotifications([...stockNotifs, ...orderNotifs]);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="absolute right-0 top-full mt-4 w-96 bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[200] animate-in fade-in zoom-in-95 duration-200">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-indigo-500" />
          <h3 className="font-bold text-white text-sm uppercase tracking-widest">Protocol Alerts</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Syncing Telemetry...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
              <ShieldAlert size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No active alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => (
              <Link 
                key={n.id} 
                to={n.link}
                onClick={onClose}
                className="flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-colors group"
              >
                <div className={`w-10 h-10 ${n.bg} ${n.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <n.icon size={20} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-xs font-bold text-white uppercase tracking-tight">{n.title}</p>
                    <span className="text-[9px] font-bold text-slate-500">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-700 group-hover:text-white transition-colors mt-1" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-white/[0.02] border-t border-white/5">
        <Link 
          to="/admin/analytics" 
          onClick={onClose}
          className="w-full py-2.5 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-all"
        >
          View Full Intelligence <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}

function ShieldAlert({ size }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
