import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Users, BarChart2, Ticket, LogOut, 
  Menu, X, Bell, Search, Globe, ChevronRight,
  Settings, HelpCircle, User, Shield, Plus, BrainCircuit
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import NotificationPanel from './NotificationPanel';
import { io } from 'socket.io-client';

const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Connect to the base URL (remove /api if present)
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://nexus-api-s7co.onrender.com';
    const socket = io(socketUrl);
    
    socket.on('connect', () => {
      socket.emit('join_admin');
    });

    socket.on('new_order', (data) => {
      toast.success(`New Order from ${data.customer}!`, {
        icon: '🛍️',
        duration: 6000,
      });
      
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.play().catch(e => console.error('Audio play failed:', e));

      // Trigger automatic refresh for the Orders page
      window.dispatchEvent(new CustomEvent('refresh-orders'));
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { group: 'Control', items: [
      { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
      { label: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
    ]},
    { group: 'Inventory & Logistics', items: [
      { label: 'Products', icon: Package, path: '/admin/products' },
      { label: 'Inventory Intelligence', icon: BrainCircuit, path: '/admin/inventory' },
      { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
      { label: 'Bulk Import', icon: Plus, path: '/admin/import' },
    ]},
    { group: 'Users & Marketing', items: [
      { label: 'Customers', icon: Users, path: '/admin/users' },
      { label: 'Role Intelligence', icon: Shield, path: '/admin/roles' },
      { label: 'Promotions', icon: Ticket, path: '/admin/coupons' },
    ]},
    { group: 'Support & Moderation', items: [
      { label: 'Reviews', icon: HelpCircle, path: '/admin/reviews' },
      { label: 'Support Tickets', icon: Settings, path: '/admin/support' },
    ]},
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Admin session terminated.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-transparent flex text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar Navigation */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-[#0f172a]/40 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-all duration-500 z-[100] ${
          collapsed ? 'w-20' : 'w-72'
        } shadow-2xl shadow-black/50`}
      >
        {/* Brand Node */}
        <div className="h-24 flex items-center px-6 border-b border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent" />
           <div className={`flex items-center gap-4 transition-all duration-500 ${collapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 flex-shrink-0">
                 <Shield size={20} className="text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                   <span className="font-bold text-lg tracking-tight text-white uppercase">Nexus<span className="text-indigo-500">Good</span></span>
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Enterprise Control v2.4</span>
                </div>
              )}
           </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar">
          {menuItems.map((group, idx) => (
            <div key={idx} className="space-y-3">
              {!collapsed && (
                <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  {group.group}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map(item => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group ${
                      location.pathname === item.path 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={20} strokeWidth={2} className={location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400 transition-colors'} />
                    {!collapsed && <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>}
                    {location.pathname === item.path && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-black/10">
           <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all group ${collapsed ? 'justify-center' : ''}`}
           >
             <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
             {!collapsed && <span className="font-bold text-xs uppercase tracking-widest">Terminate</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Node */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ${collapsed ? 'ml-20' : 'ml-72'}`}>
        
        {/* Global Control Header */}
        <header 
          className={`h-24 sticky top-0 z-[90] flex items-center justify-between px-10 transition-all duration-300 ${
            scrolled ? 'bg-black/20 backdrop-blur-xl border-b border-white/5 shadow-xl' : 'bg-transparent'
          }`}
        >
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setCollapsed(!collapsed)} 
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                 {collapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-slate-500 focus-within:border-indigo-500/50 focus-within:text-indigo-400 transition-all">
                 <Search size={16} />
                 <input type="text" placeholder="Search protocol..." className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-64" />
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="relative" ref={notificationRef}>
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`w-10 h-10 flex items-center justify-center border rounded-xl transition-all relative ${
                        showNotifications 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50'
                      }`}
                    >
                       <Bell size={18} />
                       <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#020617]" />
                    </button>
                    {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
                 </div>
                 <a href="https://nexus-good-e-coomerece-website.vercel.app" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-emerald-400 transition-all" title="View Storefront">
                    <Globe size={18} />
                 </a>
              </div>
              <div className="h-8 w-[1px] bg-white/5" />
              <div className="relative" ref={profileRef}>
                <div 
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                   <div className="text-right">
                      <p className="text-xs font-bold text-white uppercase tracking-tight">{user?.name}</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Root Admin</p>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                      <div className="w-full h-full bg-[#0f172a] rounded-[0.8rem] flex items-center justify-center font-bold text-white text-lg">
                         {user?.name?.charAt(0)}
                      </div>
                   </div>
                </div>

                {showProfile && (
                  <div className="absolute right-0 top-full mt-4 w-64 bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[200] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                       <p className="text-xs font-bold text-white uppercase tracking-tight">{user?.name}</p>
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{user?.email}</p>
                    </div>
                    <div className="p-2">
                       <button onClick={() => { setShowProfile(false); navigate('/admin/settings'); }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                          <Settings size={16} />
                          <span className="text-xs font-bold uppercase tracking-widest">Global Config</span>
                       </button>
                       <button onClick={() => { setShowProfile(false); navigate('/admin/roles'); }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                          <Shield size={16} />
                          <span className="text-xs font-bold uppercase tracking-widest">Permissions</span>
                       </button>
                       <div className="h-[1px] bg-white/5 my-2 mx-4" />
                       <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                       >
                          <LogOut size={16} />
                          <span className="text-xs font-bold uppercase tracking-widest">Terminate Session</span>
                       </button>
                    </div>
                  </div>
                )}
              </div>
           </div>
        </header>

        {/* Content Projection Area */}
        <main className="flex-1 p-10 space-y-10 max-w-[1600px] mx-auto w-full">
           <Outlet />
        </main>

        {/* System Footer */}
        <footer className="p-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
             &copy; 2024 NexusGood Enterprise Control Panel. All protocols secured.
           </p>
           <div className="flex items-center gap-8">
              <Link to="#" className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">Terms</Link>
              <Link to="#" className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">Privacy</Link>
              <Link to="#" className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">Support</Link>
           </div>
        </footer>
      </div>
    </div>
  );
}
