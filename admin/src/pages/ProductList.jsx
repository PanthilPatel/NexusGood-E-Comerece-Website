import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown, Package, LayoutGrid, List } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import useProductStore from '../store/productStore';
import { ProductSkeleton } from '../components/ui/Skeleton';

export default function ProductList() {
  const { products, fetchProducts, isLoading, error } = useProductStore();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);
  }, [fetchProducts]);

  const filteredProducts = (products || []).filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 animate-fade-in min-h-screen">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Catalog Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-12">
           <div className="space-y-4">
              <span className="px-4 py-1.5 bg-indigo-600/10 text-indigo-500 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">
                Member Exclusive Collection
              </span>
              <h1 className="text-6xl font-bold tracking-tight text-white">Signature Catalog</h1>
              <p className="text-slate-500 font-light max-w-md leading-relaxed">
                Explore our curated selection of high-performance digital artifacts and signature essentials.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                 <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
                 >
                   <LayoutGrid size={20} />
                 </button>
                 <button 
                   onClick={() => setViewMode('list')}
                   className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
                 >
                   <List size={20} />
                 </button>
              </div>
           </div>
        </div>

        {/* Filters & Tools */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between glass-card p-4">
           <div className="relative w-full lg:w-96 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search artifact index..." 
                className="w-full bg-white/[0.02] border border-white/10 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="w-full lg:w-48 bg-white/[0.02] border border-white/10 px-4 py-3 rounded-2xl text-sm text-white appearance-none focus:outline-none focus:border-primary/50 cursor-pointer"
                 >
                    <option value="newest" className="bg-space-950">Newest Arrival</option>
                    <option value="price-low" className="bg-space-950">Price: Ascending</option>
                    <option value="price-high" className="bg-space-950">Price: Descending</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/[0.02] border border-white/10 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">
                 <SlidersHorizontal size={18} /> Filters
              </button>
           </div>
        </div>

        {/* Results Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="p-20 text-center glass-card border-rose-500/20">
               <p className="text-rose-500 font-bold mb-4">{error}</p>
               <button onClick={() => fetchProducts()} className="btn-primary px-8 py-2 text-sm">Retry Sync</button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-20 text-center glass-card">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
                  <Package size={40} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Registry Empty</h3>
               <p className="text-slate-500 max-w-xs mx-auto font-light leading-relaxed">No artifacts match your current query. Try adjusting your index parameters.</p>
            </div>
          ) : (
            <div className={`grid gap-8 transition-all ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
