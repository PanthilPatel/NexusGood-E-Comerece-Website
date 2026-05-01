import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full glass-card p-10 text-center space-y-8 border-rose-500/20 shadow-2xl shadow-rose-500/10">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto text-rose-500 border border-rose-500/20">
               <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
               <h1 className="text-3xl font-bold tracking-tight">System Interruption</h1>
               <p className="text-slate-400 text-sm leading-relaxed">
                 A critical exception has occurred in the application layer. Our telemetry has been notified.
               </p>
            </div>
            <div className="flex flex-col gap-3">
               <button 
                 onClick={() => window.location.reload()} 
                 className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
               >
                 <RefreshCcw size={18} /> Reinitialize Session
               </button>
               <a 
                 href="/" 
                 className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold text-sm transition-all text-slate-400 hover:text-white border border-white/5"
               >
                 <Home size={18} /> Return to Sanctum
               </a>
            </div>
            <div className="pt-4 border-t border-white/5">
               <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                 Error Stack: {this.state.error?.message || 'Unknown Exception'}
               </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
