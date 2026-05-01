import { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, 
  ShieldCheck, Key, LogOut, Camera, Edit3,
  Calendar, CreditCard, ChevronRight, Plus
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('Account Details');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    toast.success('System credentials synchronized successfully.');
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Session terminated.');
  };

  const navItems = [
    { label: 'Account Details', icon: User },
    { label: 'Security & Privacy', icon: Key },
    { label: 'Address Book', icon: MapPin },
    { label: 'Payment Methods', icon: CreditCard },
  ];

  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Security & Privacy':
        return (
          <div className="space-y-12 animate-fade-in">
             <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <div className="space-y-1">
                   <h3 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">Security Protocol</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Manage your access keys and privacy layers</p>
                </div>
             </div>
             
             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <Input label="Current Cipher" type="password" placeholder="••••••••" />
                   <Input label="New Cipher" type="password" placeholder="••••••••" />
                </div>
                <Button className="w-full md:w-auto px-12">Update Credentials</Button>
             </div>

             <div className="pt-12 border-t border-white/5 space-y-6">
                <h4 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-widest">Two-Factor Authentication</h4>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                         <ShieldCheck size={20} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-[var(--text-heading)]">Biometric Sync</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enhanced security layer enabled</p>
                      </div>
                   </div>
                   <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                   </div>
                </div>
             </div>
          </div>
        );
      case 'Address Book':
        return (
          <div className="space-y-12 animate-fade-in">
             <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <div className="space-y-1">
                   <h3 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">Destination Registry</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Manage your primary delivery nodes</p>
                </div>
                {!isAddingAddress && (
                  <Button 
                     onClick={() => setIsAddingAddress(true)}
                     variant="outline" 
                     className="text-[10px] px-6 py-2.5"
                  >
                     <Plus size={14} className="mr-2" /> ADD ADDRESS
                  </Button>
                )}
             </div>

             {isAddingAddress ? (
               <div className="space-y-10 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <Input label="Label (Home/Work)" placeholder="Primary Residence" />
                     <Input label="Street Address" placeholder="123 Elite Plaza" />
                     <Input label="City" placeholder="Cyber City" />
                     <Input label="Postal Index" placeholder="110001" />
                  </div>
                  <div className="flex gap-4 pt-6 border-t border-white/5">
                     <Button 
                       onClick={() => {
                         toast.success('Address synchronized.');
                         setIsAddingAddress(false);
                       }}
                       className="flex-1 py-4"
                     >
                        COMMIT ADDRESS
                     </Button>
                     <Button 
                        variant="outline" 
                        className="flex-1 py-4"
                        onClick={() => setIsAddingAddress(false)}
                     >
                        ABORT
                     </Button>
                  </div>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-white/[0.02] border border-primary/30 rounded-[2rem] space-y-4 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4">
                        <div className="px-2 py-0.5 bg-primary text-white text-[8px] font-bold uppercase tracking-widest rounded-full">Primary</div>
                     </div>
                     <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <MapPin size={20} />
                     </div>
                     <div className="space-y-1">
                        <p className="text-lg font-bold text-[var(--text-heading)]">Main Residence</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                           123 Elite Plaza, Level 42<br />
                           Cyber City, DL 110001
                        </p>
                     </div>
                  </div>
               </div>
             )}
          </div>
        );
      case 'Payment Methods':
        return (
          <div className="space-y-12 animate-fade-in">
             <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <div className="space-y-1">
                   <h3 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">Financial Hub</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Manage your synchronized payment protocols</p>
                </div>
             </div>

             {isAddingPayment ? (
                <div className="space-y-10 animate-slide-up">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Input label="Cardholder Name" placeholder={user?.name} />
                      <Input label="Card Identifier" placeholder="•••• •••• •••• ••••" />
                      <Input label="Expiration Sequence" placeholder="MM / YY" />
                      <Input label="Security Cipher" placeholder="CVV" />
                   </div>
                   <div className="flex gap-4 pt-6 border-t border-white/5">
                      <Button 
                        onClick={() => {
                          toast.success('Financial protocol linked successfully.');
                          setIsAddingPayment(false);
                        }}
                        className="flex-1 py-4"
                      >
                         LINK PROTOCOL
                      </Button>
                      <Button 
                         variant="outline" 
                         className="flex-1 py-4"
                         onClick={() => setIsAddingPayment(false)}
                      >
                         ABORT
                      </Button>
                   </div>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="aspect-[1.6/1] bg-gradient-to-br from-slate-800 to-black p-8 rounded-[2rem] border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start">
                         <div className="w-12 h-10 bg-amber-400/20 rounded-lg border border-amber-400/30 flex flex-col p-1.5 gap-1">
                            <div className="w-full h-1 bg-amber-400/50 rounded-full" />
                            <div className="w-full h-1 bg-amber-400/50 rounded-full" />
                         </div>
                         <CreditCard size={24} className="text-slate-400" />
                      </div>
                      <div className="space-y-4">
                         <p className="text-xl font-bold text-white tracking-[0.2em]">•••• •••• •••• 8842</p>
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Holder</p>
                               <p className="text-xs font-bold text-white uppercase tracking-widest">{user?.name}</p>
                            </div>
                            <div>
                               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Expires</p>
                               <p className="text-xs font-bold text-white tracking-widest">12/28</p>
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   <button 
                     onClick={() => setIsAddingPayment(true)}
                     className="aspect-[1.6/1] border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-slate-600 hover:border-primary/30 hover:text-primary transition-all group"
                   >
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                         <Plus size={24} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Add Protocol</span>
                   </button>
                </div>
             )}
          </div>
        );
      default:
        return (
          <div className="space-y-12 animate-fade-in">
             <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <div className="space-y-1">
                   <h3 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">Profile Core</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Update your primary identity parameters</p>
                </div>
                {!editing && (
                  <Button 
                     onClick={() => setEditing(true)}
                     variant="outline"
                     className="px-6 py-2.5 text-[10px]"
                  >
                     <Edit3 size={14} /> EDIT PROFILE
                  </Button>
                )}
             </div>

             <form onSubmit={handleUpdate} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <Input 
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        readOnly={!editing}
                        className={!editing ? 'border-transparent bg-white/5 cursor-default' : ''}
                      />
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                         <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                               <Mail size={16} />
                            </div>
                            <input 
                              type="email"
                              value={formData.email}
                              readOnly
                              className="w-full bg-white/[0.02] border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm text-slate-400 cursor-not-allowed italic"
                            />
                         </div>
                         <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-2 ml-1">Verified Account.</p>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <Input 
                        label="Phone Number"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        readOnly={!editing}
                        className={!editing ? 'border-transparent bg-white/5 cursor-default' : ''}
                      />
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Member Since</label>
                         <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <Calendar size={18} className="text-primary" />
                            <span className="text-xl font-bold text-[var(--text-heading)] tracking-tight">Jan 12, 2024</span>
                         </div>
                      </div>
                   </div>
                </div>

                {editing && (
                  <div className="flex gap-4 pt-10 border-t border-white/5 animate-slide-up">
                     <Button type="submit" className="flex-1 py-4">SYNCHRONIZE CHANGES</Button>
                     <Button type="button" variant="outline" className="flex-1 py-4" onClick={() => setEditing(false)}>ABORT</Button>
                  </div>
                )}
             </form>

             <div className="pt-12 border-t border-white/5 space-y-8">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Security Hub</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <button 
                     onClick={() => setActiveTab('Security & Privacy')}
                     className="flex flex-col items-start gap-4 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] hover:border-primary/30 transition-all text-left group"
                   >
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                         <Key size={24} />
                      </div>
                      <div className="space-y-1">
                         <span className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-widest">Update Cipher</span>
                         <p className="text-[10px] text-slate-500 leading-relaxed">Modify your primary access key for the system.</p>
                      </div>
                   </button>

                   <button 
                     onClick={handleLogout}
                     className="flex flex-col items-start gap-4 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-accent/10 hover:border-accent/30 transition-all text-left group"
                   >
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                         <LogOut size={24} />
                      </div>
                      <div className="space-y-1">
                         <span className="text-xs font-bold text-accent uppercase tracking-widest">Terminate Session</span>
                         <p className="text-[10px] text-slate-500 leading-relaxed">Sign out from all active protocol nodes.</p>
                      </div>
                   </button>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="pt-32 pb-24 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-4 space-y-8">
             <div className="glass-card p-10 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                
                <div className="relative group">
                   <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-light p-1 shadow-2xl shadow-primary/20 transition-transform duration-500 group-hover:scale-105">
                      <div className="w-full h-full bg-space-950 rounded-[2.3rem] flex items-center justify-center text-4xl font-bold text-white relative overflow-hidden">
                         {user?.name?.charAt(0)}
                         <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer">
                            <Camera size={24} className="text-white" />
                         </div>
                      </div>
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-space-950 rounded-2xl flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                   </div>
                </div>

                <div className="space-y-2">
                   <h2 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">{user?.name}</h2>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                        {user?.role === 'admin' ? 'Signature Admin' : 'Elite Member'}
                      </span>
                   </div>
                </div>

                <div className="w-full pt-8 space-y-2">
                   {navItems.map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => setActiveTab(item.label)}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                          activeTab === item.label 
                          ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                          : 'text-slate-500 hover:bg-white/5 hover:text-[var(--text-heading)]'
                        }`}
                      >
                        <item.icon size={18} className={activeTab === item.label ? 'text-white' : 'text-slate-500 group-hover:text-primary transition-colors'} />
                        <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                        {activeTab === item.label && <ChevronRight size={14} className="ml-auto opacity-50" />}
                      </button>
                   ))}
                </div>
             </div>

             <div className="glass-card p-6 flex items-center gap-4 border-emerald-500/10 hover:bg-emerald-500/[0.02] transition-colors group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                   <ShieldCheck size={24} />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                   Synchronized with enterprise-grade encryption protocol.
                </p>
             </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
             <div className="glass-card p-12 overflow-hidden">
                {renderTabContent()}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}