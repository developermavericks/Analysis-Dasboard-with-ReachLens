import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ExternalLink, 
  Calendar, 
  User, 
  Building,
  ArrowRight,
  Loader2,
  FileText
} from "lucide-react";
import { getArticles } from "../../api/results";

type Article = {
  id: string;
  title: string;
  url: string;
  published_at: string;
  publisher: string;
  author: string;
  sentiment: string;
  summary: string;
};

type Props = {
  uploadId: string;
  filters: { sentiment?: string, publication?: string, author?: string, brand?: string, scope?: string };
  onClose: () => void;
};

export function ArticleDrillDown({ uploadId, filters, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getArticles(uploadId, filters);
        setArticles(data.articles);
      } catch (err) {
        setError("Failed to load matching articles.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uploadId, filters]);

  // Determine the display title
  const activeFilterKey = Object.keys(filters).find(k => k !== 'scope' && (filters as any)[k]);
  const activeFilterValue = activeFilterKey ? (filters as any)[activeFilterKey] : "Dataset";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-4 md:p-10"
      onClick={onClose}
    >
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="w-full max-w-4xl h-full bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deep Verification Hub</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              {activeFilterValue} <span className="text-slate-300 font-light">Insights</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-tight">Viewing all matching intelligence vectors from your dataset</p>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all hover:text-slate-900 active:scale-95 border border-slate-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
               <Loader2 className="animate-spin text-blue-600" size={48} />
               <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Fetching Source Material</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-rose-500 font-bold">{error}</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
               <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                  <FileText size={40} />
               </div>
               <p className="text-slate-400 font-bold">No articles match these specific criteria.</p>
            </div>
          ) : (
            articles.map((article, idx) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group border border-slate-100 rounded-3xl p-8 hover:bg-slate-50/80 transition-all hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 cursor-default"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                           article.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600' :
                           article.sentiment === 'negative' ? 'bg-rose-50 text-rose-600' :
                           'bg-slate-100 text-slate-500'
                         }`}>
                           {article.sentiment}
                         </span>
                         <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Calendar size={12} />
                            {new Date(article.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                         </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                   </div>
                   <a 
                    href={article.url} 
                    target="_blank" 
                    className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all hover:shadow-md shrink-0"
                   >
                     <ExternalLink size={18} />
                   </a>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                  {article.summary}
                </p>

                <div className="flex items-center gap-6 pt-6 border-t border-slate-100/50">
                   <div className="flex items-center gap-2">
                     <Building className="text-slate-300" size={14} />
                     <span className="text-xs font-bold text-slate-800 tracking-tight">{article.publisher}</span>
                   </div>
                   {article.author && (
                     <div className="flex items-center gap-2">
                       <User className="text-slate-300" size={14} />
                       <span className="text-xs font-bold text-slate-400 tracking-tight">{article.author}</span>
                     </div>
                   )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center px-10">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             {articles.length} Core Vectors Identified
           </p>
           <button 
            onClick={onClose}
            className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all"
           >
             Return to Dashboard
             <ArrowRight size={16} />
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
