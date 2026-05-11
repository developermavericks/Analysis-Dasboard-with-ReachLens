import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Upload, 
  Settings, 
  HelpCircle, 
  Menu, 
  X,
  Database,
  Search,
  Zap
} from "lucide-react";
import { UploadZone } from "./components/upload/UploadZone";
import { UploadProgress } from "./components/upload/UploadProgress";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { useUpload } from "./hooks/useUpload";

export function App() {
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { status, startUpload } = useUpload();

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Shared Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 88 }}
        className="fixed left-0 top-0 bottom-0 bg-slate-900 border-r border-white/5 z-50 flex flex-col p-4 transition-all duration-500"
      >
        <div className="flex items-center gap-3 mb-12 px-2 h-10 overflow-hidden">
          <div className="min-w-[40px] h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
            <Zap size={22} fill="currentColor" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="whitespace-nowrap"
              >
                <h1 className="text-lg font-black text-white leading-none tracking-tight">MAVERICKS <span className="text-blue-500">V2</span></h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Intelligence System</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: "home", icon: Upload, label: "Asset Intake", subtitle: "Strategic Data Feed", active: !uploadId },
            { id: "dashboard", icon: LayoutDashboard, label: "Intelligence HQ", subtitle: "Live Analysis Insights", active: !!uploadId },
            { id: "history", icon: Database, label: "Knowledge Base", subtitle: "Historical Archives", active: false },
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full group relative flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 ${
                item.active 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-900/30" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={22} className={`min-w-[22px] ${item.active ? "scale-110" : "group-hover:scale-110"} transition-transform`} />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-left whitespace-nowrap overflow-hidden"
                  >
                    <p className="font-bold text-sm leading-tight">{item.label}</p>
                    <p className="text-[9px] font-medium opacity-60 mt-0.5">{item.subtitle}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
           <button className="w-full flex items-center gap-4 p-3.5 text-slate-400 hover:text-white transition-colors">
              <HelpCircle size={22} />
              {isSidebarOpen && <span className="text-sm font-bold">Protocol Support</span>}
           </button>
           <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full p-3.5 bg-white/5 text-slate-400 hover:text-white rounded-2xl transition-colors flex items-center justify-center"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        </div>
      </motion.aside>

      {/* Main Container */}
      <main 
        className="flex-1 transition-all duration-500 overflow-y-auto"
        style={{ paddingLeft: isSidebarOpen ? 280 : 88 }}
      >
        <AnimatePresence mode="wait">
          {!uploadId ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pl-12 pr-20 pt-24 pb-20"
            >
              <header className="mb-16 flex flex-col items-center text-center">
                <div className="flex items-center gap-4 mb-6">
                  <div className="px-3 py-1 bg-blue-600 text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-full">
                    Step 1 of 2
                  </div>
                  <div className="h-px w-12 bg-slate-200"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Strategic Assets</span>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                  Strategic <span className="text-blue-600">Asset</span> <br/>Intake Node
                </h1>
                <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
                  Upload your intelligence vectors (CSV/XLSX) to initialize the proprietary sentiment analysis engine.
                </p>
              </header>

              <div className="flex justify-center">
                <UploadZone
                  onUploaded={(id) => setUploadId(id)}
                  onAnalyze={startUpload}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              {status !== "complete" && (
                <div className="max-w-7xl mx-auto pt-12 px-8">
                   <UploadProgress uploadId={uploadId} status={status} />
                </div>
              )}
              {status === "complete" ? <DashboardLayout uploadId={uploadId} /> : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
