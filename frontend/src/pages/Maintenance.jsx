import { Wrench, ShieldAlert, Clock } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 font-outfit">
      <div className="max-w-xl w-full text-center space-y-12 animate-fade-in">
        
        {/* Animated Icon Cluster */}
        <div className="relative h-32 flex items-center justify-center">
          <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative">
            <div className="w-20 h-20 bg-[#0f172a] border border-white/10 rounded-3xl flex items-center justify-center text-indigo-500 shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500">
               <Wrench size={40} strokeWidth={1.5} className="animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shadow-xl -rotate-12">
               <ShieldAlert size={16} />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white tracking-tighter">Under Maintenance</h1>
          <p className="text-lg text-slate-400 font-light max-w-md mx-auto leading-relaxed">
            We're currently fine-tuning the NexusGood experience. We'll be back online with enhanced protocols shortly.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
             <Clock size={14} className="text-indigo-500" /> System Update in Progress
          </div>
          <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
             Estimated Uptime: <span className="text-white">60 min</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-white/5">
           <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
             © 2026 NexusGood Enterprise · Protocol Secured
           </p>
        </div>

      </div>
    </div>
  );
}
