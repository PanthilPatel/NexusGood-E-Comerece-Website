import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import useWishlistStore from '../store/wishlistStore';
import ProductCard from '../components/product/ProductCard';

export default function Wishlist() {
  const { products, fetchWishlist, isLoading } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
    window.scrollTo(0, 0);
  }, [fetchWishlist]);

  if (isLoading) {
    return (
      <div className="pt-40 pb-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Synchronizing Sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 animate-fade-in min-h-screen">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-12">
           <div className="space-y-4">
              <span className="px-4 py-1.5 bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-rose-500/20">
                Personal Collection
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Your Sanctuary</h1>
              <p className="text-slate-500 text-sm font-light max-w-md leading-relaxed">
                A curated selection of your most desired artifacts and signature essentials.
              </p>
           </div>
           <Link to="/products" className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white/10 transition-all uppercase tracking-widest group">
              Explore More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>

        {/* Results */}
        <div>
          {products.length === 0 ? (
            <div className="py-32 text-center space-y-8 glass-card border-dashed border-white/10">
               <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-slate-700 relative">
                  <Heart size={48} className="opacity-20" />
                  <Package size={24} className="absolute bottom-4 right-4 opacity-40" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Sanctuary is Empty</h3>
                  <p className="text-slate-500 max-w-xs mx-auto text-sm font-light leading-relaxed">
                    You haven't synchronized any artifacts to your personal collection yet.
                  </p>
               </div>
               <Link to="/products" className="inline-flex items-center gap-3 btn-primary px-8 py-3 text-xs uppercase tracking-widest">
                  Browse Catalog
               </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {products.map(product => (
                 <ProductCard key={product._id} product={product} />
               ))}
            </div>
          )}
        </div>

        {/* Action Recommendation */}
        {products.length > 0 && (
          <div className="p-12 bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-2 text-center md:text-left">
                <h4 className="text-2xl font-bold text-white">Ready to acquire?</h4>
                <p className="text-slate-500 text-sm font-light">Transfer your favorited artifacts to your sanctuary bag.</p>
             </div>
             <Link to="/cart" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3">
                <ShoppingBag size={18} /> View Cart
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
