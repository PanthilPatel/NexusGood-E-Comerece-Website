import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import {
  ShoppingCart, DollarSign, TrendingUp, Package,
  Download, AlertCircle, ArrowUpRight, ArrowDownRight,
  Info, ShoppingBag, Users, IndianRupee
} from 'lucide-react';
import api from '../../services/api';

function KpiCard({ icon: Icon, label, value, sub, growth, color, bg, prefix = '', note }) {
  const isUp = growth >= 0;
  return (
    <div className="bg-[#0f172a] border border-white/[0.07] rounded-2xl p-6 space-y-5 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={22} strokeWidth={1.5} />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
          {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {isUp ? '+' : ''}{growth}% this month
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <h4 className="text-3xl font-bold text-white mt-1 tracking-tight font-outfit">
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </h4>
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
      </div>
      {note && (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <Info size={10} /> {note}
        </div>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('month');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const [sumRes, revRes, trendRes] = await Promise.all([
          api.get(`/analytics/summary?range=${range}`),
          api.get(`/analytics/revenue?range=${range}`),
          api.get(`/analytics/overview?range=${range}`),
        ]);
        setSummary(sumRes.data?.data || null);
        setRevenue(revRes.data || null);
        setSalesTrend(trendRes.data?.data?.salesTrend || []);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [range]);

  const handleExport = () => {
    if (!salesTrend.length) return;

    // Build CSV rows
    const headers = ['Month', 'Year', 'Orders', 'Revenue (₹)', 'Est. Profit (₹)', 'Avg. Order (₹)'];
    const rows = [...salesTrend].reverse().map(row => {
      const profit = Math.round(row.revenue * 0.20);
      const avg = row.orders > 0 ? Math.round(row.revenue / row.orders) : 0;
      return [row.month, row.year, row.orders, row.revenue, profit, avg];
    });

    // Summary rows at top
    const summaryRows = [
      ['=== SUMMARY ==='],
      ['Total Sales', summary?.totalSales ?? 0],
      ['Total Revenue (₹)', summary?.totalRevenue ?? 0],
      ['Est. Profit (₹)', summary?.totalProfit ?? 0],
      ['Total Products Sold', summary?.totalProductsSold ?? 0],
      ['Pending COD Revenue (₹)', summary?.pendingCODRevenue ?? 0],
      [],
      ['=== MONTHLY BREAKDOWN ==='],
      headers,
      ...rows,
    ];

    const csv = summaryRows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexusgood-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-center space-y-4">
        <AlertCircle size={40} className="text-rose-500 mx-auto" />
        <p className="text-rose-400 font-bold">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition-all">
          Retry
        </button>
      </div>
    );
  }

  const kpis = [
    {
      icon: ShoppingCart,
      label: 'Total Sales',
      value: summary?.totalSales ?? 0,
      sub: `${summary?.thisMonthSales ?? 0} orders this month`,
      growth: summary?.salesGrowth ?? 0,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      icon: IndianRupee,
      label: 'Total Revenue',
      value: summary?.totalRevenue ?? 0,
      sub: `₹${(summary?.thisMonthRevenue ?? 0).toLocaleString('en-IN')} this month`,
      growth: summary?.revenueGrowth ?? 0,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      prefix: '₹',
    },
    {
      icon: IndianRupee,
      label: 'Realized Profit',
      value: summary?.totalProfit ?? 0,
      sub: `₹${(summary?.thisMonthProfit ?? 0).toLocaleString('en-IN')} this month`,
      growth: summary?.profitGrowth ?? 0,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      prefix: '₹',
      note: 'Based on actual product profit strategies',
    },
    {
      icon: Package,
      label: 'Total Products Sold',
      value: summary?.totalProductsSold ?? 0,
      sub: `${summary?.thisMonthProductsSold ?? 0} units this month`,
      growth: summary?.soldGrowth ?? 0,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Performance Deck</h1>
          <p className="text-sm text-slate-500 font-light">Comprehensive analysis of revenue streams and growth velocity.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'day', label: 'Day' },
              { id: 'month', label: 'Month' },
              { id: 'year', label: 'Year' },
              { id: 'all', label: 'All' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRange(t.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${range === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={handleExport} disabled={!salesTrend.length}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Business Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
        </div>
      </div>

      {/* ── Pending COD Banner ── */}
      {(summary?.pendingCODRevenue ?? 0) > 0 && (
        <div className="flex items-start gap-4 p-5 bg-amber-500/5 border border-amber-500/25 rounded-2xl">
          <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={20} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-amber-400 text-sm">Pending COD Revenue</p>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 uppercase tracking-wide">
                Not yet collected
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              <span className="text-white font-bold">₹{(summary?.pendingCODRevenue || 0).toLocaleString('en-IN')}</span>
              {' '}across <span className="text-white font-bold">{summary?.pendingCODCount || 0}</span> COD order{summary?.pendingCODCount !== 1 ? 's' : ''} currently in transit (processing / shipped).
              This amount will move to <span className="text-emerald-400 font-semibold">Total Revenue</span> once each order is marked <span className="text-emerald-400 font-semibold">Delivered</span>.
            </p>
          </div>
          <p className="text-2xl font-bold text-amber-400 flex-shrink-0">
            ₹{(summary?.pendingCODRevenue || 0).toLocaleString('en-IN')}
          </p>
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Revenue Trend */}
        <div className="bg-[#0f172a] border border-white/[0.07] rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                {range === 'day' ? 'Today\'s Hourly Stream' : range === 'year' ? 'Annual performance review' : range === 'all' ? 'Lifetime history' : 'Last 30 days'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">₹{(revenue?.totalRevenue ?? 0).toLocaleString('en-IN')}</p>
              <p className={`text-[10px] font-bold mt-0.5 ${(revenue?.growth ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(revenue?.growth ?? 0) >= 0 ? '+' : ''}{revenue?.growth ?? 0}% vs last month
              </p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders per Month */}
        <div className="bg-[#0f172a] border border-white/[0.07] rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white">Orders per Month</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Last 12 months</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {salesTrend.reduce((s, i) => s + i.orders, 0)}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Total Orders</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} allowDecimals={false} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}
                  formatter={v => [v, 'Orders']}
                />
                <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                  {salesTrend.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#6366f1' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Customer Intelligence ── */}
      <div className="bg-[#0f172a] border border-white/[0.07] rounded-3xl p-8 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Customer Intelligence</h3>
            <p className="text-xs text-slate-500">Automated segmentation based on purchasing frequency and recency.</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20">RFM Analysis Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Champions', value: summary?.bySegment?.Champion || 0, icon: TrendingUp, color: 'text-emerald-400', desc: 'Highest value users' },
            { label: 'Loyalists', value: summary?.bySegment?.Loyal || 0, icon: ShoppingBag, color: 'text-indigo-400', desc: 'Regular customers' },
            { label: 'New Signups', value: summary?.bySegment?.New || 0, icon: Users, color: 'text-amber-400', desc: 'Recently joined' },
            { label: 'At Risk', value: summary?.bySegment?.AtRisk || 0, icon: AlertCircle, color: 'text-rose-400', desc: 'Slowing interaction' },
          ].map(seg => (
            <div key={seg.label} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-white/5 ${seg.color}`}><seg.icon size={16} /></div>
                <span className="text-2xl font-bold text-white">{seg.value}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{seg.label}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{seg.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Monthly Breakdown Table ── */}
      <div className="bg-[#0f172a] border border-white/[0.07] rounded-3xl overflow-hidden">
        <div className="px-8 py-5 border-b border-white/[0.06]">
          <h3 className="font-bold text-white">Monthly Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">Revenue and order count per month (last 12 months)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02] text-left">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Month</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Orders</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Revenue</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Est. Profit</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Avg. Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {(salesTrend || []).length > 0 ? [...salesTrend].reverse().map((row, i) => {
                const profit = row.profit || 0;
                const avg = row.orders > 0 ? Math.round(row.revenue / row.orders) : 0;
                const isCurrentMonth = i === 0;
                return (
                  <tr key={i} className={`hover:bg-white/[0.02] transition-colors ${isCurrentMonth ? 'bg-indigo-500/[0.04]' : ''}`}>
                    <td className="px-8 py-4 font-semibold text-white">
                      {row.month} {row.year}
                      {isCurrentMonth && <span className="ml-2 text-[9px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full uppercase tracking-wider">Current</span>}
                    </td>
                    <td className="px-8 py-4 text-right text-slate-300">{row.orders}</td>
                    <td className="px-8 py-4 text-right font-semibold text-white">
                      {row.revenue > 0 ? `₹${row.revenue.toLocaleString('en-IN')}` : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-8 py-4 text-right text-emerald-400 font-semibold">
                      {profit > 0 ? `₹${profit.toLocaleString('en-IN')}` : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-8 py-4 text-right text-slate-400">
                      {avg > 0 ? `₹${avg.toLocaleString('en-IN')}` : <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
