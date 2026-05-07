import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ChevronLeft } from 'lucide-react';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getCartTotal, getShippingTotal, fetchCart, isLoading } = useCartStore();

  // Always sync cart with backend on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const total = getCartTotal();
  const shipping = getShippingTotal();
  const grandTotal = total + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-6">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
             <ShoppingBag size={48} strokeWidth={1.5} />
          </div>
          <div className="space-y-4">
             <h1 className="text-4xl font-outfit font-bold text-white">Your bag is empty</h1>
             <p className="text-slate-400 font-light">Looks like you haven't added anything to your collection yet.</p>
          </div>
          <Link to="/products" className="btn-primary inline-block w-full">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-outfit font-bold text-white mb-12 tracking-tight">Shopping Bag</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => (
              <div key={item._id} className="glass-card p-6 flex flex-col md:flex-row items-center gap-8 group animate-fade-in">
                <div className="w-full md:w-32 aspect-square bg-space-950 rounded-xl overflow-hidden border border-white/5">
                  <img src={item.product?.images?.[0]?.url} alt={item.product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{item.product?.name}</h3>
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">{item.product?.category?.name || 'Item'}</p>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-6">
                    <div className="flex items-center bg-white/5 border border-white/5 rounded-lg p-0.5">
                      <button onClick={() => updateQuantity(item.product?._id, Math.max(1, item.quantity - 1))} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product?._id, item.quantity + 1)} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.product?._id)} className="text-accent hover:text-accent-light transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>

                <div className="text-right">
                   <p className="text-2xl font-bold text-white">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                   <p className="text-xs text-slate-500 font-medium italic">₹{(item.product?.price || 0).toLocaleString()} / unit</p>
                </div>
              </div>
            ))}

            <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-medium">
               <ChevronLeft size={18} /> Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="glass-card p-10 space-y-10 sticky top-32">
              <h2 className="text-2xl font-outfit font-bold">Order Summary</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-primary font-bold' : 'text-white font-semibold'}>
                    {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-bold text-primary">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              <div className="flex justify-center gap-6 pt-4 grayscale opacity-30">
                 {/* Payment icons placeholders */}
                 <div className="w-10 h-6 bg-slate-700 rounded-sm" />
                 <div className="w-10 h-6 bg-slate-700 rounded-sm" />
                 <div className="w-10 h-6 bg-slate-700 rounded-sm" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
