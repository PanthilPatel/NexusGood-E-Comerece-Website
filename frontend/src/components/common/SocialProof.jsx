import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import api from '../../services/api';

export default function SocialProof() {
  const [purchase, setPurchase] = useState(null);
  const [visible, setVisible] = useState(false);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await api.get('/orders/recent-purchases');
        setPurchases(response.data.data);
      } catch (error) {
        console.error('Failed to fetch social proof:', error);
      }
    };

    fetchPurchases();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPurchases, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (purchases.length === 0) return;

    const showRandomPurchase = () => {
      const randomIndex = Math.floor(Math.random() * purchases.length);
      setPurchase(purchases[randomIndex]);
      setVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    };

    // Initial delay
    const initialDelay = setTimeout(showRandomPurchase, 3000);

    // Loop every 15-25 seconds
    const interval = setInterval(() => {
      showRandomPurchase();
    }, 20000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [purchases]);

  if (!purchase) return null;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'recently';
  };

  return (
    <div className={`fixed bottom-6 left-6 z-[100] transition-all duration-700 transform ${
      visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90 pointer-events-none'
    }`}>
      <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs group">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/5">
            {purchase.productImage ? (
              <img 
                src={purchase.productImage.startsWith('http') ? purchase.productImage : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${purchase.productImage}`} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary bg-primary/10">
                <ShoppingBag size={20} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0f172a] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        <div className="flex-1 pr-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Verified Purchase</p>
          <p className="text-[11px] text-white font-medium leading-tight line-clamp-2">
            Someone in <span className="text-primary font-bold">{purchase.city}</span> bought <span className="font-bold">{purchase.productName}</span>
          </p>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">{timeAgo(purchase.timeAgo)}</p>
        </div>

        <button 
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
