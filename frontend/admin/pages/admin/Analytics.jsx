import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { 
  DollarSign, ShoppingBag, Users, 
  TrendingUp, Download, Filter, AlertCircle 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminAnalytics() {
  const [data, setData] = useState({ revenue: null, salesTrend: [], topProducts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch specific analytics streams
        const [revRes, trendRes] = await Promise.all([
          api.get('/analytics/revenue'),
          api.get('/analytics/sales-trend')
        ]);

        console.log('Analytics Loaded:', { revenue: revRes.data, trend: trendRes.data });
        
        setData({
          revenue: revRes.data?.success ? revRes.data.data : null,
          salesTrend: (trendRes.data?.success && Array.isArray(trendRes.data.data?.salesTrend)) ? trendRes.data.data.salesTrend : []
        });
      } catch (err) {
        console.error('Analytics Error:', err);
        setError('Failed to aggregate intelligence streams.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 glass-card border-rose-500/20 text-center space-y-6">
        <AlertCircle size={48} className="text-rose-500 mx-auto" />
        <p className="text-rose-500 font-bold text-xl">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary bg-rose-600 hover:bg-rose-700">Retry Aggregate</button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="space-y-1">
            <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Performance Deck</h1>
            <p className="text-sm text-slate-500 font-light">Comprehensive analysis of revenue streams and growth velocity.</p>
         </div>
         <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest">
               <Download size={16} /> Export Intelligence
            </button>
         </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Revenue Velocity */}
         <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
               <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight">Revenue Velocity</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aggregate Sales Performance</p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-bold text-white tracking-tight">₹{data.revenue?.totalRevenue?.toLocaleString() || '0'}</p>
                  <p className={`text-[10px] font-bold ${data.revenue?.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {data.revenue?.growth >= 0 ? '+' : ''}{data.revenue?.growth || 0}% vs Last Month
                  </p>
               </div>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.salesTrend}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} />
                     <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Acquisition Volume */}
         <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
               <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight">Acquisition Volume</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Order Count Distribution</p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-bold text-white tracking-tight">
                    {data.salesTrend.reduce((sum, item) => sum + item.orders, 0)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Units</p>
               </div>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.salesTrend}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} />
                     <RechartsTooltip 
                        cursor={{fill: 'rgba(255,255,255,0.02)'}}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                     />
                     <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                        {(data.salesTrend || []).map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#06b6d4'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}