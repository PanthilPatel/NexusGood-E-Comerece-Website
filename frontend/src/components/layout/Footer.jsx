import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Mail, MapPin, Phone, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    toast.success('Welcome to the inner circle! 🎉');
    setEmail('');
  };

  return (
    <footer className="bg-space-950 text-slate-400 mt-auto border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/40 group-hover:rotate-12 transition-transform">
                <ShoppingBag className="text-white" size={20} />
              </div>
              <span className="font-outfit text-2xl font-bold tracking-tight text-white">
                Nexus<span className="text-primary">Good</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              Acquire elite-tier digital artifacts and premium lifestyle essentials designed for the modern visionary.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Navigation</h3>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-sm hover:text-primary transition-colors">Digital Catalog</Link></li>
              <li><Link to="/orders" className="text-sm hover:text-primary transition-colors">Transaction History</Link></li>
              <li><Link to="/cart" className="text-sm hover:text-primary transition-colors">Secure Cart</Link></li>
              <li><Link to="/profile" className="text-sm hover:text-primary transition-colors">User Node</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm group cursor-pointer">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="group-hover:text-white transition-colors">ops@nexusgood.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm group cursor-pointer">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="group-hover:text-white transition-colors">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm group cursor-pointer">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="group-hover:text-white transition-colors">Nexus Hub, Mumbai</span>
              </li>
              <li className="pt-2">
                <Link to="/support" className="text-[10px] font-bold text-primary hover:text-primary-light transition-colors uppercase tracking-[0.2em] border-b border-primary/30 pb-1">
                  Initialize Support Ticket
                </Link>
              </li>
            </ul>

          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg mb-2">Sync Intelligence</h3>
            <p className="text-sm text-slate-500">Receive priority notifications for rare artifact drops and system updates.</p>
            <form onSubmit={handleNewsletter} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                  id="newsletter-email"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 text-sm uppercase tracking-widest font-bold">
                Synchronize
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-medium">
          <p>© {new Date().getFullYear()} NEXUSGOOD CORE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
             <span className="hover:text-white cursor-pointer transition-colors">PRIVACY PROTOCOL</span>
             <span className="hover:text-white cursor-pointer transition-colors">TERMS OF ACQUISITION</span>
          </div>
        </div>
      </div>
    </footer>

  );
}
