import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, User, Bot, Minimize2, Maximize2 } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function AIStylist() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'model', text: "Welcome to NexusGood. I am your personal AI Assistant. How can I help you curate your perfect collection today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isAuthenticated) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const { data } = await api.post('/ai/chat', { message: userMsg, history });
      
      setMessages(prev => [...prev, { role: 'model', text: data.data.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "My apologies, but my synchronization protocols are currently experiencing interference. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className={`mb-4 w-80 md:w-96 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 transform ${
          isMinimized ? 'h-16' : 'h-[500px]'
        }`}>
          
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-primary/10">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                   <Sparkles size={16} />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-white tracking-tight">AI Stylist</h4>
                   <p className="text-[8px] text-primary-light font-bold uppercase tracking-[0.2em]">Neural Sync Active</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-slate-500 hover:text-white transition-colors">
                   {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                   <X size={16} />
                </button>
             </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                 {messages.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                           msg.role === 'user' ? 'bg-white/5 text-slate-400' : 'bg-primary/20 text-primary'
                         }`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                         </div>
                         <div className={`p-4 rounded-2xl text-[13px] leading-relaxed ${
                           msg.role === 'user' 
                           ? 'bg-primary text-white rounded-tr-none' 
                           : 'bg-white/5 text-slate-300 rounded-tl-none'
                         }`}>
                            {msg.text}
                         </div>
                      </div>
                   </div>
                 ))}
                 {isLoading && (
                   <div className="flex justify-start">
                      <div className="flex gap-3 items-center">
                         <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center animate-pulse">
                            <Bot size={14} />
                         </div>
                         <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-white/[0.02]">
                 <div className="relative">
                    <input 
                      type="text"
                      placeholder="Ask for styling advice..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={!message.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                       <Send size={14} />
                    </button>
                 </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 bg-primary hover:bg-primary-light text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/40 transition-all active:scale-95"
        >
           <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
           <div className="absolute -top-2 -right-2 px-2 py-1 bg-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg border-2 border-[#030712]">
              Online
           </div>
        </button>
      )}

    </div>
  );
}
