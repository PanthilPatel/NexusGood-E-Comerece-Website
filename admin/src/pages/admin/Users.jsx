import { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, Search, Shield, User, 
  Trash2, Mail, Calendar, Download, 
  MoreHorizontal, ExternalLink, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/users');
      if (res.data?.success && res.data.data) {
        const usersData = res.data.data.users || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Users Fetch Error:', err);
      setError(err.response?.data?.message || 'Failed to sync with member directory.');
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
      toast.success(`Role updated to ${newRole}`);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (error) {
    return (
      <div className="p-12 glass-card border-rose-500/20 text-center space-y-6">
        <AlertCircle size={48} className="text-rose-500 mx-auto" />
        <p className="text-rose-500 font-bold">{error}</p>
        <button onClick={fetchUsers} className="bg-rose-500 text-white px-8 py-2 rounded-xl text-sm font-bold">Retry Directory Sync</button>
      </div>
    );
  }

  const displayUsers = Array.isArray(users) ? users : [];

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="space-y-1">
            <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Member Circle</h1>
            <p className="text-sm text-slate-500 font-light">Manage and oversee all registered signature members.</p>
         </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
         <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input 
               type="text" 
               placeholder="Search members..." 
               className="w-full bg-[#030712]/50 border border-white/10 pl-12 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white" 
            />
         </div>
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active: {displayUsers.length}</span>
         </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl min-h-[400px]">
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     <th className="px-8 py-5">Member Profile</th>
                     <th className="px-8 py-5 text-center">Status</th>
                     <th className="px-8 py-5 text-center">Join Date</th>
                     <th className="px-8 py-5 text-center">Orders</th>
                     <th className="px-8 py-5 text-right">Access Control</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan="5" className="px-8 py-10"><div className="h-8 w-full bg-white/5 rounded-xl animate-pulse" /></td></tr>
                    ))
                  ) : displayUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-slate-500 italic">No members found in directory.</td>
                    </tr>
                  ) : displayUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-white/[0.01] transition-colors group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-outfit font-bold text-xl">
                                {u.name?.charAt(0) || 'U'}
                             </div>
                             <div>
                                <p className="font-bold text-sm text-white tracking-tight">{u.name}</p>
                                <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                            u.role === 'admin' ? 'bg-indigo-600/10 text-indigo-500 border-indigo-500/20' : 'bg-white/5 text-slate-400 border-white/10'
                          }`}>
                             {u.role}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-center text-xs font-bold text-slate-300">
                          {new Date(u.createdAt).toLocaleDateString()}
                       </td>
                       <td className="px-8 py-6 text-center">
                          <span className="text-sm font-bold text-white tracking-tight">{u.orderCount || 0}</span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                             <button 
                               onClick={() => handleRoleToggle(u._id, u.role)}
                               className="p-2.5 text-slate-500 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
                               title="Toggle Admin Access"
                             >
                                <Shield size={18} strokeWidth={1.5} />
                             </button>
                             <button className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                <Trash2 size={18} strokeWidth={1.5} />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}