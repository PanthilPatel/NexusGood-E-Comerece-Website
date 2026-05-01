import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-void pt-24 pb-12 border-t border-muted">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Col 1: Brand */}
          <div className="space-y-6">
            <Link to="/" className="block">
              <span className="font-display text-2xl font-semibold tracking-[0.25em] text-gold block leading-none">
                NEXUSGOOD
              </span>
            </Link>
            <p className="font-sans text-[13px] font-light leading-relaxed text-text-tertiary max-w-[240px]">
              Crafting experiences of uncompromising quality and timeless elegance since 2009.
            </p>
            <div className="flex gap-5 pt-2">
              <a href="#" className="text-text-tertiary hover:text-gold transition-colors duration-300">
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a href="#" className="text-text-tertiary hover:text-gold transition-colors duration-300">
                <Twitter size={18} strokeWidth={1.5} />
              </a>
              <a href="#" className="text-text-tertiary hover:text-gold transition-colors duration-300">
                <Facebook size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div className="space-y-8">
            <h4 className="font-label text-[10px] text-text-tertiary tracking-[0.2em]">SHOP</h4>
            <div className="flex flex-col gap-4">
              {['Collections', 'New Arrivals', 'Best Sellers', 'Exclusive Sale'].map(link => (
                <Link key={link} to="/products" className="font-sans text-[14px] font-light text-text-secondary hover:text-gold transition-colors duration-300 flex items-center group">
                  {link}
                  <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ml-1" />
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Help */}
          <div className="space-y-8">
            <h4 className="font-label text-[10px] text-text-tertiary tracking-[0.2em]">ASSISTANCE</h4>
            <div className="flex flex-col gap-4">
              {['FAQ', 'Shipping & Delivery', 'Returns Policy', 'Order Tracking'].map(link => (
                <Link key={link} to="#" className="font-sans text-[14px] font-light text-text-secondary hover:text-gold transition-colors duration-300">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Company */}
          <div className="space-y-8">
            <h4 className="font-label text-[10px] text-text-tertiary tracking-[0.2em]">COMPANY</h4>
            <div className="flex flex-col gap-4">
              {['The Brand Story', 'Craftsmanship', 'Careers', 'Press Relations'].map(link => (
                <Link key={link} to="/about" className="font-sans text-[14px] font-light text-text-secondary hover:text-gold transition-colors duration-300">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-10 border-t border-muted/50 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="font-sans text-[12px] font-light text-text-tertiary tracking-wide">
            © 2025 NEXUSGOOD. ALL RIGHTS RESERVED.
          </p>
          
          <div className="flex items-center gap-10">
            <div className="flex gap-6 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              {/* Payment placeholder SVGs or text */}
              <span className="font-label text-[9px] tracking-tighter">VISA</span>
              <span className="font-label text-[9px] tracking-tighter">MASTERCARD</span>
              <span className="font-label text-[9px] tracking-tighter">AMEX</span>
              <span className="font-label text-[9px] tracking-tighter">RAZORPAY</span>
            </div>
          </div>

          <div className="flex gap-8">
            <Link to="#" className="font-sans text-[12px] font-light text-text-tertiary hover:text-gold transition-colors">PRIVACY</Link>
            <Link to="#" className="font-sans text-[12px] font-light text-text-tertiary hover:text-gold transition-colors">TERMS</Link>
            <button onClick={scrollToTop} className="font-label text-[10px] text-gold hover:text-gold-light transition-colors flex items-center gap-2">
              TOP <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
