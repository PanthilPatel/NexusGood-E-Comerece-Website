import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Share2, ShieldCheck, 
  Truck, RotateCcw, Star, ChevronRight,
  Plus, Minus, CheckCircle2
} from 'lucide-react';
import useCartStore from '../store/cartStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data?.success) {
          setProduct(res.data.data);
        }
      } catch (err) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    toast.success(`${product.name} added to bag`, {
      icon: <CheckCircle2 className="text-emerald-500" />,
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasDiscount = product.comparePrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="pt-32 pb-24 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-12">
          <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
          <ChevronRight size={12} />
          <button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Catalog</button>
          <ChevronRight size={12} />
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Visuals */}
          <div className="lg:col-span-7 space-y-6">
             <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white/[0.02] border border-white/5 group">
                <img 
                  src={product.images?.[activeImage]?.url || '/placeholder.jpg'} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={product.name}
                  onError={(e) => { e.target.src = '/fallback.png'; }}
                />
                {hasDiscount && (
                  <div className="absolute top-6 left-6 px-4 py-2 bg-accent text-white text-xs font-bold rounded-2xl shadow-xl shadow-accent/20">
                    SAVE {discountPercent}%
                  </div>
                )}
             </div>
             
             {/* Thumbnail Reel */}
             {product.images?.length > 1 && (
               <div className="flex gap-4">
                 {product.images.map((img, i) => (
                   <button 
                     key={i}
                     onClick={() => setActiveImage(i)}
                     className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                       activeImage === i ? 'border-primary shadow-lg shadow-primary/20 scale-95' : 'border-white/5 hover:border-white/20'
                     }`}
                   >
                     <img src={img.url} className="w-full h-full object-cover" alt="" />
                   </button>
                 ))}
               </div>
             )}
          </div>

          {/* Configuration */}
          <div className="lg:col-span-5 space-y-10">
             <div className="space-y-4">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20">
                  {product.category?.name || 'Signature Series'}
                </span>
                <h1 className="text-5xl font-bold tracking-tight text-white leading-[1.1]">{product.name}</h1>
                <div className="flex items-center gap-4">
                   <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={16} className={s <= Math.round(product.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'} />
                      ))}
                   </div>
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{product.numReviews || 0} Reviews</span>
                </div>
             </div>

             <div className="p-8 glass-card space-y-6">
                <div className="flex items-baseline gap-4">
                   <span className="text-4xl font-bold text-white">₹{product.price?.toLocaleString()}</span>
                   {hasDiscount && (
                     <span className="text-lg text-slate-500 line-through">₹{product.comparePrice?.toLocaleString()}</span>
                   )}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                   {product.description}
                </p>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-6">
                   <div className="flex items-center bg-white/5 rounded-2xl border border-white/5 p-1">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-12 text-center font-bold text-white">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <Plus size={18} />
                      </button>
                   </div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {product.stock > 0 ? `${product.stock} units available` : <span className="text-accent">Out of sync</span>}
                   </p>
                </div>

                <div className="flex gap-4">
                   <button 
                     onClick={handleAddToCart}
                     disabled={product.stock === 0}
                     className="flex-1 btn-primary py-4 text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                   >
                      <ShoppingBag size={20} /> Add to Sanctuary
                   </button>
                   <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all">
                      <Heart size={20} />
                   </button>
                </div>
             </div>

             {/* Trust Badges */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  { icon: Truck, text: 'Rapid Logistics' },
                  { icon: ShieldCheck, text: 'Cipher Security' },
                  { icon: RotateCcw, text: '30-Day Reversal' },
                  { icon: Share2, text: 'Global Network' }
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                     <badge.icon size={18} className="text-primary group-hover:scale-110 transition-transform" />
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{badge.text}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
