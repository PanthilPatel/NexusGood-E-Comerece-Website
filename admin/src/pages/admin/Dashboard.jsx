import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  IndianRupee, ShoppingBag, Users, 
  TrendingUp, Activity, ArrowUpRight, 
  ArrowDownRight, Zap, Target, PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import api from '../../services/api';
import Skeleton from '../../components/ui/Skeleton';
import useSettingsStore from '../../store/settingsStore';
import toast from 'react-hot-toast';
import { Package } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { maintenanceMode, fetchMaintenanceStatus, setMaintenanceMode } = useSettingsStore();

  useEffect(() => {
    fetchMaintenanceStatus();
  }, [fetchMaintenanceStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, stockRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/inventory')
      ]);
      setData(overviewRes.data?.data || overviewRes.data || null);
      setLowStock(stockRes.data?.lowStockProducts || []);
    } catch (err) {
      setError('Failed to sync metrics hub.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    window.addEventListener('refresh-orders', fetchData);
    return () => window.removeEventListener('refresh-orders', fetchData);
  }, []);

  const handleMaintenanceToggle = async (val) => {
    const ok = await setMaintenanceMode(val);
    if (ok) {
      toast.success(`Maintenance Mode ${val ? 'ACTIVATED' : 'DEACTIVATED'}`);
    } else {
      toast.error('Failed to update system protocol.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <Skeleton className="lg:col-span-8 h-[500px]" />
           <Skeleton className="lg:col-span-4 h-[500px]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-3xl">🔐</span>
          </div>
          <p className="text-white font-bold text-lg">Access Denied</p>
          <p className="text-slate-400 text-sm leading-relaxed">
            {error?.includes('403') || error?.includes('Forbidden')
              ? 'Your account does not have admin privileges. Please log in with an admin account.'
              : error || 'Failed to load dashboard data.'
            }
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all">
              Retry
            </button>
            <button onClick={() => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }} className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Net Revenue', value: `₹${data?.totalRevenue?.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-indigo-400', bg: 'bg-indigo-500/10', change: '+14%', up: true },
    { label: 'Active Orders', value: data?.totalOrders, icon: ShoppingBag, color: 'text-rose-400', bg: 'bg-rose-500/10', change: '+8%', up: true },
    { label: 'Member Core', value: data?.totalUsers, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '-2%', up: false },
    { label: 'Velocity', value: '88.4%', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', change: '+1%', up: true },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* Critical Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 flex items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
              <Package size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Stock Depletion Detected</h4>
              <p className="text-sm text-rose-400 font-medium">{lowStock.length} products have dropped below critical thresholds.</p>
            </div>
          </div>
          <Link to="/admin/products" className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-600/20">
            Fix Inventory
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/analytics" className="group/stat bg-[#0f172a] border border-white/[0.07] rounded-3xl p-6 hover:border-indigo-500/50 transition-all shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover/stat:bg-indigo-600 group-hover/stat:text-white transition-all">
              <IndianRupee size={24} />
            </div>
            <div className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20">
              View Analytics
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Net Revenue</p>
          <h3 className="text-3xl font-bold text-white mt-1 tracking-tight font-outfit">
            ₹{data?.totalRevenue?.toLocaleString('en-IN') || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-emerald-400 font-bold">+14%</span> vs last month
          </p>
        </Link>
        {kpis.slice(1).map((kpi, i) => (
          <div key={i} className="glass-card p-8 space-y-8 hover:border-white/20 hover:scale-[1.02] transition-all">
             <div className="flex justify-between items-start">
                <div className={`w-14 h-14 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                   <kpi.icon size={28} strokeWidth={1.5} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${kpi.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                   {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {kpi.change}
                </div>
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                <h4 className="text-3xl font-bold text-white mt-1 tracking-tight">{kpi.value}</h4>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* Growth Area Chart */}
         <div className="lg:col-span-8 glass-card p-10 space-y-10">
            <div className="flex justify-between items-center">
               <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-tight text-white">Acquisition Pulse</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time revenue stream analysis</p>
               </div>
               <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Revenue</span>
               </div>
            </div>
            
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.salesTrend || []}>
                     <defs>
                        <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                     <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} 
                       dy={10} 
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} 
                     />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorPulse)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-10">
            {/* Efficiency Node */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-10 space-y-8 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                  <Target size={32} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Objective Node</h3>
                  <p className="text-sm text-indigo-100/70 font-light leading-relaxed">
                    System synchronization is optimal. Acquisition targets for Q2 are at 84.2% completion.
                  </p>
               </div>
               <div className="pt-4">
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-white w-[84%] rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
                  </div>
               </div>
            </div>

            {/* Performance Metrics */}
             <div className="glass-card p-10 space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Activity size={20} className="text-emerald-500" />
                      <h3 className="text-lg font-bold text-white">System Integrity</h3>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Maintenance Protocol</span>
                      <button 
                        onClick={() => handleMaintenanceToggle(!maintenanceMode)}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 border ${
                          maintenanceMode ? 'bg-rose-500 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'bg-white/5 border-white/10'
                        }`}
                      >
                         <div className={`absolute top-1 w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 shadow-lg ${
                           maintenanceMode ? 'left-7' : 'left-1'
                         }`} />
                      </button>
                   </div>
                </div>
                
                {maintenanceMode && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-pulse">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center">
                      ⚠️ Storefront Blocked by Maintenance Protocol
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                   {[
                     { label: 'API Latency', value: '24ms', level: 95 },
                     { label: 'DB Payload', value: '1.2gb', level: 40 },
                     { label: 'Uptime Node', value: '99.9%', level: 100 }
                   ].map((stat, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                           <span>{stat.label}</span>
                           <span className="text-white">{stat.value}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <div 
                             className={`h-full rounded-full ${stat.level > 90 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                             style={{ width: `${stat.level}%` }} 
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}