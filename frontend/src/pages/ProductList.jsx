import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ChevronDown, Package, LayoutGrid, List, X } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import useProductStore from '../store/productStore';
import { ProductSkeleton } from '../components/ui/Skeleton';

export default function ProductList() {
  const location = useLocation();
  const { products, fetchProducts, isLoading, error } = useProductStore();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState(200000); // Max price default

  const getPageInfo = () => {
    if (location.pathname === '/collections') return { title: 'Elite Collections', subtitle: 'Curated sets of premium digital artifacts.' };
    if (location.pathname === '/new') return { title: 'New Arrivals', subtitle: 'The latest synchronization of cutting-edge essentials.' };
    return { title: 'Signature Catalog', subtitle: 'Explore our curated selection of high-performance digital artifacts.' };
  };

  const { title, subtitle } = getPageInfo();

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);

    // Dynamic Protocol Switch based on path
    if (location.pathname === '/new') {
      setSortBy('newest');
      setSelectedCategory('All');
    } else if (location.pathname === '/collections') {
      setSortBy('price-high'); // Collections usually focus on premium items
    }
  }, [fetchProducts, location.pathname]);

  const categories = ['All', ...new Set((products || []).map(p => p.category?.name).filter(Boolean))];

  const filteredProducts = (products || [])
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category?.name === selectedCategory;
      const matchesPrice = p.price <= priceRange;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div className="pt-24 pb-20 animate-fade-in min-h-screen">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        
        {/* Catalog Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
           <div className="space-y-3">
              <span className="px-3 py-1 bg-indigo-600/10 text-indigo-500 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">
                Member Exclusive Collection
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{title}</h1>
              <p className="text-slate-500 text-sm font-light max-w-md leading-relaxed">
                {subtitle}
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
              <button 
                onClick={() => setShowFilters(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${
                  selectedCategory !== 'All' || priceRange < 200000 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white/[0.02] border border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                 <SlidersHorizontal size={18} /> Filters
                 {(selectedCategory !== 'All' || priceRange < 200000) && (
                   <span className="w-2 h-2 bg-white rounded-full animate-pulse ml-1" />
                 )}
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
                <ProductCard key={product._id} product={product} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* ── Filter Sidebar Flyout ── */}
      {showFilters && (
        <div className="fixed inset-0 z-[200] flex justify-end">
           <div className="absolute inset-0 bg-space-950/80 backdrop-blur-md animate-fade-in" onClick={() => setShowFilters(false)} />
           <div className="relative w-full max-w-md bg-[#020617] border-l border-white/10 p-12 space-y-12 animate-slide-left shadow-2xl">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Filter Index</h3>
                 <button onClick={() => setShowFilters(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              {/* Categories */}
              <div className="space-y-6">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Artifact Category</p>
                 <div className="flex flex-wrap gap-3">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          selectedCategory === cat 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                        }`}
                      >
                         {cat}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Price Range */}
              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Price Threshold</p>
                    <span className="text-sm font-bold text-primary">Under ₹{priceRange.toLocaleString('en-IN')}</span>
                 </div>
                 <input 
                  type="range" 
                  min="0" 
                  max="200000" 
                  step="5000"
                  className="w-full accent-primary h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                 />
                 <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>₹0</span>
                    <span>₹2,00,000+</span>
                 </div>
              </div>

              <div className="pt-12 border-t border-white/5 flex gap-4">
                 <button 
                  onClick={() => { setSelectedCategory('All'); setPriceRange(200000); }}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
                 >
                    Reset Protocol
                 </button>
                 <button 
                  onClick={() => setShowFilters(false)}
                  className="flex-1 btn-primary py-4 text-xs font-bold uppercase tracking-widest"
                 >
                    Apply Matrix
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
