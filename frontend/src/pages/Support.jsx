import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, MessageSquare, ShieldCheck, 
  LifeBuoy, Mail, Phone, ChevronRight,
  Clock, CheckCircle2, X
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Support() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'create', 'detail'
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState({ subject: '', category: 'Order Issue', message: '' });
  const [replyMessage, setReplyMessage] = useState('');

  const categories = ['Order Issue', 'Technical Support', 'Billing Inquiry', 'Feature Request', 'Other'];

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/support');
      setTickets(res.data.tickets || []);
    } catch (err) {
      toast.error('Failed to sync ticket registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/support', form);
      toast.success('Inquiry transmitted to central intelligence.');
      setForm({ subject: '', category: 'Order Issue', message: '' });
      fetchTickets();
      setView('list');
    } catch (err) {
      toast.error('Transmission failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      await api.post(`/support/${selectedTicket._id}/reply`, { message: replyMessage });
      const res = await api.get(`/support/${selectedTicket._id}`);
      setSelectedTicket(res.data.ticket);
      setReplyMessage('');
      toast.success('Message synchronized.');
    } catch (err) {
      toast.error('Sync failed.');
    }
  };

  const openDetail = async (ticket) => {
    setLoading(true);
    try {
      const res = await api.get(`/support/${ticket._id}`);
      setSelectedTicket(res.data.ticket);
      setView('detail');
    } catch (err) {
      toast.error('Could not access ticket data.');
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchTickets();
  }, []);

  return (
    <div className="pt-32 pb-24 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 relative">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative">
           <div className="space-y-2">
              <h1 className="text-5xl font-bold tracking-tight text-white">Support <span className="text-primary">Hub</span></h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Interface for customer-admin synchronization</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex gap-4">
                 <button 
                   onClick={() => setView('list')}
                   className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'list' ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                 >
                   Protocol Archive
                 </button>
                 <button 
                   onClick={() => setView('create')}
                   className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'create' ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                 >
                   Initialize Ticket
                 </button>
              </div>

              <div className="w-px h-10 bg-white/5 mx-2" />

              <button 
                onClick={() => navigate('/')} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 group shadow-xl"
                title="Close Support Hub"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform" />
              </button>
           </div>
        </div>

        {view === 'list' && (
          <div className="grid grid-cols-1 gap-6 animate-fade-in">
             {loading && tickets.length === 0 ? (
               <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
             ) : tickets.length === 0 ? (
               <div className="py-32 flex flex-col items-center justify-center gap-6 glass-card border-dashed">
                  <MessageSquare size={48} className="text-slate-700" />
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.2em]">No active communication logs found</p>
                  <button onClick={() => setView('create')} className="btn-primary px-8 py-3 text-[10px]">Start New Dialogue</button>
               </div>
             ) : (
               tickets.map(t => (
                 <div 
                   key={t._id} 
                   onClick={() => openDetail(t)}
                   className="p-8 glass-card border-white/5 hover:border-primary/30 transition-all cursor-pointer group flex items-center justify-between"
                 >
                    <div className="flex items-center gap-6">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                          <MessageSquare size={24} />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{t.subject}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.category || 'Support'}</span>
                             <span className="w-1 h-1 bg-slate-700 rounded-full" />
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className={`px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${
                         t.status === 'resolved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                         t.status === 'open' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                         'bg-white/5 border-white/10 text-slate-500'
                       }`}>
                          {t.status}
                       </div>
                       <ChevronRight size={18} className="text-slate-700 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                    </div>
                 </div>
               ))
             )}
          </div>
        )}

        {view === 'create' && (
          <div className="max-w-3xl mx-auto glass-card p-12 animate-slide-up">
             <form onSubmit={handleCreate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50"
                        value={form.subject}
                        onChange={(e) => setForm({...form, subject: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none"
                        value={form.category}
                        onChange={(e) => setForm({...form, category: e.target.value})}
                      >
                         {categories.map(c => <option key={c} value={c} className="bg-space-900">{c}</option>)}
                      </select>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Message</label>
                   <textarea 
                     rows={6}
                     required
                     className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 resize-none"
                     value={form.message}
                     onChange={(e) => setForm({...form, message: e.target.value})}
                   />
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary py-5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                   {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Transmit Inquiry</>}
                </button>
             </form>
          </div>
        )}

        {view === 'detail' && selectedTicket && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
             <button onClick={() => setView('list')} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                <ChevronRight size={14} className="rotate-180" /> Back to Registry
             </button>

             <div className="glass-card overflow-hidden">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                   <div>
                      <h2 className="text-2xl font-bold text-white">{selectedTicket.subject}</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Ticket ID: #{selectedTicket._id.slice(-8).toUpperCase()}</p>
                   </div>
                   <div className={`px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${
                     selectedTicket.status === 'resolved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                   }`}>
                      {selectedTicket.status}
                   </div>
                </div>

                <div className="p-10 space-y-10 max-h-[600px] overflow-y-auto custom-scrollbar">
                   {/* Initial Message */}
                   <div className="flex gap-6 items-start">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0 font-bold">U</div>
                      <div className="space-y-2 max-w-2xl">
                         <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-none">
                            <p className="text-sm text-slate-300 leading-relaxed">{selectedTicket.message}</p>
                         </div>
                         <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest ml-1">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                      </div>
                   </div>

                   {/* Replies */}
                   {selectedTicket.replies?.map((r, i) => {
                     const isAdmin = r.sender?._id !== selectedTicket.user; // Simplified check
                     return (
                       <div key={i} className={`flex gap-6 items-start ${isAdmin ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${isAdmin ? 'bg-indigo-500/20 text-indigo-400' : 'bg-primary/20 text-primary'}`}>
                             {isAdmin ? 'A' : 'U'}
                          </div>
                          <div className={`space-y-2 max-w-2xl ${isAdmin ? 'items-end' : ''}`}>
                             <div className={`p-6 border border-white/5 rounded-2xl ${isAdmin ? 'bg-indigo-500/5 rounded-tr-none text-right' : 'bg-white/[0.03] rounded-tl-none'}`}>
                                <p className="text-sm text-slate-300 leading-relaxed">{r.message}</p>
                             </div>
                             <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mx-1">{new Date(r.createdAt).toLocaleString()} {isAdmin && '· Admin Response'}</p>
                          </div>
                       </div>
                     );
                   })}
                </div>

                {selectedTicket.status !== 'closed' && (
                  <div className="p-8 bg-white/[0.02] border-t border-white/5">
                     <form onSubmit={handleReply} className="flex gap-4">
                        <input 
                          type="text" 
                          placeholder="Type your response..."
                          className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        <button type="submit" className="p-4 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                           <Send size={20} />
                        </button>
                     </form>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
