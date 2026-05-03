import { useState } from 'react';
import { 
  User, Mail, Lock, Shield, 
  Save, Bell, Globe, Database,
  Eye, EyeOff
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
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
      toast.success('Profile updated successfully! Refreshing session...');
      // In a real app, you might want to re-login if email/password changed
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
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
                <div className="space-y-8 text-center py-20">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Shield size={40} className="text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Two-Factor Authentication</h3>
                  <p className="text-slate-400 max-w-md mx-auto">Enhance your account security by adding a secondary verification layer.</p>
                  <button className="btn-primary px-10 py-4 font-bold text-xs uppercase tracking-widest opacity-50 cursor-not-allowed">
                    Configure 2FA (Coming Soon)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
