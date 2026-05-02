import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isList = viewMode === 'list';
  const isFavorited = isInWishlist(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id, 1);
      toast.success('Added to bag');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await toggleWishlist(product._id);
      toast.success(res.message || 'Wishlist updated');
    } catch (error) {
      toast.error('Sign in to favorite items');
    }
  };

  const hasDiscount = product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className={`group block animate-fade-in ${isList ? 'w-full' : ''}`}>
      <div className={`glass-card overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-xl hover:shadow-primary/10 flex ${isList ? 'flex-col md:flex-row' : 'flex-col'}`}>

        {/* Image Container */}
        <div className={`relative overflow-hidden bg-space-950 flex-shrink-0 ${isList ? 'w-full md:w-80 aspect-square md:aspect-[4/5]' : 'aspect-[4/5]'}`}>
          <img
            src={product.images?.[0]?.url || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={e => { e.target.src = '/fallback.png'; }}
          />

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-4 left-4 px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-lg">
              {discountPct}% OFF
            </div>
          )}

          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-xs font-bold text-white uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Quick actions (Floating in grid, or hidden in list) */}
          {!isList && (
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-space-950/80 to-transparent flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary py-2 px-3 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag size={13} /> Add to Bag
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-2 backdrop-blur-md rounded-xl transition-all border ${
                  isFavorited 
                  ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20' 
                  : 'bg-white/10 border-white/5 text-white hover:bg-white/20'
                }`}
              >
                <Heart size={15} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}
        </div>

        {/* Details Container */}
        <div className={`p-6 flex flex-col flex-1 ${isList ? 'justify-center' : 'space-y-2.5'}`}>
          <div className={isList ? 'flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4' : ''}>
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {product.category?.name || 'Product'}
              </span>

              <h3 className={`font-outfit font-semibold line-clamp-2 group-hover:text-primary transition-colors ${isList ? 'text-2xl' : 'text-base'}`}>
                {product.name}
              </h3>
            </div>

            {/* Price (In list, show larger and on right) */}
            <div className={`flex items-baseline gap-2 flex-wrap ${isList ? 'md:text-right' : ''}`}>
              <span className={`font-bold text-white ${isList ? 'text-3xl' : 'text-lg'}`}>
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className={`text-slate-500 line-through ${isList ? 'text-lg' : 'text-sm'}`}>
                  ₹{product.comparePrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Description (List mode only) */}
          {isList && (
            <p className="text-slate-500 text-sm font-light leading-relaxed mb-6 line-clamp-3 max-w-2xl">
              {product.description}
            </p>
          )}

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between gap-6">
            {/* Color swatches */}
            {product.colors?.length > 0 && (
              <div className="flex items-center gap-1.5">
                {product.colors.slice(0, 5).map(c => (
                  <span key={c.hex} title={c.name}
                    className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: c.hex }} />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-[10px] text-slate-500">+{product.colors.length - 5}</span>
                )}
              </div>
            )}

            {/* List mode actions */}
            {isList && (
              <div className="flex gap-3">
                 <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 disabled:opacity-50"
                >
                  <ShoppingBag size={14} /> Add Artifact to Bag
                </button>
                <button 
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-2xl transition-all border ${
                    isFavorited 
                    ? 'bg-rose-500 border-rose-400 text-white shadow-xl shadow-rose-500/20' 
                    : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
