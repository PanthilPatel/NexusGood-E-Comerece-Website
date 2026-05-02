import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, BrainCircuit, UserMinus, 
  ArrowRight, Download, Zap, TrendingUp,
  AlertCircle, LayoutGrid
} from 'lucide-react';
import api from '../../services/api';

export default function AdminInventory() {
  const [lowStock, setLowStock] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stockRes, predRes] = await Promise.all([
          api.get('/analytics/inventory'),
          api.get('/analytics/predictions'),
        ]);
        setLowStock(stockRes.data?.lowStockProducts || []);
        setPredictions(predRes.data?.data || null);
      } catch (err) {
        setError('Failed to sync inventory telemetry.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Synchronizing Stock Radar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Inventory Intelligence</h1>
          <p className="text-sm text-slate-500 font-light">Proactive stock management and purchase velocity forecasting.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link to="/admin/products" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2">
             <LayoutGrid size={18} /> Manage Products
           </Link>
        </div>
      </div>

      {/* ── Critical Stock Alerts ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
            <AlertCircle size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Critical Stock Alerts</h3>
            <p className="text-xs text-slate-500">Immediate action required for these items.</p>
          </div>
        </div>

        {lowStock.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lowStock.map(product => (
              <Link 
                key={product._id} 
                to="/admin/products"
                className="group bg-[#0f172a] border border-rose-500/20 rounded-3xl p-6 hover:border-rose-500/50 transition-all shadow-xl space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                    <img src={product.images?.[0]?.url || ''} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{product.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">{product.category?.name || 'Uncategorized'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stock Level</p>
                      <p className={`text-2xl font-bold ${product.stock <= 3 ? 'text-rose-500' : 'text-amber-500'}`}>
                        {product.stock} <span className="text-xs text-slate-600 font-medium">units left</span>
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Restock Status</p>
                       <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                         product.stock <= 3 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                       }`}>
                         {product.stock <= 3 ? 'Critical' : 'Low Stock'}
                       </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${product.stock <= 3 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${(product.stock / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-slate-500 group-hover:text-white transition-colors">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Go to Product Master</span>
                   <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-[#0f172a] border border-white/5 rounded-3xl text-center space-y-4">
             <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto text-emerald-500">
               <Package size={32} />
             </div>
             <div className="space-y-1">
               <p className="text-lg font-bold text-white">Inventory Synchronized</p>
               <p className="text-sm text-slate-500">All active products are currently above the safety threshold.</p>
             </div>
          </div>
        )}
      </section>

      {/* ── Predictive Insights ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
            <BrainCircuit size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Neural Demand Forecasting</h3>
            <p className="text-xs text-slate-500">Shopping behavior analysis and 30-day velocity predictions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Demand List */}
           <div className="bg-[#0f172a] border border-white/[0.07] rounded-3xl p-8 space-y-6">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Predicted Best Sellers (30 Days)</h4>
              <div className="space-y-4">
                {predictions?.demandPredictions?.map(pred => (
                  <div key={pred._id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-5 group hover:border-indigo-500/30 transition-all">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      <img src={pred.image} alt="" className="w-full h-full object-cover opacity-60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-white truncate">{pred.name}</p>
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          pred.riskLevel === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 
                          pred.riskLevel === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {pred.riskLevel} Risk
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (pred.predictedDemand / (pred.stock + 1)) * 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Est. {pred.predictedDemand} units</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           {/* Churn Prevention */}
           <div className="bg-[#0f172a] border border-white/[0.07] rounded-3xl p-8 space-y-6">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Churn Prevention Radar</h4>
              <div className="space-y-4">
                {predictions?.atRiskCustomers?.map(customer => (
                  <div key={customer._id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-5 hover:border-rose-500/30 transition-all group">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 font-bold text-sm uppercase">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-white truncate">{customer.name}</p>
                          <p className="text-[10px] text-slate-500">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-rose-400 block">{customer.churnProbability} Risk</span>
                          <p className="text-[9px] text-slate-600 mt-1">Last seen {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'Never'}</p>
                        </div>
                      </div>
                    </div>
                    <button className="p-2.5 bg-white/5 group-hover:bg-indigo-600 group-hover:text-white rounded-xl text-indigo-400 transition-all shadow-lg">
                      <Zap size={16} />
                    </button>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </section>

    </div>
  );
}
