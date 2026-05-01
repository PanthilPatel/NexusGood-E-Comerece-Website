import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success('Added to bag');
  };

  const hasDiscount = product.comparePrice > product.price;

  return (
    <Link 
      to={`/products/${product._id}`}
      className="group block animate-fade-in"
    >
      <div className="glass-card overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-xl hover:shadow-primary/10">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-space-950">
          <img 
            src={product.images?.[0]?.url || '/placeholder.jpg'} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.target.src = "/fallback.png"; }}
          />
          
          {/* Badge */}
          {hasDiscount && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-accent text-white text-[10px] font-bold rounded-full">
              SALE
            </div>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-space-950/80 to-transparent flex gap-2">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-primary py-2 px-3 text-xs flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} /> Add
            </button>
            <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/5">
              <Heart size={16} />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          <div className="flex justify-between items-start">
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{product.category?.name || 'NEW'}</span>
             <div className="flex gap-0.5">
                {/* Small rating placeholder */}
                <div className="w-1 h-1 bg-primary rounded-full" />
                <div className="w-1 h-1 bg-primary rounded-full" />
                <div className="w-1 h-1 bg-primary rounded-full" />
             </div>
          </div>
          
          <h3 className="font-outfit font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-3">
             <span className="text-xl font-bold">₹{product.price.toLocaleString()}</span>
             {hasDiscount && (
               <span className="text-sm text-slate-500 line-through">₹{product.comparePrice.toLocaleString()}</span>
             )}
          </div>
        </div>
      </div>
    </Link>
  );
}
