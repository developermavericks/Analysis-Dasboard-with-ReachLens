import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileUp, 
  Database, 
  Calendar, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

import { STRATEGIC_SECTORS } from "../../constants/sectors";

type Props = {
  onAnalyze: (file: File) => Promise<string>;
  onUploaded: (uploadId: string) => void;
};

export function UploadZone({ onAnalyze, onUploaded }: Props) {
  const [mode, setMode] = useState<"local" | "database">("local");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Database Mode State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSector, setSelectedSector] = useState(STRATEGIC_SECTORS[0]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "local") {
        if (!file) return;
        const id = await onAnalyze(file);
        onUploaded(id);
      } else {
        // Database Import Logic
        const response = await fetch('/api/uploads/from-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: selectedDate, sector: selectedSector })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Database import failed. Verification required.");
        onUploaded(result.upload_id);
      }
    } catch (err: any) {
      setError(err.message || "Integration halted. Please verify parameters and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 mt-8 pb-12">
      {/* Mode Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-[24px] mb-8 w-fit mx-auto border border-slate-200">
        <button 
          onClick={() => setMode("local")}
          className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            mode === "local" ? "bg-white text-blue-600 shadow-lg scale-105" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileUp size={16} />
          Strategic File
        </button>
        <button 
          onClick={() => setMode("database")}
          className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            mode === "database" ? "bg-white text-blue-600 shadow-lg scale-105" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Database size={16} />
          Intelligence Archive
        </button>
      </div>

      <div className="bg-white p-12 border border-slate-200 rounded-[40px] flex flex-col items-center shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 opacity-80"></div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 border-l-4 border-l-rose-500"
          >
            <AlertCircle className="text-rose-500" size={24} />
            <div className="flex-1">
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-[0.1em] mb-0.5">Integration Halted</p>
              <p className="text-xs text-rose-600 font-bold leading-relaxed">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 text-rose-300 hover:text-rose-500 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </motion.div>
        )}

        <div className="text-center mb-10">
           <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
             {mode === "local" ? "Manual Ingestion" : "Archive Retrieval"}
           </h2>
           <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
             {mode === "local" 
               ? "Upload raw media vectors to initialize the sentiment parsing engine." 
               : "Select a temporal batch and sector from the proprietary Mavericks database."}
           </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === "local" ? (
            <motion.div
              key="local"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
              <div 
                {...getRootProps()} 
                className={`w-full border-2 border-dashed rounded-[32px] min-h-[200px] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group/drop
                  ${isDragActive ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 shadow-inner'}`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-5">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg
                     ${file ? 'bg-emerald-500 text-white -rotate-3 scale-110' : 'bg-white text-slate-400 group-hover/drop:scale-110 group-hover/drop:text-blue-500'}`}>
                     <FileUp size={28} />
                   </div>
                   <div className="text-center">
                     <p className={`text-base font-black tracking-tight ${file ? 'text-slate-800' : 'text-slate-500'}`}>
                       {file ? file.name : (isDragActive ? 'Drop to Ingest' : 'Drop strategic file or browse')}
                     </p>
                     {!file && <p className="text-xs text-slate-400 mt-1 font-bold">Secure XLSX, XLS, or CSV up to 50MB</p>}
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="database"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Strategic Sector</label>
                  <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" size={16} />
                    <select 
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {STRATEGIC_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" size={16} />
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-blue-50/50 p-5 rounded-[24px] border border-blue-100 flex items-start gap-4">
                 <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Database size={20} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-blue-900 mb-1">Retrieval Ready</p>
                    <p className="text-[11px] text-blue-700/70 font-bold leading-relaxed">System will fetch processed articles from the daily scraper pipeline for the selected criteria.</p>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          disabled={(mode === "local" && !file) || loading}
          onClick={handleAnalyze}
          className={`mt-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.15em] transition-all w-full flex items-center justify-center gap-3 shadow-xl
            ${((mode === "local" && !file) || loading) 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-slate-900 text-white hover:bg-black active:scale-[0.98] shadow-slate-900/20'}`}
        >
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                 <Database size={18} className="text-blue-400" />
              </motion.div>
              <span>Synchronizing Pipeline...</span>
            </>
          ) : (
            <>
              <span>{mode === "local" ? "Initialize Asset Analysis" : "Initialize Archive Retrieval"}</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>

        <div className="mt-10 flex items-center gap-3 text-slate-400 p-4 bg-slate-50/50 rounded-[20px] border border-slate-100/50 w-full">
          <ShieldCheck className="text-emerald-500" size={18} />
          <span className="text-[10px] font-black tracking-tight uppercase leading-none mt-0.5">Proprietary Mavericks Ingestion Security Stack v2.04</span>
        </div>
      </div>
    </div>
  );
}
