import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();

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

  const hasDiscount = product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="group block animate-fade-in">
      <div className="glass-card overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-xl hover:shadow-primary/10">

        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-space-950">
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

          {/* Quick actions */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-space-950/80 to-transparent flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-primary py-2 px-3 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingBag size={13} /> Add to Bag
            </button>
            <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/5">
              <Heart size={15} />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-2.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {product.category?.name || 'Product'}
          </span>

          <h3 className="font-outfit font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

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

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-white">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-500 line-through">
                ₹{product.comparePrice?.toLocaleString('en-IN')}
              </span>
            )}
            {product.gst > 0 && (
              <span className="text-[10px] text-slate-500">+{product.gst}% GST</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
