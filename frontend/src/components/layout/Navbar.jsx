import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ShoppingBag, User, Menu, X, 
  LogOut, Package, Shield, Settings, Moon, Sun, Heart 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { products: wishlistItems } = useWishlistStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navSearchTerm, setNavSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  // Real-time search logic
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (navSearchTerm.trim().length > 1) {
        setIsSearching(true);
        try {
          const { data } = await api.get(`/products?search=${navSearchTerm}`);
          setSearchResults(data.data?.products?.slice(0, 5) || []);
        } catch (err) {
          console.error('Search synchronization failed');
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [navSearchTerm]);

  const navLinks = [
    { name: 'Shop', path: '/products' },
    { name: 'Collections', path: '/collections' },
    { name: 'New Arrivals', path: '/new' },
    { name: 'Support', path: '/support' },
  ];


  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
      scrolled ? 'glass-panel py-3 shadow-xl' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/40 group-hover:rotate-12 transition-transform">
            <ShoppingBag className="text-white" size={22} />
          </div>
          <span className="font-outfit text-2xl font-bold tracking-tight">
            Nexus<span className="text-primary">Good</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`font-medium transition-colors ${
                location.pathname === link.path ? 'text-primary' : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={() => setSearchOpen(true)}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <Search size={20} />
          </button>

          <Link to="/wishlist" className="relative p-2.5 text-slate-400 hover:text-rose-500 hover:bg-white/5 rounded-full transition-all group">
            <Heart size={20} className="group-hover:fill-rose-500 transition-all" />
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-space-950 animate-pulse">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-space-950">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all"
              >
                <span className="text-sm font-medium text-slate-300">{user?.name?.split(' ')[0]}</span>
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user?.name.charAt(0)}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 glass-card border-white/10 p-2 shadow-2xl animate-fade-in">
                  <div className="px-4 py-3 border-b border-white/5 mb-1">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Account</p>
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <User size={16} /> Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Package size={16} /> My Orders
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-all">
                    <Heart size={16} /> My Sanctuary
                  </Link>
                  <div className="h-px bg-white/5 my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-accent/5 rounded-lg transition-all"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-5 text-sm rounded-full">
              Sign In
            </Link>
          )}

          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[101] bg-space-950 flex flex-col p-8 animate-fade-in">
          <div className="flex justify-between items-center mb-12">
             <span className="font-outfit text-2xl font-bold text-white">Nexus<span className="text-primary">Good</span></span>
             <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400"><X size={32} /></button>
          </div>
          <div className="flex flex-col gap-6 text-2xl font-semibold text-white">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}>{link.name}</Link>
            ))}
            <div className="h-px bg-white/5 my-4" />
            {!isAuthenticated ? (
              <Link to="/login" className="text-primary" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            ) : (
              <button onClick={handleLogout} className="text-accent text-left">Sign Out</button>
            )}
          </div>
        </div>
      )}
      {/* ── Global Search Overlay ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200] bg-space-950/95 backdrop-blur-2xl animate-fade-in flex flex-col p-8 md:p-24">
           <div className="max-w-4xl mx-auto w-full space-y-12">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Registry Index Search</span>
                 <button 
                  onClick={() => { setSearchOpen(false); setNavSearchTerm(''); }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5"
                 >
                    <X size={24} />
                 </button>
              </div>

              <div className="relative group">
                 <Search size={32} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-primary transition-colors" />
                 <input 
                  autoFocus
                  type="text" 
                  placeholder="Search artifact name, category, or code..." 
                  className="w-full bg-transparent border-b-2 border-white/10 py-8 pl-16 text-4xl font-bold text-white placeholder:text-slate-800 focus:outline-none focus:border-primary transition-all"
                  value={navSearchTerm}
                  onChange={(e) => setNavSearchTerm(e.target.value)}
                 />
                 {isSearching && (
                   <div className="absolute right-0 top-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {/* Live Results */}
                 <div className="space-y-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Matched Artifacts</p>
                    <div className="space-y-4">
                       {searchResults.length > 0 ? searchResults.map(product => (
                         <Link 
                          key={product._id} 
                          to={`/products/${product._id}`}
                          onClick={() => { setSearchOpen(false); setNavSearchTerm(''); }}
                          className="flex items-center gap-6 p-4 hover:bg-white/5 rounded-[2rem] transition-all group border border-transparent hover:border-white/5"
                         >
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5">
                               <img src={product.images?.[0]?.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" alt="" />
                            </div>
                            <div>
                               <p className="font-bold text-white group-hover:text-primary transition-colors">{product.name}</p>
                               <p className="text-xs text-slate-500 font-medium tracking-tight">₹{product.price?.toLocaleString('en-IN')}</p>
                            </div>
                         </Link>
                       )) : navSearchTerm.trim().length > 1 && !isSearching ? (
                         <div className="py-10 text-center space-y-2">
                            <p className="text-sm text-slate-500 italic">No artifacts found matching your query.</p>
                            <p className="text-[10px] text-slate-700 uppercase tracking-widest">Try adjusting your search parameters</p>
                         </div>
                       ) : (
                         <p className="text-sm text-slate-600 italic">Enter search parameters to query the registry.</p>
                       )}
                    </div>
                 </div>

                 {/* Quick Shortcuts */}
                 <div className="space-y-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Directives</p>
                    <div className="grid grid-cols-1 gap-3">
                       {[
                         { name: 'All Collections', path: '/products', icon: Package },
                         { name: 'Your Sanctuary', path: '/wishlist', icon: Heart },
                         { name: 'Order Protocol', path: '/orders', icon: Shield },
                         { name: 'Support Node', path: '/support', icon: Settings }
                       ].map(link => (
                         <Link 
                          key={link.path} 
                          to={link.path}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                         >
                            <link.icon size={18} className="group-hover:text-primary transition-colors" />
                            <span className="text-xs font-bold uppercase tracking-widest">{link.name}</span>
                         </Link>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </nav>
  );
}
