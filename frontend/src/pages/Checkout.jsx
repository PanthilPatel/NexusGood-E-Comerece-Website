import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, ChevronRight, Lock, ArrowLeft,
  Package, Truck, Banknote, Wifi, ShieldCheck,
  CreditCard, CheckCircle, Tag, X, Loader2
} from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const COD_CHARGE = 14;

const PAYMENT_OPTIONS = [
  { id: 'Online', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay & more', icon: CreditCard, logos: ['VISA', 'MC', 'AMEX', 'RuPay'] },
  { id: 'UPI',    label: 'UPI / Net Banking',   sub: 'GPay, PhonePe, Paytm, BHIM UPI', icon: Wifi,       logos: ['GPay', 'PhonePe', 'Paytm', 'BHIM'] },
  { id: 'COD',    label: 'Cash on Delivery / Pay on Delivery', sub: `Cash, UPI and Cards accepted. A convenience fee of ₹${COD_CHARGE} will apply.`, icon: Banknote },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal, getShippingTotal, clearCart, fetchCart, isLoading: cartLoading } = useCartStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  // Prevent redirect to /cart when we intentionally clear cart after order
  const orderPlaced = useRef(false);

  // Auto-fill from saved primary address
  useEffect(() => {
    if (!user) return;
    const primary = user.addresses?.find(a => a.isPrimary) || user.addresses?.[0];
    if (primary) {
      setAddress({
        street: primary.street || '',
        city: primary.city || '',
        state: primary.state || '',
        pincode: primary.pincode || primary.zipCode || '',
        phone: primary.phone || user.phone || '',
      });
    } else if (user.phone) {
      setAddress(a => ({ ...a, phone: user.phone }));
    }
  }, [user]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponData, setCouponData] = useState(null);   // { code, discountType, discountValue, ... }
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const subtotal = getCartTotal();
  const shipping = getShippingTotal ? getShippingTotal() : 0;
  const codFee = paymentMethod === 'COD' ? COD_CHARGE : 0;
  const grandTotal = subtotal + shipping + codFee - couponDiscount;

  useEffect(() => { fetchCart(); }, [fetchCart]);
  useEffect(() => {
    // Only redirect if cart is empty AND we haven't just placed an order
    if (!cartLoading && items && items.length === 0 && !orderPlaced.current) {
      navigate('/cart');
    }
  }, [items, cartLoading, navigate]);

  // Re-validate coupon discount when subtotal changes
  useEffect(() => {
    if (!couponData) return;
    let d = 0;
    if (couponData.discountType === 'percentage') {
      d = (subtotal * couponData.discountValue) / 100;
      if (couponData.maxDiscount > 0) d = Math.min(d, couponData.maxDiscount);
    } else {
      d = couponData.discountValue;
    }
    setCouponDiscount(Math.round(d));
  }, [subtotal, couponData]);

  const validateAddress = () => {
    if (!address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill all address fields'); return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) { toast.error('Pincode must be 6 digits'); return false; }
    if (!/^\d{10}$/.test(address.phone)) { toast.error('Phone must be 10 digits'); return false; }
    return true;
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponInput.trim().toUpperCase(),
        orderAmount: subtotal,
      });
      setCouponData(data.coupon);
      setCouponDiscount(Math.round(data.discount));
      setCouponCode(data.coupon.code);
      toast.success(`Coupon "${data.coupon.code}" applied! You save ₹${Math.round(data.discount)}`);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code.');
      setCouponData(null);
      setCouponDiscount(0);
      setCouponCode('');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponData(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponInput('');
    setCouponError('');
    toast('Coupon removed.', { icon: '🗑️' });
  };

  const placeOrder = async () => {
    const method = paymentMethod === 'UPI' ? 'Online' : paymentMethod;
    const { data } = await api.post('/orders/checkout', {
      shippingAddress: {
        name: user?.name,
        phone: address.phone,
        address: address.street,
        city: address.city,
        pincode: address.pincode,
      },
      paymentMethod: method,
      couponCode: couponCode || undefined,
    });
    return data.order;
  };

  const handleCOD = async () => {
    setIsProcessing(true);
    try {
      const order = await placeOrder();
      orderPlaced.current = true;
      clearCart();
      toast.success('Order placed! Pay on delivery.');
      navigate(`/order-confirmation/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed.');
    } finally { setIsProcessing(false); }
  };

  const handleOnlinePayment = async () => {
    setIsProcessing(true);
    try {
      const dbOrder = await placeOrder();
      const { data: rzpOrder } = await api.post('/payments/create-order', { orderId: dbOrder._id });
      const options = {
        key: rzpOrder.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'NexusGood',
        order_id: rzpOrder.orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', { ...response, orderId: dbOrder._id });
            orderPlaced.current = true;
            clearCart();
            toast.success('Payment successful!');
            navigate(`/order-confirmation/${dbOrder._id}`);
          } catch { toast.error('Payment verification failed.'); }
        },
        prefill: { name: user?.name, email: user?.email, contact: address.phone },
        theme: { color: '#6366f1' },
        modal: { ondismiss: async () => { try { await api.put(`/orders/${dbOrder._id}/status`, { status: 'cancelled' }); } catch {} } }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed.');
    } finally { setIsProcessing(false); }
  };

  const handlePlaceOrder = () => paymentMethod === 'COD' ? handleCOD() : handleOnlinePayment();

  const inputClass = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all';

  return (
    <div className="min-h-screen bg-[#030712] pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => step === 2 ? setStep(1) : navigate('/cart')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white font-outfit tracking-tight">Checkout</h1>
            <p className="text-sm text-slate-500 mt-0.5">Secure checkout powered by NexusGood</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-xs font-semibold">
          <span className={step >= 1 ? 'text-indigo-400' : 'text-slate-600'}>1. Shipping Address</span>
          <ChevronRight size={14} className="text-slate-700" />
          <span className={step >= 2 ? 'text-indigo-400' : 'text-slate-600'}>2. Payment Method</span>
          <ChevronRight size={14} className="text-slate-700" />
          <span className="text-slate-600">3. Order Confirmed</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT ── */}
          <div className="lg:col-span-8 space-y-4">

            {/* STEP 1 — Address */}
            {step === 1 && (
              <div className="bg-[#0f172a] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">1</div>
                  <h2 className="font-bold text-white">Shipping Address</h2>
                </div>
                <div className="p-6 space-y-4">
                  {/* Saved addresses picker */}
                  {user?.addresses?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saved Addresses</p>
                      <div className="space-y-2">
                        {user.addresses.map((addr, i) => {
                          const isSelected =
                            address.street === addr.street &&
                            address.city === addr.city &&
                            address.pincode === (addr.pincode || addr.zipCode);
                          return (
                            <button key={addr._id || i} type="button"
                              onClick={() => setAddress({
                                street: addr.street || '',
                                city: addr.city || '',
                                state: addr.state || '',
                                pincode: addr.pincode || addr.zipCode || '',
                                phone: addr.phone || user.phone || '',
                              })}
                              className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                                isSelected
                                  ? 'border-indigo-500/60 bg-indigo-500/10'
                                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'
                              }`}>
                              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-indigo-500' : 'border-slate-600'}`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-white">{addr.label || 'Home'}</p>
                                  {addr.isPrimary && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full uppercase tracking-wide">Default</span>}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">
                                  {addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ''} — {addr.pincode || addr.zipCode}
                                </p>
                                {(addr.phone || user.phone) && (
                                  <p className="text-xs text-slate-500 mt-0.5">📞 {addr.phone || user.phone}</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-3 py-1">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">or enter a new address</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
                    <input className={inputClass} value={user?.name || ''} readOnly />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Street / House No. / Area</label>
                    <input className={inputClass} placeholder="e.g. 42 MG Road, Apartment 3B" value={address.street}
                      onChange={e => setAddress({ ...address, street: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">City</label>
                      <input className={inputClass} placeholder="e.g. Surat" value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">State</label>
                      <input className={inputClass} placeholder="e.g. Gujarat" value={address.state}
                        onChange={e => setAddress({ ...address, state: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Pincode</label>
                      <input className={inputClass} placeholder="6-digit pincode" value={address.pincode} maxLength={6}
                        onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 6) setAddress({ ...address, pincode: v }); }} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Mobile Number</label>
                      <input className={inputClass} placeholder="10-digit number" value={address.phone} maxLength={10}
                        onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) setAddress({ ...address, phone: v }); }} />
                    </div>
                  </div>
                  <button onClick={() => { if (validateAddress()) setStep(2); }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-2">
                    Continue to Payment <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Payment */}
            {step === 2 && (
              <>
                {/* Address recap */}
                <div className="bg-[#0f172a] border border-white/[0.07] rounded-2xl px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivering to</p>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        {user?.name} — {address.street}, {address.city}, {address.state} {address.pincode}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all">
                    Change
                  </button>
                </div>

                {/* Payment options */}
                <div className="bg-[#0f172a] border border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">2</div>
                    <h2 className="font-bold text-white">Payment Method</h2>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {PAYMENT_OPTIONS.map(opt => {
                      const isSelected = paymentMethod === opt.id;
                      const isCODDisabled = opt.id === 'COD' && (subtotal + shipping - couponDiscount) > 10000;
                      
                      return (
                        <label key={opt.id} 
                          onClick={() => !isCODDisabled && setPaymentMethod(opt.id)}
                          className={`flex items-start gap-4 px-6 py-5 cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-600/[0.06]' : 'hover:bg-white/[0.02]'
                          } ${isCODDisabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}>
                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected ? 'border-indigo-500' : isCODDisabled ? 'border-white/5' : 'border-slate-600'
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-semibold text-sm ${isCODDisabled ? 'text-slate-500 line-through' : 'text-white'}`}>
                                {opt.label}
                              </span>
                              {opt.id === 'COD' && !isCODDisabled && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">+₹{COD_CHARGE} fee</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {isCODDisabled 
                                ? 'Restricted for orders above ₹10,000. Please use online payment.' 
                                : opt.sub}
                            </p>
                            {opt.logos && (
                              <div className="flex items-center gap-2 mt-2.5">
                                {opt.logos.map(b => (
                                  <span key={b} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400">{b}</span>
                                ))}
                              </div>
                            )}
                            {opt.id === 'COD' && isSelected && !isCODDisabled && (
                              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                <span className="text-amber-400 leading-none mt-0.5">⚠️</span>
                                <p className="text-xs text-amber-300/80 leading-relaxed">
                                  One-time password required at time of delivery. Please ensure someone will be available to receive this delivery.
                                </p>
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Place order */}
                  <div className="px-6 py-5 border-t border-white/[0.06]">
                    <button onClick={handlePlaceOrder} disabled={isProcessing}
                      className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] text-sm shadow-lg shadow-amber-400/20">
                      {isProcessing
                        ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                        : paymentMethod === 'COD' ? 'Place Order' : 'Use this payment method'
                      }
                    </button>
                    <p className="text-center text-[11px] text-slate-600 mt-3">
                      By placing your order, you agree to NexusGood's <span className="text-indigo-400 cursor-pointer">privacy notice</span> and <span className="text-indigo-400 cursor-pointer">conditions of use</span>.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Trust row */}
            <div className="flex items-center justify-center gap-6 py-1">
              {[{ icon: Lock, text: 'SSL Encrypted' }, { icon: ShieldCheck, text: 'Secure Payment' }, { icon: Truck, text: 'Fast Delivery' }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-slate-600 text-[11px]"><Icon size={12} /> {text}</div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Order Summary ── */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">

            {/* Coupon Box */}
            <div className="bg-[#0f172a] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <Tag size={15} className="text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Promo Code</h3>
              </div>
              <div className="px-5 py-4">
                {couponData ? (
                  /* Applied state */
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-400">{couponData.code}</p>
                        <p className="text-xs text-emerald-400/70">
                          {couponData.discountType === 'percentage'
                            ? `${couponData.discountValue}% off${couponData.maxDiscount > 0 ? ` (max ₹${couponData.maxDiscount})` : ''}`
                            : `₹${couponData.discountValue} flat off`
                          } · You save ₹{couponDiscount}
                        </p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  /* Input state */
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        placeholder="Enter promo code"
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all uppercase tracking-wider"
                      />
                      <button onClick={applyCoupon} disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-1.5">
                        {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-rose-400 flex items-center gap-1.5">
                        <X size={11} /> {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[#0f172a] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <h3 className="font-bold text-white text-sm">Order Summary</h3>
              </div>

              {/* Items */}
              <div className="px-5 py-4 space-y-3 max-h-52 overflow-y-auto custom-scrollbar">
                {items.map(item => (
                  <div key={item.product?._id || item._id} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0]?.url
                        ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-slate-600"><Package size={12} /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{item.product?.name}</p>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-white flex-shrink-0">₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="px-5 py-4 border-t border-white/[0.06] space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Items ({items.length})</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery</span>
                  <span className="text-emerald-400 font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {paymentMethod === 'COD' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">COD Fee</span>
                    <span className="text-amber-400 font-semibold">+₹{COD_CHARGE}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-emerald-400 flex items-center gap-1"><Tag size={11} /> {couponCode}</span>
                    <span className="text-emerald-400 font-bold">−₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="h-px bg-white/[0.06]" />
                <div className="flex justify-between font-bold text-white text-base">
                  <span>Order Total</span>
                  <span>₹{Math.max(0, grandTotal).toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <p className="text-xs text-emerald-400 font-semibold text-center">🎉 You're saving ₹{couponDiscount} with this coupon!</p>
                )}
              </div>

              {shipping === 0 && (
                <div className="px-5 pb-4">
                  <p className="text-xs text-emerald-400 font-semibold">✓ Your order qualifies for FREE Delivery.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
