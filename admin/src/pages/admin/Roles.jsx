import { useState, useEffect } from 'react';
import { 
  Shield, User, Search, AlertCircle, 
  CheckCircle2, XCircle, MoreVertical,
  Key, Lock, ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Roles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showElevationModal, setShowElevationModal] = useState(false);
  const [elevationSearch, setElevationSearch] = useState('');
  const [elevatingId, setElevatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data?.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      toast.error('Access Control synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(`Access Protocol Updated: ${newRole.toUpperCase()}`);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error('Unauthorized modification attempt detected');
    }
  };

  const filteredAdmins = users.filter(u => 
    (u.role === 'admin' || u.role === 'root') && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="space-y-1">
            <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Role Intelligence</h1>
            <p className="text-sm text-slate-500 font-light">Manage administrative privileges and high-level access protocols.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Sidebar Controls */}
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 space-y-6">
               <div className="flex items-center gap-4 text-primary">
                  <Shield size={24} />
                  <h3 className="font-bold text-white uppercase tracking-widest text-sm">Security Matrix</h3>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                  Only Root Admins can modify other administrative accounts. Be cautious when granting shielded access.
               </p>
               
               <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                     <Lock className="text-emerald-500" size={18} />
                     <div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Admins</p>
                        <p className="text-xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
                     </div>
                  </div>
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-center gap-4">
                     <ShieldCheck className="text-indigo-500" size={18} />
                     <div>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Shielded Roles</p>
                        <p className="text-xl font-bold text-white">2</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="relative group">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
               <input 
                  type="text" 
                  placeholder="Filter admin registry..." 
                  className="w-full bg-[#0f172a] border border-white/10 pl-12 pr-4 py-3 rounded-2xl text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         {/* Admin Registry */}
         <div className="lg:col-span-8">
            <div className="bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                  <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Authorized Personnel</h4>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-white/5">
                     Level 4 Clearance
                  </span>
               </div>

               <div className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-8 animate-pulse flex items-center gap-6">
                         <div className="w-12 h-12 bg-white/5 rounded-2xl" />
                         <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/4 bg-white/5 rounded" />
                            <div className="h-3 w-1/2 bg-white/5 rounded" />
                         </div>
                      </div>
                    ))
                  ) : filteredAdmins.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                       <AlertCircle size={40} className="text-slate-700 mx-auto" />
                       <p className="text-slate-500 italic text-sm">No authorized personnel found in the filtered matrix.</p>
                    </div>
                  ) : filteredAdmins.map((u) => (
                    <div key={u._id} className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-outfit font-bold text-2xl border ${
                            u.role === 'admin' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                          }`}>
                             {u.name?.charAt(0)}
                          </div>
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <p className="font-bold text-white tracking-tight">{u.name}</p>
                                {u.role === 'root' && (
                                  <span className="px-2 py-0.5 bg-amber-500 text-black text-[8px] font-black uppercase rounded shadow-lg shadow-amber-500/20">Root</span>
                                )}
                             </div>
                             <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-6">
                          <div className="text-right hidden md:block">
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Access Status</p>
                             <div className="flex items-center gap-2 text-emerald-500">
                                <CheckCircle2 size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Active Duty</span>
                             </div>
                          </div>
                          
                          <button 
                            onClick={() => handleRoleToggle(u._id, u.role)}
                            disabled={u.role === 'root'}
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed group-hover:border-primary/30"
                          >
                             <Shield size={14} className="text-primary" />
                             Revoke Access
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Promote Action */}
            <div className="mt-8 p-10 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group">
               <div className="space-y-2 text-center md:text-left">
                  <h4 className="text-xl font-bold text-white">Elevate Member Privileges</h4>
                  <p className="text-sm text-slate-500 font-light">Grant administrative shielding to high-priority staff members.</p>
               </div>
                <button 
                  onClick={() => setShowElevationModal(true)}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 active:scale-95"
                >
                   <Key size={16} /> Initiate Elevation
                </button>
            </div>
         </div>
      </div>
      {/* ── Elevation Command Modal ── */}
      {showElevationModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-space-950/80 backdrop-blur-md" onClick={() => setShowElevationModal(false)} />
           <div className="relative w-full max-w-xl bg-[#020617] border border-white/10 rounded-[2.5rem] p-10 space-y-8 animate-slide-up shadow-2xl">
              <div className="flex justify-between items-center">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Elevate Protocol</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select a member to grant administrative shielding</p>
                 </div>
                 <button onClick={() => setShowElevationModal(false)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
                    <XCircle size={24} />
                 </button>
              </div>

              <div className="relative group">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                 <input 
                  autoFocus
                  type="text" 
                  placeholder="Search by name or identifier..." 
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-2xl text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  value={elevationSearch}
                  onChange={(e) => setElevationSearch(e.target.value)}
                 />
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
                 {users
                  .filter(u => u.role === 'customer' && (u.name.toLowerCase().includes(elevationSearch.toLowerCase()) || u.email.toLowerCase().includes(elevationSearch.toLowerCase())))
                  .slice(0, 5)
                  .map(u => (
                    <div key={u._id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500 font-bold">
                             {u.name?.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-white">{u.name}</p>
                             <p className="text-[10px] text-slate-500 font-medium">{u.email}</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => {
                          handleRoleToggle(u._id, u.role);
                          setShowElevationModal(false);
                          setElevationSearch('');
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/10"
                       >
                          Elevate
                       </button>
                    </div>
                  ))}
                 {elevationSearch.length > 0 && users.filter(u => u.role === 'customer' && u.name.toLowerCase().includes(elevationSearch.toLowerCase())).length === 0 && (
                   <div className="py-12 text-center text-slate-500 text-xs italic">
                      No matching members found in the customer registry.
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
