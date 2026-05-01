import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' });

  const total = getCartTotal();
  const shipping = total > 5000 ? 0 : 500;
  const grandTotal = total + shipping;

  useEffect(() => { if (items.length === 0) navigate('/cart'); }, [items, navigate]);

  const handlePayment = async () => {
    try {
      const { data: orderData } = await api.post('/orders', { shippingAddress: address, paymentMethod: 'Razorpay' });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: grandTotal * 100,
        currency: 'INR',
        name: 'ShopElite',
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          await api.post('/payments/verify', { ...response, orderId: orderData._id });
          clearCart();
          navigate('/order-confirmation', { state: { orderId: orderData._id } });
          toast.success('Order secured!');
        },
        prefill: { name: user?.name, email: user?.email, contact: address.phone },
        theme: { color: '#6366f1' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) { toast.error('Order creation failed.'); }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-space-950">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-8">
           <h1 className="text-4xl font-outfit font-bold text-white">Checkout</h1>
           <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'}`}>1</div>
              <div className={`h-0.5 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-white/5'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'}`}>2</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           <div className="lg:col-span-7 space-y-8 animate-fade-in">
             {step === 1 ? (
               <div className="glass-card p-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-primary" />
                    <h3 className="text-xl font-bold">Shipping Address</h3>
                  </div>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Street</label>
                        <input className="input-field" placeholder="42 Main St" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">City</label>
                           <input className="input-field" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">State</label>
                           <input className="input-field" placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input className="input-field" placeholder="Pincode" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} />
                        <input className="input-field" placeholder="Phone" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} />
                     </div>
                  </div>
                  <button onClick={() => setStep(2)} className="btn-primary w-full py-4" disabled={!address.street || !address.city || !address.phone}>
                    Continue to Payment
                  </button>
               </div>
             ) : (
               <div className="glass-card p-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-primary" />
                    <h3 className="text-xl font-bold">Secure Payment</h3>
                  </div>
                  <div className="p-8 bg-primary/5 border border-primary/10 rounded-2xl text-center space-y-4">
                     <Lock className="mx-auto text-primary opacity-50" size={32} />
                     <p className="text-slate-400 font-light">Your transaction is encrypted and secured by Razorpay.</p>
                     <p className="text-2xl font-bold">₹{grandTotal.toLocaleString()}</p>
                  </div>
                  <button onClick={handlePayment} className="btn-primary w-full py-4">Pay Securely</button>
                  <button onClick={() => setStep(1)} className="w-full text-sm text-slate-500 hover:text-white transition-colors">Edit Shipping Address</button>
               </div>
             )}
           </div>

           <aside className="lg:col-span-5 glass-card p-10 space-y-8">
              <h4 className="text-lg font-bold border-b border-white/5 pb-4">Summary</h4>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                 {items.map(item => (
                   <div key={item._id} className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-space-950 rounded-lg overflow-hidden border border-white/5"><img src={item.images?.[0]?.url} className="w-full h-full object-cover" /></div>
                         <div className="text-sm">
                            <p className="font-bold line-clamp-1">{item.name}</p>
                            <p className="text-slate-500 text-xs">Qty: {item.quantity}</p>
                         </div>
                      </div>
                      <span className="font-bold text-sm text-slate-300">₹{(item.price * item.quantity).toLocaleString()}</span>
                   </div>
                 ))}
              </div>
              <div className="pt-6 border-t border-white/5 space-y-4">
                 <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span className="text-white">₹{total.toLocaleString()}</span></div>
                 <div className="flex justify-between text-lg font-bold pt-4"><span>Total</span><span className="text-primary">₹{grandTotal.toLocaleString()}</span></div>
              </div>
           </aside>

        </div>
      </div>
    </div>
  );
}
