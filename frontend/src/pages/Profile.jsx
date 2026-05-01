import { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, 
  ShieldCheck, Key, LogOut, Camera, Edit3,
  Calendar, CreditCard, ChevronRight, Plus, Wallet, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import walletService from '../services/walletService';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout, updateProfile, changePassword, addAddress, deleteAddress, isLoading } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('Account Details');
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [addressForm, setAddressForm] = useState({
    label: '',
    street: '',
    city: '',
    zipCode: '',
    isPrimary: false
  });

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name: formData.name });
      toast.success('System credentials synchronized successfully.');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Synchronization failed.');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Ciphers do not match.');
    }
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Access keys rotated successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Key rotation failed.');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(addressForm);
      toast.success('Destination synchronized.');
      setIsAddingAddress(false);
      setAddressForm({ label: '', street: '', city: '', zipCode: '', isPrimary: false });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sync failed.');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
      toast.success('Node decommissioned.');
    } catch (error) {
      toast.error('Decommission failed.');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Session terminated.');
  };

  const navItems = [
    { label: 'Account Details', icon: User },
    { label: 'Security & Privacy', icon: Key },
    { label: 'Address Book', icon: MapPin },
    { label: 'Wallet & Credits', icon: Wallet },
    { label: 'Payment Methods', icon: CreditCard },
  ];

  const fetchWallet = async () => {
    setWalletLoading(true);
    try {
      const data = await walletService.getWallet();
      setWallet(data.data);
    } catch (error) {
      toast.error('Failed to sync wallet data.');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleTabChange = (label) => {
    setActiveTab(label);
    if (label === 'Wallet & Credits') {
      fetchWallet();
    }
  };

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
             
             <form onSubmit={handlePasswordUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <Input 
                      label="Current Cipher" 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                   />
                   <div className="hidden md:block" />
                   <Input 
                      label="New Cipher" 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                   />
                   <Input 
                      label="Confirm Cipher" 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                   />
                </div>
                <Button type="submit" loading={isLoading} className="w-full md:w-auto px-12">Rotate Access Keys</Button>
             </form>

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
                <form onSubmit={handleAddAddress} className="space-y-10 animate-slide-up">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Input 
                         label="Label (Home/Work)" 
                         placeholder="Primary Residence" 
                         value={addressForm.label}
                         onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                         required
                      />
                      <Input 
                         label="Street Address" 
                         placeholder="123 Elite Plaza" 
                         value={addressForm.street}
                         onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                         required
                      />
                      <Input 
                         label="City" 
                         placeholder="Cyber City" 
                         value={addressForm.city}
                         onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                         required
                      />
                      <Input 
                         label="Postal Index" 
                         placeholder="110001" 
                         value={addressForm.zipCode}
                         onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                         required
                      />
                   </div>
                   <div className="flex items-center gap-2">
                      <input 
                         type="checkbox" 
                         id="isPrimary"
                         checked={addressForm.isPrimary}
                         onChange={(e) => setAddressForm({...addressForm, isPrimary: e.target.checked})}
                         className="w-4 h-4 rounded bg-white/5 border-white/10 text-primary focus:ring-primary/20"
                      />
                      <label htmlFor="isPrimary" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer">
                         Set as primary node
                      </label>
                   </div>
                   <div className="flex gap-4 pt-6 border-t border-white/5">
                      <Button 
                        type="submit"
                        loading={isLoading}
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
                </form>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {user?.addresses?.length > 0 ? (
                      user.addresses.map((addr) => (
                         <div key={addr._id} className="p-8 bg-white/[0.02] border border-white/5 hover:border-primary/30 rounded-[2rem] space-y-4 relative overflow-hidden group transition-all">
                            {addr.isPrimary && (
                               <div className="absolute top-0 right-0 p-4">
                                  <div className="px-2 py-0.5 bg-primary text-white text-[8px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">Primary</div>
                               </div>
                            )}
                            <div className="flex justify-between items-start">
                               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                  <MapPin size={20} />
                               </div>
                               <button 
                                 onClick={() => handleDeleteAddress(addr._id)}
                                 className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-accent transition-all"
                               >
                                  <LogOut size={16} className="rotate-180" />
                               </button>
                            </div>
                            <div className="space-y-1">
                               <p className="text-lg font-bold text-[var(--text-heading)]">{addr.label}</p>
                               <p className="text-xs text-slate-500 leading-relaxed">
                                  {addr.street}<br />
                                  {addr.city}, {addr.zipCode}
                                </p>
                            </div>
                         </div>
                      ))
                   ) : (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center gap-4 text-slate-600">
                         <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                            <MapPin size={32} className="opacity-20" />
                         </div>
                         <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No addresses found in registry</p>
                      </div>
                   )}
                </div>
             )}
          </div>
        );
      case 'Wallet & Credits':
        return (
          <div className="space-y-12 animate-fade-in">
             <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div className="space-y-1">
                   <h3 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">Digital Vault</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Manage your credits and loyalty rewards</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Loyalty Tier</p>
                   <div className={`px-4 py-1.5 rounded-full border font-bold text-xs tracking-widest ${
                     user?.loyaltyTier === 'Platinum' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                     user?.loyaltyTier === 'Gold' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                     user?.loyaltyTier === 'Silver' ? 'bg-slate-300/10 border-slate-300/30 text-slate-300' :
                     'bg-orange-500/10 border-orange-500/30 text-orange-400'
                   }`}>
                      {user?.loyaltyTier?.toUpperCase() || 'BRONZE'}
                   </div>
                </div>
             </div>

             {walletLoading ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Synchronizing Vault...</p>
               </div>
             ) : (
               <div className="space-y-10">
                  {/* Balance Card */}
                  <div className="relative overflow-hidden p-10 bg-gradient-to-br from-primary/20 to-space-900 border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                     <div className="space-y-2 relative z-10 text-center md:text-left">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Available Credits</p>
                        <h4 className="text-5xl font-bold text-white tracking-tighter">
                           ₹{wallet?.balance?.toLocaleString() || '0'}
                        </h4>
                     </div>
                     <div className="flex gap-4 relative z-10">
                        <Button 
                          onClick={() => toast.success('Recharge portal opening soon.')}
                          className="px-8 py-3.5 text-[10px] bg-white text-black hover:bg-slate-200"
                        >
                           TOP UP CREDITS
                        </Button>
                     </div>
                  </div>

                  {/* Refer & Earn Section */}
                  <div className="p-8 bg-indigo-600/10 border border-indigo-600/20 rounded-[2rem] space-y-6 relative overflow-hidden group">
                     <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                     <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                           <UserPlus size={24} />
                        </div>
                        <div>
                           <h4 className="text-xl font-bold text-white">Refer & Earn Credits</h4>
                           <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Viral Growth Protocol</p>
                        </div>
                     </div>
                     <p className="text-xs text-slate-400 leading-relaxed max-w-md relative z-10">
                        Share your unique referral code with friends. When they register, you receive <span className="text-white font-bold">₹100 credits</span> in your Digital Vault instantly.
                     </p>
                     <div className="flex items-center gap-3 relative z-10">
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between">
                           <span className="text-lg font-mono font-bold text-indigo-400 tracking-widest uppercase">{user?.referralCode || 'ELITE001'}</span>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(user?.referralCode);
                               toast.success('Referral code copied to clipboard!');
                             }}
                             className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                           >
                              COPY CODE
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Transaction History */}
                  <div className="space-y-6">
                     <h4 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-widest">Protocol Ledger</h4>
                     <div className="space-y-3">
                        {wallet?.transactions?.length > 0 ? (
                          wallet.transactions.map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-accent/10 text-accent'
                                  }`}>
                                     {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-[var(--text-heading)]">{tx.description}</p>
                                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        {new Date(tx.createdAt).toLocaleDateString()} · {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                     </p>
                                  </div>
                               </div>
                               <div className={`text-sm font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-[var(--text-heading)]'}`}>
                                  {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                               </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center gap-3">
                             <Wallet className="text-slate-700" size={32} />
                             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No transaction records found</p>
                          </div>
                        )}
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
                            <span className="text-xl font-bold text-[var(--text-heading)] tracking-tight">
                               {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 12, 2024'}
                            </span>
                         </div>
                      </div>
                   </div>
                </div>

                {editing && (
                  <div className="flex gap-4 pt-10 border-t border-white/5 animate-slide-up">
                     <Button type="submit" loading={isLoading} className="flex-1 py-4">SYNCHRONIZE CHANGES</Button>
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
                        onClick={() => handleTabChange(item.label)}
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