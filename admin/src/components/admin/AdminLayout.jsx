import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart,
  Users, BarChart2, Ticket, LogOut,
  Menu, Bell, Search, Globe, ChevronRight,
  X, Edit3, Check, ShoppingBag, UserCheck,
  AlertCircle, TrendingUp
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  // Profile edit
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const menuItems = [
    { label: 'Overview',   icon: LayoutDashboard, path: '/admin' },
    { label: 'Products',   icon: Package,          path: '/admin/products' },
    { label: 'Orders',     icon: ShoppingCart,     path: '/admin/orders' },
    { label: 'Customers',  icon: Users,            path: '/admin/users' },
    { label: 'Analytics',  icon: BarChart2,        path: '/admin/analytics' },
    { label: 'Promotions', icon: Ticket,           path: '/admin/coupons' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch notifications (recent orders + low stock)
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const [ordersRes, stockRes] = await Promise.all([
        api.get('/orders?limit=5'),
        api.get('/analytics/inventory'),
      ]);
      const notifs = [];
      const orders = ordersRes.data?.data?.orders || [];
      orders.slice(0, 3).forEach(o => {
        notifs.push({
          id: o._id,
          type: 'order',
          icon: ShoppingBag,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
          title: `New order #${o._id.slice(-6).toUpperCase()}`,
          sub: `₹${o.totalAmount?.toLocaleString('en-IN')} · ${o.status}`,
          time: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        });
      });
      const lowStock = stockRes.data?.lowStockProducts || [];
      lowStock.slice(0, 3).forEach(p => {
        notifs.push({
          id: p._id,
          type: 'stock',
          icon: AlertCircle,
          color: p.stock === 0 ? 'text-rose-400' : 'text-amber-400',
          bg: p.stock === 0 ? 'bg-rose-500/10' : 'bg-amber-500/10',
          title: `Low stock: ${p.name}`,
          sub: `Only ${p.stock} units left`,
          time: 'Now',
        });
      });
      setNotifications(notifs);
    } catch {}
    setNotifLoading(false);
  };

  const handleNotifOpen = () => {
    setNotifOpen(v => !v);
    if (!notifOpen) fetchNotifications();
  };

  // Search products + orders
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const res = await api.get(`/products?search=${encodeURIComponent(q)}&limit=5`);
      const products = res.data?.data?.products || [];
      setSearchResults(products.map(p => ({
        id: p._id,
        label: p.name,
        sub: `₹${p.price?.toLocaleString('en-IN')} · Stock: ${p.stock}`,
        href: '/admin/products',
        icon: Package,
      })));
    } catch {}
  };

  // Save admin name
  const handleSaveName = async () => {
    if (!newName.trim() || newName === user?.name) { setEditingName(false); return; }
    setSavingName(true);
    try {
      await updateProfile({ name: newName.trim() });
      toast.success('Name updated.');
      setEditingName(false);
    } catch { toast.error('Failed to update name.'); }
    setSavingName(false);
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link to={item.path}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}>
        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        {!collapsed && <span className="font-medium tracking-tight">{item.label}</span>}
        {isActive && !collapsed && <ChevronRight size={14} className="ml-auto opacity-50" />}
      </Link>
    );
  };

  return (
    <div className={`min-h-screen bg-[#030712] flex ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`} style={{ '--sidebar-width': collapsed ? '5rem' : '18rem' }}>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[600] bg-[#0f172a] border-r border-white/[0.06] flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
        {/* Logo */}
        <div className={`p-6 mb-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/40">
                <Package size={16} className="text-white" />
              </div>
              <span className="font-outfit text-lg font-bold text-white">Shop<span className="text-indigo-400">Elite</span></span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map(item => <NavItem key={item.path} item={item} />)}
        </nav>

        {/* Profile section */}
        <div className="p-4 border-t border-white/[0.06] space-y-3">
          <div className={`flex items-center gap-3 p-3 bg-white/[0.04] rounded-2xl border border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500/60 min-w-0"
                      autoFocus
                    />
                    <button onClick={handleSaveName} disabled={savingName}
                      className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded transition-all">
                      <Check size={12} />
                    </button>
                    <button onClick={() => setEditingName(false)}
                      className="p-1 text-slate-500 hover:bg-white/5 rounded transition-all">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group/name">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <button onClick={() => { setNewName(user?.name || ''); setEditingName(true); }}
                      className="opacity-0 group-hover/name:opacity-100 p-0.5 text-slate-500 hover:text-white transition-all">
                      <Edit3 size={11} />
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Root Admin</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all text-sm font-medium ${collapsed ? 'justify-center' : ''}`}>
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">

        {/* Header */}
        <header className="h-16 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-50">

          {/* Search */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.04] border border-white/[0.07] rounded-xl focus-within:border-indigo-500/50 transition-all w-72">
              <Search size={15} className="text-slate-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => { handleSearch(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                className="bg-transparent border-none text-sm text-white focus:ring-0 outline-none w-full placeholder:text-slate-600"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="text-slate-500 hover:text-white transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Search dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 left-0 w-full bg-[#0f172a] border border-white/[0.07] rounded-2xl shadow-2xl overflow-hidden z-50">
                {searchResults.map(r => (
                  <Link key={r.id} to={r.href} onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <r.icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.label}</p>
                      <p className="text-[11px] text-slate-500">{r.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {searchOpen && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full mt-2 left-0 w-full bg-[#0f172a] border border-white/[0.07] rounded-2xl shadow-2xl p-4 text-center z-50">
                <p className="text-sm text-slate-500">No products found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={handleNotifOpen}
                className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0f172a]" />
              </button>

              {/* Notification panel */}
              {notifOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#0f172a] border border-white/[0.07] rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <p className="font-bold text-white text-sm">Notifications</p>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{notifications.length} new</span>
                  </div>
                  {notifLoading ? (
                    <div className="p-6 text-center">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">All caught up!</div>
                  ) : (
                    <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
                      {notifications.map((n, i) => (
                        <div key={i} className="flex items-start gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                          <div className={`w-8 h-8 ${n.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <n.icon size={14} className={n.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.sub}</p>
                          </div>
                          <span className="text-[10px] text-slate-600 flex-shrink-0 mt-1">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-5 py-3 border-t border-white/[0.06]">
                    <Link to="/admin/orders" onClick={() => setNotifOpen(false)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                      View all orders →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-white/10" />

            <a href="http://localhost:5173" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
              <Globe size={14} /> Live Site
            </a>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 relative overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
