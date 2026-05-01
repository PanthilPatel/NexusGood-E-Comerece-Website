import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ShoppingBag, User, Menu, X, 
  LogOut, Package, Shield, Settings, Moon, Sun 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

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

  const navLinks = [
    { name: 'Shop', path: '/products' },
    { name: 'Collections', path: '/collections' },
    { name: 'New Arrivals', path: '/new' },
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

          <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <Search size={20} />
          </button>

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
    </nav>
  );
}
