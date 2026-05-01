import { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, User, Clock, 
  CheckCircle, AlertCircle, ChevronRight, X 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support');
      setTickets(res.data.data);
    } catch (err) {
      toast.error('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSelect = async (id) => {
    try {
      const res = await api.get(`/support/${id}`);
      setSelectedTicket(res.data.ticket);
    } catch (err) {
      toast.error('Could not load ticket details.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/support/${selectedTicket._id}/reply`, { message: reply });
      toast.success('Reply sent.');
      setReply('');
      handleSelect(selectedTicket._id); // Refresh detail
      fetchTickets(); // Refresh list
    } catch (err) {
      toast.error('Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/support/${id}/status`, { status });
      toast.success(`Ticket marked as ${status}`);
      if (selectedTicket?._id === id) handleSelect(id);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex gap-6 animate-fade-in">
      {/* Sidebar List */}
      <div className="w-96 flex flex-col bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
           <h3 className="font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-400" />
              Support Queue
           </h3>
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
              Active Inquiries: {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length}
           </p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
           {loading ? (
             Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
             ))
           ) : tickets.length === 0 ? (
             <div className="py-10 text-center text-slate-500 italic text-sm">No tickets found.</div>
           ) : tickets.map(t => (
             <button 
               key={t._id}
               onClick={() => handleSelect(t._id)}
               className={`w-full text-left p-4 rounded-2xl border transition-all relative ${
                 selectedTicket?._id === t._id 
                 ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                 : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
               }`}
             >
                <div className="flex justify-between items-start mb-2">
                   <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${
                     t.priority === 'urgent' ? 'bg-rose-500 text-white' :
                     t.priority === 'high' ? 'bg-amber-500/20 text-amber-500' :
                     'bg-white/10 text-slate-400'
                   }`}>
                      {t.priority}
                   </span>
                   <span className="text-[9px] font-bold opacity-60">
                      {new Date(t.createdAt).toLocaleDateString()}
                   </span>
                </div>
                <p className="font-bold text-xs truncate mb-1">{t.subject}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold opacity-60 uppercase">
                   <User size={10} /> {t.user?.name}
                </div>
                {t.status === 'open' && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                )}
             </button>
           ))}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-[#0f172a] border border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {!selectedTicket ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
                <MessageSquare size={40} />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Select an inquiry</h3>
                <p className="text-slate-500 max-w-xs text-sm">Pick a support ticket from the queue to start a dialogue with the customer.</p>
             </div>
          </div>
        ) : (
          <>
            {/* Ticket Header */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-lg">
                     {selectedTicket.user?.name?.charAt(0)}
                  </div>
                  <div>
                     <h3 className="font-bold text-white">{selectedTicket.subject}</h3>
                     <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{selectedTicket.user?.name}</span>
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedTicket.status}</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'resolved' && (
                    <button 
                      onClick={() => handleStatus(selectedTicket._id, 'resolved')}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                       Mark Resolved
                    </button>
                  )}
                  <button 
                    onClick={() => handleStatus(selectedTicket._id, 'closed')}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                     <X size={18} />
                  </button>
               </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#030712]/40">
               {/* Original Message */}
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-500"><User size={14} /></div>
                  <div className="space-y-2 max-w-[80%]">
                     <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                        <p className="text-sm text-slate-300 leading-relaxed">{selectedTicket.message}</p>
                     </div>
                     <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
               </div>

               {/* Replies */}
               {selectedTicket.replies?.map((r, i) => (
                 <div key={i} className={`flex gap-4 ${r.sender.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${r.sender.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                       {r.sender.role === 'admin' ? <MessageSquare size={14} /> : <User size={14} />}
                    </div>
                    <div className={`space-y-2 max-w-[80%] ${r.sender.role === 'admin' ? 'text-right' : ''}`}>
                       <div className={`p-4 rounded-2xl ${
                         r.sender.role === 'admin' 
                         ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-100 rounded-tr-none' 
                         : 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-none'
                       }`}>
                          <p className="text-sm leading-relaxed">{r.message}</p>
                       </div>
                       <div className="flex items-center gap-2 justify-end">
                          {r.sender.role === 'admin' && <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Admin Reply</span>}
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(r.createdAt).toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Input Footer */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
               <form onSubmit={handleSendReply} className="relative">
                  <textarea 
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type your response to the customer..."
                    className="w-full bg-[#030712] border border-white/10 rounded-2xl p-4 pr-16 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                    rows={3}
                  />
                  <button 
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="absolute bottom-4 right-4 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20"
                  >
                     <Send size={18} />
                  </button>
               </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
