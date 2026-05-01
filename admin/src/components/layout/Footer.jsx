import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Subscribed to newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-dark-900 text-dark-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SE</span>
              </div>
              <span className="text-xl font-bold text-white">
                Shop<span className="text-primary-400">Elite</span>
              </span>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed">
              Premium shopping experience with curated products, fast delivery, and exclusive deals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm hover:text-primary-400 transition-colors">All Products</Link></li>
              <li><Link to="/orders" className="text-sm hover:text-primary-400 transition-colors">My Orders</Link></li>
              <li><Link to="/cart" className="text-sm hover:text-primary-400 transition-colors">Cart</Link></li>
              <li><Link to="/profile" className="text-sm hover:text-primary-400 transition-colors">Profile</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary-400" /> support@nexusgood.com
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary-400" /> +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary-400" /> Mumbai, India
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-dark-400 mb-3">Get the latest deals and updates.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                id="newsletter-email"
              />
              <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-10 pt-6 text-center text-sm text-dark-500">
          © {new Date().getFullYear()} NexusGood. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
