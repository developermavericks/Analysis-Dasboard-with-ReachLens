import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  BookOpen,
  Coffee,
  Check,
  X
} from "lucide-react";

type Props = { uploadId: string; status: string };

export function UploadProgress({ uploadId, status }: Props) {
  const isComplete = status === "complete";
  const isFailed = status === "failed";
  const isProcessing = !isComplete && !isFailed;
  
  const [step, setStep] = useState(0);
  const steps = [
    "Carefully reading your materials...",
    "Understanding the general mood...",
    "Looking at how you compare to others...",
    "Picking out the most important bits...",
    "Putting it all together for you..."
  ];

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setStep((s) => (s + 1) % steps.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  return (
    <div className="max-w-4xl mx-auto mt-12 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={`dashboard-card relative overflow-hidden transition-all duration-1000 border-none shadow-2xl
        ${isProcessing ? 'ring-1 ring-blue-500/20 shadow-blue-500/10' : ''}
        ${isComplete ? 'ring-1 ring-emerald-500/20 shadow-emerald-500/10' : ''}
        ${isFailed ? 'ring-1 ring-rose-500/20 shadow-rose-500/10' : ''}`}>
        
        {/* Animated Progress Stripe */}
        {isProcessing && (
          <motion.div 
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}

        <div className="p-12">
          <div className="flex flex-col md:flex-row items-center gap-10">
             <div className="relative shrink-0">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div 
                      key="proc"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="w-24 h-24 rounded-[32px] bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="absolute"
                      >
                         <div className="w-20 h-20 border-2 border-dashed border-blue-200 rounded-full" />
                      </motion.div>
                      <Coffee size={32} className="relative z-10" />
                    </motion.div>
                  ) : isComplete ? (
                    <motion.div 
                      key="comp"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.1, opacity: 1 }}
                      className="w-24 h-24 rounded-[32px] bg-emerald-50 flex items-center justify-center text-emerald-600"
                    >
                      <CheckCircle2 size={40} />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="fail"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 rounded-[32px] bg-rose-50 flex items-center justify-center text-rose-600"
                    >
                      <AlertCircle size={40} />
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             
             <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {isProcessing && "Getting your insights ready..."}
                    {isComplete && "Everything is ready for you!"}
                    {isFailed && "Something went wrong"}
                  </h3>
                  <div className={`w-fit mx-auto md:mx-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border
                    ${isProcessing ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                    ${isComplete ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                    ${isFailed ? 'bg-rose-50 text-rose-600 border-rose-100' : ''}`}>
                    {isProcessing ? "Processing" : isComplete ? "Ready" : "Error"}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                   <motion.p 
                     key={step}
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -5 }}
                     className="text-lg font-medium text-slate-400 mb-6"
                   >
                     {isProcessing ? steps[step] : isComplete ? "We've finished organizing your dashboard." : "We couldn't quite finish reading everything."}
                   </motion.p>
                </AnimatePresence>

                {isProcessing && (
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-slate-300">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Stage {step + 1} of 5</span>
                     </div>
                     <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                       We're currently reading through your materials and organizing them into a clear, strategic view. We'll have everything ready for you in just a moment.
                     </p>
                  </div>
                )}

                {isComplete && (
                   <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                     Your personalized intelligence dashboard is now fully prepared. You can find all the sentiment trends, competitor benchmarks, and key topics below.
                   </p>
                )}

                {isFailed && (
                   <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                     We ran into a bit of trouble while reading through your data. Please check that the file is in the right format and try uploading it again.
                   </p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
