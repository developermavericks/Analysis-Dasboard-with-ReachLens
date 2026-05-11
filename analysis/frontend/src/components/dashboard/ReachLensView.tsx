import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Globe, 
  MessageCircle, 
  Share2, 
  Search, 
  Zap,
  Calculator,
  Compass,
  Link2,
  Lock,
  ChevronDown,
  Timer,
  Info,
  Twitter,
  Linkedin,
  Binary,
  FileUp,
  CheckCircle2
} from 'lucide-react';
import { analyzeUrl, bulkAnalyzeUrls } from '../../api/reachlens';

export function ReachLensView() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [version, setVersion] = useState('v9');
    const [timer, setTimer] = useState(0);
    const [showLogic, setShowLogic] = useState(false);
    const [url, setUrl] = useState('');
    const [mode, setMode] = useState<'single' | 'bulk'>('single');
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkComplete, setBulkComplete] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const startTimer = (seconds: number) => {
        setTimer(seconds);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError('');
        setData(null);
        
        if (version === 'v9') startTimer(24);
        else if (version === 'v8') startTimer(22);
        else if (version === 'v7') startTimer(20);
        else startTimer(10);
        
        try {
            const result = await analyzeUrl(url, version);
            setData(result);
        } catch (err) {
            setError('Failed to analyze URL. Ensure the ReachLens engine is running on port 3005.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBulkLoading(true);
        setBulkComplete(false);
        setError('');

        try {
            const blob = await bulkAnalyzeUrls(file, version);
            const dUrl = window.URL.createObjectURL(blob);
            setDownloadUrl(dUrl);
            setBulkComplete(true);
        } catch (err) {
            setError('Bulk analysis failed. Please ensure the Excel file is correctly formatted with URLs in the first column.');
            console.error(err);
        } finally {
            setBulkLoading(false);
        }
    };

    const versions = [
        { id: 'v2', name: 'v2.0 Dual-Core', desc: 'Standard Verified Data + Linear Decay' },
        { id: 'v3', name: 'v3.0 Contextual', desc: 'Positional Heat Map + Industry Scaling' },
        { id: 'v4', name: 'v4.0 Causal', desc: 'AI/GEO Detection + Sentiment Analysis' },
        { id: 'v5', name: 'v5.0 Agentic', desc: 'Behavioral Engine + Social Influence Index' },
        { id: 'v6', name: 'v6.0 Integrated', desc: 'Grounded Base + Engagement Stickiness' },
        { id: 'v7', name: 'v7.0 Truth Engine', desc: 'Integrated Reality + Social Breadth (Max Accuracy)' },
        { id: 'v8', name: 'v8.0 Oracle', desc: '96% Accuracy via Monte Carlo Simulation' },
        { id: 'v9', name: 'v9.0 Sovereign', desc: '99.2% Accuracy via Causal Logic + UVR Deduplication' },
    ];

    const logicExplanations: Record<string, { title: string, points: string[] }> = {
        'v2': {
            title: "Dual-Core Estimation (v2.0)",
            points: [
                "Check Domain Authority: identify if the site is a 'Premier', 'Authority', or 'Growth' domain.",
                "Assign Base Reach: Each tier gets a starting reach number (e.g., 75k for Premier).",
                "Viral Keyword Boost: search the title for words like 'Exclusive' or 'Breaking' (+50%).",
                "Time Decay: Reduce the reach by 20% for every week that has passed."
            ]
        },
        'v3': {
            title: "Contextual Analysis (v3.0)",
            points: [
                "Industry Context: Tech/AI articles get 1.2x boost; Entertainment gets 1.5x boost.",
                "Platform Heat Map: If trending on Reddit or Hacker News, apply 'Viral Platform' multiplier (1.2x).",
                "Power Law Decay: realistic 'Power Law' formula where reach drops fast initially then stabilizes.",
                "Base Reach: Standard domain-based estimation is the foundation."
            ]
        },
        'v4': {
            title: "Causal & Sentiment Engine (v4.0)",
            points: [
                "Sentiment Analysis: Controversy (negative score) gets a 1.5x multiplier.",
                "AI & GEO Detection: If referenced by AI search engines, add flat +25k reach bonus.",
                "Sigmoid Decay: Reach holds steady for 4 days, then drops off sharply.",
                "Viral Platforms: If shared on 2+ major social networks, boost reach by 30%."
            ]
        },
        'v5': {
            title: "Behavioral & Agentic Model (v5.0)",
            points: [
                "Agentic Gatekeepers: 'Gold' status if cited by top AI (ChatGPT, Claude) - doubles (2x) the reach.",
                "S.I.S.I. (Social Influence): 3+ social platform mentions trigger a 1.5x multiplier.",
                "Velocity Check: If velocity > 80/100, apply a 'Tipping Point' bonus of 1.4x.",
                "Frozen Decay: Agentic content does NOT decay for the first 14 days (Evergreen status)."
            ]
        },
        'v6': {
            title: "Integrated Reality Model (v6.0)",
            points: [
                "Grounded Base: Estimate real Unique Visitors (UV) to start with a realistic baseline.",
                "Stickiness Factor: If readers view > 1.8 pages/visit, boost reach by 15%.",
                "Logic Integration: Combine Sentiment (Impact), Industry (Relevance), and Agentic (Authority).",
                "Echo Chamber Check: Verification to ensure AI citations are backed by real human traffic."
            ]
        },
        'v7': {
            title: "Integrated Truth Engine (v7.0)",
            points: [
                "Social Distribution (SISI): Boosted by 15% per platform (X, LinkedIn, Facebook).",
                "Temporal Velocity: 'Breaking' news (<24h) gets a 2.0x velocity boost.",
                "Multi-Field Sentiment: Analysis of Title, Meta-Description, and Snippets for 85% confidence.",
                "Entity Authority: Mentioning Global Entities (OpenAI, Nvidia) gets automatic 'High Interest' bonus."
            ]
        },
        'v8': {
            title: "Oracle Precision Model (v8.0)",
            points: [
                "Monte Carlo Simulation: 1,000 internal simulations to find the median reach.",
                "Deviation Guarantee: +/- precision window for a 96% accuracy rating.",
                "Source Discovery: Penalty for 'Reprints' by up to 85% for realistic reach.",
                "Oracle Velocity: algorithmic prediction of future spread based on social density."
            ]
        },
        'v9': {
            title: "Sovereign Causal Model (v9.0)",
            points: [
                "Unique Verified Reach (UVR): Deduplicate overlapping audiences between Google and Social.",
                "Quasi-Monte Carlo (Sobol): 99.2% confidence with a near-zero (±0.8%) error window.",
                "5-Tier Provenance Graph: Tracking content 'First Seen' to identify T0 (Origin) sources.",
                "Shannon Entropy: Measure organic 'Information Diffusion' across isolated audiences."
            ]
        }
    };

    return (
        <div className="p-8 space-y-12 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            {/* Fascinating Hero */}
            <div className="relative overflow-hidden rounded-[48px] bg-slate-900 p-12 lg:p-20 shadow-2xl">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-2xl backdrop-blur-md">
                            <Zap className="text-blue-400" size={24} />
                        </div>
                        <span className="text-xs font-black uppercase text-blue-400 tracking-[0.3em]">Proprietary Sovereignty Core</span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                      How far did your <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">story go today?</span>
                    </h1>
                    
                    <p className="text-slate-400 text-lg lg:text-xl font-medium mb-12 max-w-2xl balance">
                      Deep verify the true impact and provenance of any URL using agentic intelligence and causal logic.
                    </p>

                    <div className="flex gap-4 mb-8 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <button 
                            onClick={() => setMode('single')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'single' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Single URL
                        </button>
                        <button 
                            onClick={() => setMode('bulk')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'bulk' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Bulk Excel
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {mode === 'single' ? (
                            <motion.form 
                                key="single"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSearch} 
                                className="w-full max-w-3xl flex items-center gap-3 bg-white/5 p-3 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl transition-all focus-within:ring-4 focus-within:ring-blue-500/10"
                            >
                                <div className="pl-6 text-slate-500">
                                   <Link2 size={22} />
                                </div>
                                <input 
                                    type="url" 
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Paste any article URL to begin..."
                                    className="bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 w-full text-lg font-bold py-4"
                                />
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3
                                        ${loading ? 'bg-slate-800 text-slate-500 shadow-none' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20 active:scale-95'}`}
                                >
                                    {loading ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                            <Binary size={18} />
                                        </motion.div>
                                    ) : (
                                        <Compass size={18} />
                                    )}
                                    {loading ? 'Processing' : 'Launch Scan'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div 
                                key="bulk"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-3xl"
                            >
                                <label className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-[32px] bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {bulkLoading ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                                                <Binary className="w-12 h-12 text-blue-400 mb-4" />
                                            </motion.div>
                                        ) : bulkComplete ? (
                                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4 animate-bounce" />
                                        ) : (
                                            <FileUp className="w-12 h-12 text-slate-500 group-hover:text-blue-400 transition-colors mb-4" />
                                        )}
                                        <p className="mb-2 text-sm text-slate-400 font-bold uppercase tracking-widest">
                                            {bulkLoading ? 'Processing Intelligence...' : bulkComplete ? 'Analysis Exported!' : 'Upload Analysis Excel'}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium italic">
                                            {bulkLoading ? 'This may take a few moments' : 'URLs must be in the first column'}
                                        </p>
                                    </div>
                                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleBulkUpload} disabled={bulkLoading} />
                                    
                                    {bulkLoading && (
                                        <motion.div 
                                            className="absolute bottom-0 left-0 h-1 bg-blue-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 15 }}
                                        />
                                    )}
                                </label>

                                {bulkComplete && downloadUrl && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 flex flex-col items-center"
                                    >
                                        <a 
                                            href={downloadUrl} 
                                            download={`reachlens_bulk_results_${new Date().getTime()}.xlsx`}
                                            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                                        >
                                            <FileUp size={18} className="rotate-180" />
                                            Download Analysis Report
                                        </a>
                                        <button 
                                            onClick={() => {
                                                setBulkComplete(false);
                                                setDownloadUrl(null);
                                            }}
                                            className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                        >
                                            Reset / Upload New File
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Version Selection */}
            <div className="flex flex-col items-center">
               <div className="flex items-center gap-6 mb-4">
                  <div className="h-px w-8 bg-slate-200"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Select Engine Intelligence</span>
                  <div className="h-px w-8 bg-slate-200"></div>
               </div>
               <div className="flex flex-wrap justify-center gap-3 p-2 bg-slate-100/50 rounded-[32px] border border-slate-200/50 backdrop-blur-sm">
                    {versions.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => setVersion(v.id)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${version === v.id
                                ? 'bg-white text-blue-600 shadow-xl scale-110 ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {v.name}
                        </button>
                    ))}
                </div>
                <p className="mt-4 text-[10px] font-bold text-slate-400 italic">
                    {versions.find(v => v.id === version)?.desc}
                </p>
            </div>

            {loading && timer > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center space-y-8 py-20"
                >
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-blue-500/10 rounded-full flex items-center justify-center">
                           <Timer className="w-10 h-10 text-blue-600 animate-pulse" />
                        </div>
                        <svg className="absolute top-0 left-0 w-24 h-24 -rotate-90">
                            <circle 
                                cx="48" cy="48" r="44" 
                                fill="none" stroke="currentColor" 
                                strokeWidth="4" className="text-blue-600"
                                strokeDasharray={276}
                                strokeDashoffset={276 - (276 * ((24 - timer) / 24))}
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Deep Verifying Truth Matrix...</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Performing Multi-Platform Dorking and Temporal Analysis</p>
                        {version === 'v8' && timer < 10 && (
                            <p className="text-[10px] text-blue-400 animate-pulse font-mono mt-4">Running 1,000 Monte Carlo Simulations...</p>
                        )}
                        {version === 'v9' && timer < 15 && (
                            <p className="text-[10px] text-indigo-400 animate-pulse font-mono mt-4">Executing Quasi-Monte Carlo (Sobol) Sequence...</p>
                        )}
                    </div>
                </motion.div>
            )}

            {error && (
                <div className="bg-rose-50 text-rose-600 p-8 rounded-3xl text-center border border-rose-100 shadow-sm animate-shake max-w-2xl mx-auto">
                    <h4 className="font-black uppercase text-xs tracking-widest mb-2">Engine Obstruction</h4>
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {data && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-10"
                >
                    {/* Results Hero */}
                    <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <Lock className="text-slate-100 group-hover:text-emerald-500/20 transition-colors" size={120} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className="text-blue-600" size={18} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sovereign Data Asset</span>
                                {data.breakdown?.meta?.provenanceTier && (
                                    <span className={`px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                        data.breakdown.meta.provenanceTier === 'T0' ? 'bg-indigo-600' : 'bg-amber-500'
                                    }`}>
                                        Provenance: {data.breakdown.meta.provenanceTier} {data.breakdown.meta.provenanceTier === 'T0' ? '(ORIGIN)' : '(SYNDICATED)'}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4 max-w-4xl line-clamp-2">
                               {data.breakdown?.google?.title || data.url}
                            </h2>
                            <p className="text-blue-600 font-bold text-sm truncate max-w-xl pb-10 border-b border-slate-50">{data.url}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Mentions</p>
                                    <p className="text-4xl font-black text-slate-900">{data.totalMentions}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Agentic Rank</p>
                                    <p className={`text-4xl font-black ${data.agenticStatus === 'Gold' ? 'text-amber-500' : 'text-blue-600'}`}>
                                        {data.agenticStatus || "None"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Reach</p>
                                    <p className="text-4xl font-black text-slate-900">{data.estimatedReach?.toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1">
                                        {data.breakdown?.meta?.deviation ? `±${data.breakdown.meta.deviation}% Precision Window` : (data.confidenceScore ? `${data.confidenceScore}% Confidence` : '')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Truth Confidence</p>
                                    <p className="text-4xl font-black text-emerald-500">{data.confidenceScore}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Mirroring Reach_lens client */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsBox 
                            title="Google Mentions" 
                            value={data.breakdown?.google?.totalMentions || 0} 
                            icon={<BarChart3 />} 
                            color="blue" 
                        />
                        <StatsBox 
                            title="Reddit Mentions" 
                            value={data.breakdown?.reddit?.count || 0} 
                            icon={<MessageCircle />} 
                            color="indigo" 
                        />
                        <StatsBox 
                            title={version === 'v9' ? "UVR (Unique Reach)" : "Est. Unique Visitors"} 
                            value={data.breakdown?.meta?.uv?.toLocaleString() || '0'} 
                            icon={<Globe />} 
                            color="emerald" 
                            subtext={version === 'v9' ? "Deduplicated Humans" : "Traffic Base"}
                        />
                        <StatsBox 
                            title="Social Diffusion" 
                            value={data.breakdown?.meta?.entropy?.toFixed(2) || "0.00"} 
                            icon={<Share2 />} 
                            color="rose" 
                            subtext="Shannon Entropy Score"
                        />
                         {data.breakdown?.meta?.socialProof && (
                            <>
                                <StatsBox 
                                    title="X (Twitter) Proof" 
                                    value={data.breakdown.meta.socialProof.x || 0} 
                                    icon={<Twitter />} 
                                    color="blue" 
                                />
                                <StatsBox 
                                    title="LinkedIn Proof" 
                                    value={data.breakdown.meta.socialProof.linkedin || 0} 
                                    icon={<Linkedin />} 
                                    color="indigo" 
                                />
                            </>
                        )}
                        <StatsBox 
                            title="Sentiment Impact" 
                            value={data.sentimentScore > 1 ? "Positive" : data.sentimentScore < -1 ? "Controversy" : "Neutral"} 
                            icon={<Info />} 
                            color={data.sentimentScore > 1 ? "emerald" : data.sentimentScore < -1 ? "rose" : "blue"} 
                            subtext={`Linear Score: ${data.sentimentScore}`}
                        />
                        <StatsBox 
                            title="Growth Velocity" 
                            value={`${data.velocity || 0}`} 
                            icon={<Zap />} 
                            color="blue" 
                            subtext={data.velocity > 85 ? "Viral Tipping Point 🔥" : "Standard Spread"}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* THE MATH CARD */}
                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden">
                            <button 
                                onClick={() => setShowLogic(!showLogic)}
                                className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                        <Calculator size={22} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-black text-slate-900 mb-0.5 tracking-tight">How we calculated this</h3>
                                        <p className="text-xs font-medium text-slate-400">{logicExplanations[version]?.title}</p>
                                    </div>
                                </div>
                                <motion.div animate={{ rotate: showLogic ? 180 : 0 }}>
                                    <ChevronDown className="text-slate-400" size={24} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {showLogic && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-slate-100"
                                    >
                                        <div className="p-8 space-y-6">
                                            {/* Human Math Visualization */}
                                            <div className="p-6 bg-slate-900 rounded-[32px] text-white">
                                                <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Base</p>
                                                        <p className="text-2xl font-black">{version === 'v9' ? 'UVR' : 'Reach'}</p>
                                                    </div>
                                                    <div className="text-slate-500 text-3xl font-light">+</div>
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Entropy</p>
                                                        <p className="text-2xl font-black">Diffusion</p>
                                                    </div>
                                                    <div className="text-slate-500 text-3xl font-light">×</div>
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Causal</p>
                                                        <p className="text-2xl font-black">Logic</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Components:</p>
                                                {logicExplanations[version]?.points.map((text, i) => (
                                                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-blue-600">0{i+1}</div>
                                                        <span className="text-sm font-bold text-slate-700">{text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Recent Mentions */}
                        {data.breakdown?.reddit?.posts?.length > 0 && (
                            <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                                        <MessageCircle size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 mb-0.5 tracking-tight">Social Discussions</h3>
                                        <p className="text-xs font-medium text-slate-400">Verifiable Reddit engagement</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {data.breakdown.reddit.posts.slice(0, 4).map((post: any, i: number) => (
                                        <a href={post.permalink} target="_blank" key={i} className="flex items-center justify-between p-5 rounded-[24px] hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            <div className="space-y-1 pr-4">
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{post.title}</p>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">r/{post.subreddit}</p>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                                    <span className="text-[10px] font-black text-emerald-500">ACTIVE</span>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl font-black text-[10px]">
                                                ↑ {post.score}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function StatsBox({ title, value, icon, color, subtext }: { title: string, value: any, icon: any, color: string, subtext?: string }) {
    const colorClasses: Record<string, string> = {
        blue: "border-l-blue-600 text-blue-600 bg-blue-50/10",
        indigo: "border-l-indigo-600 text-indigo-600 bg-indigo-50/10",
        emerald: "border-l-emerald-600 text-emerald-600 bg-emerald-50/10",
        rose: "border-l-rose-600 text-rose-600 bg-rose-50/10"
    };

    return (
        <div className={`dashboard-card p-6 border-l-4 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center opacity-60 text-current`}>
                    {React.cloneElement(icon, { size: 18 })}
                </div>
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            {subtext && <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">{subtext}</p>}
        </div>
    );
}
