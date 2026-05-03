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
    <footer className="bg-[var(--space-950)] text-[var(--text-main)] mt-auto border-t border-[var(--border-main)] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary-glow)] group-hover:rotate-12 transition-transform">
                <ShoppingBag className="text-white" size={20} />
              </div>
              <span className="font-outfit text-2xl font-bold tracking-tight text-[var(--text-heading)]">
                Nexus<span className="text-[var(--primary)]">Good</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[var(--text-main)] opacity-80 max-w-xs">
              Acquire elite-tier digital artifacts and premium lifestyle essentials designed for the modern visionary.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[var(--text-heading)] font-bold text-lg mb-6">Navigation</h3>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-sm hover:text-[var(--primary)] transition-colors">Digital Catalog</Link></li>
              <li><Link to="/orders" className="text-sm hover:text-[var(--primary)] transition-colors">Transaction History</Link></li>
              <li><Link to="/cart" className="text-sm hover:text-[var(--primary)] transition-colors">Secure Cart</Link></li>
              <li><Link to="/profile" className="text-sm hover:text-[var(--primary)] transition-colors">User Node</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[var(--text-heading)] font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-[var(--text-main)] group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-[var(--border-main)] flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors">
                  <Mail size={14} className="group-hover:text-white transition-colors" />
                </div>
                <span className="group-hover:text-[var(--text-heading)] transition-colors">support@nexusgood.com</span>
              </li>
              <li className="flex items-center gap-3 text-[var(--text-main)] group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-[var(--border-main)] flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors">
                  <Phone size={14} className="group-hover:text-white transition-colors" />
                </div>
                <span className="group-hover:text-[var(--text-heading)] transition-colors">+91 87xxxxxx98</span>
              </li>
              <li className="flex items-center gap-3 text-[var(--text-main)] group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-[var(--border-main)] flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors">
                  <MapPin size={14} className="group-hover:text-white transition-colors" />
                </div>
                <span className="group-hover:text-[var(--text-heading)] transition-colors">NexusGood, India</span>
              </li>
              <li className="pt-2">
                <Link to="/support" className="text-[10px] font-bold text-[var(--primary)] hover:opacity-80 transition-colors uppercase tracking-[0.2em] border-b border-[var(--primary)]/30 pb-1">
                  Initialize Support Ticket
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-[var(--text-heading)] font-bold text-lg mb-2">Sync Intelligence</h3>
            <p className="text-sm text-[var(--text-main)] opacity-70">Receive priority notifications for rare artifact drops and system updates.</p>
            <form onSubmit={handleNewsletter} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[var(--border-main)] border border-[var(--border-main)] rounded-xl text-sm text-[var(--text-heading)] placeholder:opacity-50 focus:outline-none focus:border-[var(--primary)]/50 transition-all"
                  id="newsletter-email"
                />
              </div>
              <button type="submit" className="bg-[var(--primary)] hover:opacity-90 text-white w-full py-3.5 rounded-xl text-sm uppercase tracking-widest font-bold shadow-lg shadow-[var(--primary-glow)] transition-all">
                Synchronize
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-[var(--border-main)] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-main)] opacity-60 font-medium">
          <p>© {new Date().getFullYear()} NEXUSGOOD CORE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
             <span className="hover:text-[var(--text-heading)] cursor-pointer transition-colors">PRIVACY PROTOCOL</span>
             <span className="hover:text-[var(--text-heading)] cursor-pointer transition-colors">TERMS OF ACQUISITION</span>
          </div>
        </div>
      </div>
    </footer>

  );
}
