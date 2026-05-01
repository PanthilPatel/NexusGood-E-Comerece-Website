import { useState } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertCircle, 
  HelpCircle, Trash2, ArrowRight, Table 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminImport() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.type === 'text/csv' || selected.name.endsWith('.csv'))) {
      setFile(selected);
      setResults(null);
    } else {
      toast.error('Please select a valid CSV file.');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      
      const res = await api.post('/products/bulk-import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResults(res.data);
      toast.success('Import completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div className="text-center space-y-2">
         <h1 className="text-4xl font-outfit font-bold text-white tracking-tight">Bulk Logistics</h1>
         <p className="text-slate-500 text-sm">Upload CSV files to synchronize your catalog at scale.</p>
      </div>

      {/* Main Upload Zone */}
      <div className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
         
         {!results ? (
            <div className="space-y-8">
               <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-indigo-500/30 transition-all relative group bg-black/20">
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                     <Upload size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                     {file ? file.name : 'Select Catalog Source'}
                  </h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                     {file 
                       ? `${(file.size / 1024).toFixed(2)} KB · Ready to process` 
                       : 'Drag and drop your product CSV here or click to browse files.'}
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: 'Format', desc: 'Use UTF-8 CSV', icon: FileText },
                    { title: 'Columns', desc: 'Name, Price, Category...', icon: Table },
                    { title: 'Images', desc: 'Provide valid URLs', icon: HelpCircle },
                  ].map((info, i) => (
                    <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4">
                       <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><info.icon size={16} /></div>
                       <div>
                          <p className="text-xs font-bold text-white uppercase tracking-widest">{info.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{info.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <button 
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
               >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Analyzing Logistics...</>
                  ) : (
                    <><ArrowRight size={18} /> Execute Bulk Synchronize</>
                  )}
               </button>
            </div>
         ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="flex items-center gap-6 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                     <CheckCircle size={32} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-bold text-white">Import Complete</h3>
                     <p className="text-emerald-400 text-sm font-medium">Logistics synchronization successful.</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Added</p>
                     <p className="text-4xl font-bold text-white mt-1">{results.count || 0}</p>
                     <p className="text-[10px] text-slate-600 mt-2">New products added to inventory</p>
                  </div>
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Failures</p>
                     <p className="text-4xl font-bold text-rose-500 mt-1">{results.errors?.length || 0}</p>
                     <p className="text-[10px] text-slate-600 mt-2">Validation errors encountered</p>
                  </div>
               </div>

               {results.errors?.length > 0 && (
                 <div className="space-y-3">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest px-2">Error Log</p>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                       {results.errors.map((err, i) => (
                         <div key={i} className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-rose-400 flex gap-3">
                            <AlertCircle size={14} className="flex-shrink-0" />
                            <span>{err}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               <button 
                 onClick={() => { setFile(null); setResults(null); }}
                 className="w-full py-4 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl font-bold transition-all uppercase tracking-widest text-xs"
               >
                  Process Another File
               </button>
            </div>
         )}
      </div>

      {/* Template Download / Help */}
      <div className="p-8 glass-card border-white/5 rounded-[2rem] flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
               <FileText size={20} />
            </div>
            <div>
               <p className="font-bold text-white text-sm">Download Schema Template</p>
               <p className="text-xs text-slate-500">Get the required CSV structure to avoid errors.</p>
            </div>
         </div>
         <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all">
            Download .CSV
         </button>
      </div>
    </div>
  );
}
