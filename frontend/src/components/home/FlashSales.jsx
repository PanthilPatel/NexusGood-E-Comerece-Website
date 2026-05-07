import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ChevronRight, ShoppingCart } from 'lucide-react';
import productService from '../../services/productService';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function FlashSales() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const data = await productService.getFlashSales();
        setProducts(data.data);
      } catch (error) {
        console.error('Failed to fetch flash sales:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSales();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <Zap size={14} className="text-amber-400 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Active Deal Node</span>
            </div>
            <h2 className="text-5xl font-bold tracking-tight">Flash <span className="text-amber-500">Sales.</span></h2>
            <p className="text-slate-500 max-w-md">Limited time synchronization opportunities. High sales velocity detected.</p>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-xs font-bold text-white uppercase tracking-[0.2em] hover:text-amber-400 transition-colors">
            View All Deals <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <FlashSaleCard key={product._id} product={product} onAddToCart={() => {
              addItem(product);
              toast.success(`${product.name} added to cart.`);
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FlashSaleCard({ product, onAddToCart }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(product.flashSaleEnd));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(product.flashSaleEnd));
    }, 1000);
    return () => clearInterval(timer);
  }, [product.flashSaleEnd]);

  function calculateTimeLeft(date) {
    const difference = +new Date(date) - +new Date();
    if (difference <= 0) return { h: '00', m: '00', s: '00' };

    const h = Math.floor(difference / (1000 * 60 * 60)).toString().padStart(2, '0');
    const m = Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0');
    const s = Math.floor((difference / 1000) % 60).toString().padStart(2, '0');
    return { h, m, s };
  }

  const discountPercent = Math.round(((product.price - product.flashSalePrice) / product.price) * 100);

  return (
    <div className="group relative bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-[2rem] overflow-hidden hover:border-amber-500/30 transition-all duration-500">
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={product.images[0]?.url} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-amber-500 text-black text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter">
            -{discountPercent}%
          </div>
        </div>
        
        {/* Hover Action */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
           <button 
             onClick={(e) => { e.preventDefault(); onAddToCart(); }}
             className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-amber-500 transition-colors shadow-xl"
           >
              <ShoppingCart size={20} />
           </button>
           <Link 
             to={`/products/${product._id}`}
             className="w-12 h-12 bg-white/10 text-white border border-white/20 rounded-2xl flex items-center justify-center hover:bg-white/20 backdrop-blur-md transition-colors"
           >
              <ChevronRight size={20} />
           </Link>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Clock size={12} />
            <span className="text-[10px] font-mono font-bold tracking-widest">{timeLeft.h}:{timeLeft.m}:{timeLeft.s}</span>
          </div>
          <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-amber-500/50 w-2/3 animate-pulse" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-white text-lg line-clamp-1">{product.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">₹{product.flashSalePrice.toLocaleString()}</span>
            <span className="text-sm text-slate-500 line-through">₹{product.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
