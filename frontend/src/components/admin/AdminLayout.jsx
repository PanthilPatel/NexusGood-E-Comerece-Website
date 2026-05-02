import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart,
  Users, BarChart2, Ticket, LogOut,
  Menu, X, Bell, Search, Globe, ChevronRight
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'Customers', icon: Users, path: '/admin/users' },
    { label: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
    { label: 'Promotions', icon: Ticket, path: '/admin/coupons' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
            ? 'bg-primary text-white shadow-lg shadow-primary/25'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
      >
        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        {!collapsed && <span className="font-medium tracking-tight">{item.label}</span>}
        {isActive && !collapsed && <ChevronRight size={14} className="ml-auto opacity-50" />}
      </Link>
    );
  };

  return (
  return (
    <div className="min-h-screen bg-space-950 flex">

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[110] bg-space-900 border-r border-white/5 flex flex-col transition-all duration-300 ${collapsed ? 'w-24' : 'w-72'}`}>
        <div className={`p-8 mb-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/40">
                <Package size={18} className="text-white" />
              </div>
              <span className="font-outfit text-xl font-bold">Admin<span className="text-primary">Elite</span></span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            {collapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map(item => <NavItem key={item.path} item={item} />)}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className={`flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Administrator</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent hover:bg-accent/10 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!collapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">

        {/* Header */}
        <header className="h-20 bg-space-950/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-100">
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl focus-within:border-primary/50 transition-all">
              <Search size={18} className="text-slate-500" />
              <input type="text" placeholder="Search resources..." className="bg-transparent border-none text-sm focus:ring-0 w-64 outline-none" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-space-900" />
            </button>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
              <Globe size={16} /> Live Site
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-10 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>

      </main>
    </div>
  );
}
