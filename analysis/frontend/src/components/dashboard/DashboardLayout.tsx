import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Settings, X, Sparkles } from "lucide-react";
import { getScopes } from "../../api/results";
import { useResults } from "../../hooks/useResults";
import { SearchableSelector } from "../common/SearchableSelector";
import { ReachLensbadge } from "../common/ReachLensbadge";
import { ClientView } from "./ClientView";
import { SectorView } from "./SectorView";
import { ComparisonView as CompView } from "./ComparisonView";
import { ReachLensView } from "./ReachLensView";
import { ArticleDrillDown } from "./ArticleDrillDown";
import { ALL_CLIENTS } from "../../constants/clients";
import { ChatBot } from "./ChatBot";

const viewTransition = { 
  duration: 0.4, 
  ease: [0.19, 1, 0.22, 1] 
} as const;

export function DashboardLayout({ uploadId }: { uploadId: string }) {
  const [scope, setScope] = useState<"sector" | "client" | "compare" | "reach">("sector");
  const [scopeValue, setScopeValue] = useState("General");
  const [keywordOptions, setKeywordOptions] = useState<string[]>(["General"]);
  
  // Drill-down State
  const [drillDownFilters, setDrillDownFilters] = useState<any | null>(null);

  const { data, loading, error } = useResults(uploadId, scope === "reach" ? "sector" : scope, scope === "reach" ? "General" : scopeValue);

  useEffect(() => {
    if (!uploadId || scope === "reach") return;
    const fetchScope = scope === "compare" ? "client" : scope;
    getScopes(uploadId, fetchScope as "sector" | "client")
      .then((values) => {
        let allOptions = ["General"];
        if (scope === "client" || scope === "compare") {
          const merged = Array.from(new Set([...values, ...ALL_CLIENTS])).sort();
          allOptions = ["General", ...merged];
        } else {
          allOptions = ["General", ...values];
        }
        setKeywordOptions(allOptions);
        setScopeValue("General");
      })
      .catch((err) => {
        setKeywordOptions(["General"]);
        setScopeValue("General");
      });
  }, [uploadId, scope]);

  if (loading && !data) return null; // Parent handles loading

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-16 m-12 rounded-[40px] bg-white border border-slate-200 shadow-2xl text-center max-w-2xl mx-auto"
      >
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-500">
          <X size={40} />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Something didn't go as planned</h3>
        <p className="text-slate-500 mb-10 font-medium leading-relaxed">
          We ran into an issue while trying to load your dashboard. It might be a temporary glitch.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl hover:shadow-slate-200 active:scale-95 flex items-center gap-3 mx-auto uppercase text-xs tracking-widest"
        >
          <Sparkles size={18} className="text-blue-400" />
          Try refreshing things
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Navigation Controller Header */}
      <header className="sticky top-0 z-40 py-2 px-8">
        <div className="glass-panel p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 px-10">
          <div className="flex items-center gap-2 overflow-hidden bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
            {[
              { id: "sector", label: "Intelligence" },
              { id: "client", label: "Entity View" },
              { id: "compare", label: "Compare" },
              { id: "reach", label: "ReachLens" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setScope(item.id as any)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  scope === item.id 
                  ? "bg-white text-blue-600 shadow-md scale-105" 
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
               <SearchableSelector
                value={scopeValue}
                options={keywordOptions}
                onChange={setScopeValue}
                placeholder="Search..."
                className="bg-transparent border-none text-base font-bold text-slate-800 p-0"
              />
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <ReachLensbadge enabled={Boolean(data?.reachlens_enabled)} />
          </div>
        </div>
      </header>

      {/* View Engine */}
      <div className="px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={scope + scopeValue}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={viewTransition}
          >
            {scope === "sector" ? (
              <SectorView 
                data={data} 
                onDrillDown={(f) => setDrillDownFilters({ ...f, scope: scopeValue, scope_type: "sector" })}
              />
            ) : scope === "client" ? (
              <ClientView 
                data={data} 
                onDrillDown={(f) => setDrillDownFilters({ ...f, scope: scopeValue, scope_type: "client" })}
              />
            ) : scope === "compare" ? (
              <CompView 
                uploadId={uploadId} 
                mainClient={scopeValue} 
                mainData={data} 
                onDrillDown={(f) => setDrillDownFilters({ ...f, scope_type: "client" })}
              />
            ) : (
              <ReachLensView />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Drill-down Overlay */}
      <AnimatePresence>
        {drillDownFilters && (
          <ArticleDrillDown 
            uploadId={uploadId}
            filters={drillDownFilters}
            onClose={() => setDrillDownFilters(null)}
          />
        )}
      </AnimatePresence>

      <ChatBot data={data} />
    </div>
  );
}
