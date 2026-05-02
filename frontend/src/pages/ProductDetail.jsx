import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Share2, ShieldCheck, 
  Truck, RotateCcw, Star, ChevronRight,
  Plus, Minus, CheckCircle2, Zap, X
} from 'lucide-react';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  
  const isFavorited = isInWishlist(id);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);


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

  const handleAddToCart = async (showToast = true) => {
    try {
      await addToCart(product._id, quantity);
      if (showToast) {
        toast.success(`${product.name} added to bag`, {
          icon: <CheckCircle2 className="text-emerald-500" />,
        });
      }
      return true;
    } catch (err) {
      toast.error('Failed to synchronize artifact. Please try again.');
      return false;
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart(false);
    if (success) {
      navigate('/checkout');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const res = await toggleWishlist(product._id);
      toast.success(res.message || 'Wishlist updated');
    } catch (error) {
      toast.error('Sign in to favorite items');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/${id}`, reviewForm);
      if (res.data.success) {
        toast.success('Feedback synchronized successfully.');
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: '' });
        // Refresh product to show new review if approved immediately (or just for UI)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Feedback transmission failed.');
    } finally {
      setSubmittingReview(false);
    }
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
                <div className="flex items-baseline gap-4 flex-wrap">
                   <span className="text-4xl font-bold text-white">₹{product.price?.toLocaleString('en-IN')}</span>
                   {hasDiscount && (
                     <span className="text-xl text-slate-500 line-through">₹{product.comparePrice?.toLocaleString('en-IN')}</span>
                   )}
                   {hasDiscount && (
                     <span className="px-3 py-1 bg-rose-500/15 text-rose-400 text-sm font-bold rounded-full border border-rose-500/20">
                       {discountPercent}% OFF
                     </span>
                   )}
                </div>
                {product.gst > 0 && (
                  <p className="text-xs text-slate-500">
                    Price inclusive of <span className="text-amber-400 font-semibold">{product.gst}% GST</span>
                  </p>
                )}
                {/* Color selector */}
                {product.colors?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map(c => (
                        <div key={c.hex} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300 hover:border-white/30 cursor-pointer transition-all">
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: c.hex }} />
                          {c.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

                <div className="flex flex-col sm:flex-row gap-4">
                   <button 
                     onClick={handleBuyNow}
                     disabled={product.stock === 0}
                     className="flex-1 btn-primary py-4 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 group"
                   >
                      <Zap size={18} className="group-hover:scale-125 transition-transform" /> Buy Now
                   </button>
                   <button 
                     onClick={handleAddToCart}
                     disabled={product.stock === 0}
                     className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                      <ShoppingBag size={18} /> Add to Sanctuary
                   </button>
                    <button 
                      onClick={handleToggleWishlist}
                      className={`p-4 rounded-2xl transition-all border ${
                        isFavorited 
                        ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                    >
                       <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
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

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Review Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-white tracking-tight">Customer Feedback</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Aggregate sentiment from the community</p>
            </div>

            <div className="p-8 glass-card bg-primary/5 border-primary/10 flex flex-col items-center text-center space-y-4">
              <p className="text-6xl font-bold text-white">{product.avgRating?.toFixed(1) || '0.0'}</p>
              <div className="flex gap-1.5 text-amber-400">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={20} fill={s <= Math.round(product.avgRating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Based on {product.numReviews || 0} Synchronized Reviews</p>
            </div>

            <div className="space-y-4">
               {[5, 4, 3, 2, 1].map(star => (
                 <div key={star} className="flex items-center gap-4 group cursor-help">
                    <span className="text-[10px] font-bold text-slate-500 w-4">{star}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${(product.reviews?.filter(r => r.rating === star).length / (product.numReviews || 1)) * 100}%` }}
                       />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 w-8 text-right group-hover:text-slate-400 transition-colors">
                      {Math.round((product.reviews?.filter(r => r.rating === star).length / (product.numReviews || 1)) * 100)}%
                    </span>
                 </div>
               ))}
            </div>
          </div>

          {/* Review List & Submission */}
          <div className="lg:col-span-8 space-y-12">
             <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white uppercase tracking-widest">Protocol Ledger</h4>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="text-[10px] font-bold text-primary hover:text-primary-light transition-colors uppercase tracking-[0.2em] border-b border-primary/30 pb-1"
                >
                  Submit Feedback
                </button>
             </div>


             <div className="space-y-8">
                {product.reviews?.length > 0 ? product.reviews.map((review, i) => (
                  <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6 hover:bg-white/[0.03] transition-all group">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                              {review.name?.charAt(0) || 'U'}
                           </div>
                           <div>
                              <p className="font-bold text-white">{review.name || 'Anonymous User'}</p>
                              <div className="flex items-center gap-2">
                                 <div className="flex gap-0.5 text-amber-400">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= review.rating ? 'currentColor' : 'none'} />)}
                                 </div>
                                 <span className="text-[10px] text-slate-500 font-medium">· {new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                           <CheckCircle2 size={10} className="text-emerald-500" />
                           <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Verified Purchase</span>
                        </div>
                     </div>
                     <p className="text-sm text-slate-400 leading-relaxed font-light italic">
                        "{review.comment}"
                     </p>
                  </div>
                )) : (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-600 border-2 border-dashed border-white/5 rounded-[3rem]">
                     <Star size={40} className="opacity-10" />
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No feedback entries in the registry</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-space-950/80 backdrop-blur-md" onClick={() => setShowReviewModal(false)} />
           <div className="relative w-full max-w-lg glass-card p-12 space-y-10 animate-slide-up border-primary/20">
              <button 
                onClick={() => setShowReviewModal(false)}
                className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <div className="space-y-2">
                 <h3 className="text-3xl font-bold text-white tracking-tight">Submit Feedback</h3>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Contribute to the collective intelligence</p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Artifact Rating</label>
                    <div className="flex gap-4">
                       {[1, 2, 3, 4, 5].map(star => (
                         <button 
                           key={star}
                           type="button"
                           onClick={() => setReviewForm({...reviewForm, rating: star})}
                           className={`p-2 transition-all ${reviewForm.rating >= star ? 'text-amber-400 scale-110' : 'text-slate-700 hover:text-slate-500'}`}
                         >
                            <Star size={32} fill={reviewForm.rating >= star ? 'currentColor' : 'none'} />
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Observation Log</label>
                    <textarea 
                      rows={5}
                      required
                      placeholder="Share your detailed analysis of this artifact..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all resize-none"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    />
                 </div>

                 <div className="flex gap-4">
                    <button 
                      type="submit"
                      disabled={submittingReview}
                      className="flex-1 btn-primary py-4 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2"
                    >
                       {submittingReview ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Commit Feedback'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="px-8 py-4 bg-white/5 border border-white/10 text-slate-500 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
                    >
                       Abort
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  </div>

  );
}
