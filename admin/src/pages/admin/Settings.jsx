import { useState } from 'react';
import { 
  User, Mail, Lock, Shield, 
  Save, Bell, Globe, Database,
  Eye, EyeOff
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    try {
      await api.put('/auth/profile', {
        name: profileData.name,
        email: profileData.email,
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  // Store Config State
  const { maintenanceMode, setMaintenanceMode } = useSettingsStore();
  const [storeConfig, setStoreConfig] = useState({
    name: 'NexusGood Enterprise',
    currency: 'INR',
    supportEmail: 'support@nexusgood.com',
    maintenance: maintenanceMode
  });

  const handleStoreUpdate = async (e) => {
    e.preventDefault();
    try {
      await setMaintenanceMode(storeConfig.maintenance);
      toast.success('Store configuration updated!');
    } catch (err) {
      toast.error('Failed to update store config');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Global Config</h1>
          <p className="text-slate-400 mt-2 font-medium tracking-wide">Manage your administrative profile and system preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'profile', label: 'Admin Profile', icon: User },
            { id: 'security', label: 'Security & Auth', icon: Shield },
            { id: 'notifications', label: 'System Alerts', icon: Bell },
            { id: 'store', label: 'Store Defaults', icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${
                activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Settings Area */}
        <div className="lg:col-span-3">
          <div className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-10">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                          type="text" 
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                          type="email" 
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Current Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                          <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Required for change"
                            value={profileData.currentPassword}
                            onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-12 text-sm text-white focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">New Password</label>
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="New password"
                          value={profileData.newPassword}
                          onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm New</label>
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm new"
                          value={profileData.confirmPassword}
                          onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button 
                      type="submit"
                      className="btn-primary px-10 py-4 flex items-center gap-3 font-bold text-xs uppercase tracking-widest group shadow-2xl shadow-indigo-600/30"
                    >
                      <Save size={18} className="group-hover:scale-110 transition-transform" />
                      Commit Changes
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <div className="space-y-10">
                  <div className="flex items-start gap-8 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem]">
                    <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-600/20 shrink-0">
                      <Shield size={32} className="text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">Two-Factor Authentication</h3>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                        Protect your administrative account with an extra layer of security. Once enabled, you'll need to enter a verification code from your mobile authenticator app (like Google Authenticator or Authy) to log in.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">1</div>
                        <p className="text-sm font-bold text-slate-300">Scan this QR code with your app</p>
                      </div>
                      <div className="p-4 bg-white rounded-3xl w-48 h-48 mx-auto md:mx-0 shadow-2xl shadow-black/50">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`otpauth://totp/NexusGood:${user?.email}?secret=JBSWY3DPEHPK3PXP&issuer=NexusGood`)}`} 
                          alt="2FA QR Code"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">2</div>
                        <p className="text-sm font-bold text-slate-300">Enter the 6-digit verification code</p>
                      </div>
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          maxLength="6"
                          placeholder="000 000"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-center text-4xl font-bold tracking-[0.5em] text-indigo-500 outline-none focus:border-indigo-500 transition-all"
                        />
                        <button className="w-full btn-primary py-4 font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                          Verify & Activate 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'API Status', value: 'Operational', color: 'text-emerald-400' },
                      { label: 'DB Latency', value: '42ms', color: 'text-emerald-400' },
                      { label: 'Security Protocols', value: 'Encrypted', color: 'text-indigo-400' },
                    ].map((stat, i) => (
                      <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Recent Security Events</h3>
                    <div className="space-y-3">
                      {[
                        { event: 'Admin login success', time: '2 mins ago', ip: '122.161.x.x', status: 'Success' },
                        { event: 'Database backup completed', time: '1 hour ago', ip: 'System', status: 'Success' },
                        { event: 'Failed login attempt detected', time: '4 hours ago', ip: '103.44.x.x', status: 'Blocked' },
                      ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all group">
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                            <div>
                              <p className="text-sm font-bold text-white">{log.event}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{log.ip} • {log.time}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                            log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'store' && (
                <form onSubmit={handleStoreUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Store Name</label>
                      <input 
                        type="text" 
                        value={storeConfig.name}
                        onChange={(e) => setStoreConfig({...storeConfig, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-indigo-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Global Currency</label>
                      <select 
                        value={storeConfig.currency}
                        onChange={(e) => setStoreConfig({...storeConfig, currency: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-indigo-500/50 outline-none appearance-none cursor-pointer"
                      >
                        <option value="INR" className="bg-[#0f172a]">INR (₹) - Indian Rupee</option>
                        <option value="USD" className="bg-[#0f172a]">USD ($) - US Dollar</option>
                        <option value="EUR" className="bg-[#0f172a]">EUR (€) - Euro</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Support Email</label>
                      <input 
                        type="email" 
                        value={storeConfig.supportEmail}
                        onChange={(e) => setStoreConfig({...storeConfig, supportEmail: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-indigo-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Maintenance Mode</label>
                      <div 
                        onClick={() => setStoreConfig({...storeConfig, maintenance: !storeConfig.maintenance})}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer group hover:bg-white/[0.08] transition-all"
                      >
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Offline Protocol</span>
                        <div className={`w-12 h-6 rounded-full relative transition-all ${storeConfig.maintenance ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${storeConfig.maintenance ? 'left-7' : 'left-1'}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button type="submit" className="btn-primary px-10 py-4 font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20">
                      Update Store Config
                    </button>
                  </div>
                </form>
              )}


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
