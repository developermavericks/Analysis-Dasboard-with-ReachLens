import { useState, useEffect } from "react";
import { COMPETITOR_MAP } from "../../constants/competitors";
import { getResults } from "../../api/results";
import { SearchableSelector } from "../common/SearchableSelector";
import { SentimentOverview } from "./widgets/SentimentOverview";
import { TopPublications } from "./widgets/TopPublications";
import { WordCloud } from "./widgets/WordCloud";
import { TopCompanies } from "./widgets/TopCompanies";
import { TopJournalists } from "./widgets/TopJournalists";
import { HotTopics } from "./widgets/HotTopics";
import { PositiveWordCloud } from "./widgets/PositiveWordCloud";
import { NegativeWordCloud } from "./widgets/NegativeWordCloud";

export function ComparisonView({ uploadId, mainClient, mainData, onDrillDown }: { uploadId: string, mainClient: string, mainData: any, onDrillDown: (filters: any) => void }) {
  const [competitor, setCompetitor] = useState<string>("");
  const [compData, setCompData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const competitors = COMPETITOR_MAP[mainClient] || [];

  useEffect(() => {
    if (competitors.length > 0) {
      setCompetitor(competitors[0]);
    } else {
      setCompetitor("");
      setCompData(null);
    }
  }, [mainClient]);

  useEffect(() => {
    if (!competitor || mainClient === "General") return;
    setLoading(true);
    getResults(uploadId, "client", competitor)
      .then(setCompData)
      .catch(() => setCompData(null))
      .finally(() => setLoading(false));
  }, [uploadId, competitor]);

  if (mainClient === "General") {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Specific Client</h3>
        <p className="text-slate-500 max-w-sm">Comparison view requires a specific main client to identify competitors.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12">
      {/* Competitor Selector Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-600 p-8 rounded-3xl shadow-xl text-white">
        <div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Head-to-Head Analysis</h2>
          <p className="text-blue-100 opacity-80">Comparing <span className="font-bold text-white underline decoration-wavy">{mainClient}</span> against market rivals.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20">
          <span className="text-sm font-bold uppercase tracking-widest pl-4">Choose Rival</span>
          <SearchableSelector 
            value={competitor}
            options={competitors}
            onChange={setCompetitor}
            placeholder="Select competitor..."
            className="text-slate-900"
          />
        </div>
      </div>

      {!competitor ? (
         <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium">No known competitors mapped for {mainClient} yet.</p>
         </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* Main Client Column (A) */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-2 sticky top-[88px] bg-slate-50/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/50 z-10 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">A</div>
                <h3 className="text-lg font-bold text-slate-800">{mainClient} (Target)</h3>
              </div>
              
              <ComparisonKpis meta={mainData?.meta} />
              
              <AnalysisBlocks data={mainData} onDrillDown={(f: any) => onDrillDown({ ...f, scope: mainClient })} />
            </div>

            {/* Competitor Column (B) */}
            <div className={`space-y-8 transition-all duration-500 ${loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
              <div className="flex items-center gap-3 mb-2 sticky top-[88px] bg-slate-50/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/50 z-10 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-xs">B</div>
                  <h3 className="text-lg font-bold text-slate-800">{competitor} (Rival)</h3>
              </div>

              {compData ? (
                 <>
                   <ComparisonKpis meta={compData?.meta} color="rose" />
                   <AnalysisBlocks data={compData} isRival onDrillDown={(f: any) => onDrillDown({ ...f, scope: competitor })} />
                 </>
              ) : (
                <div className="dashboard-card min-h-screen flex items-center justify-center text-slate-400 font-medium bg-slate-50/50 border-dashed">
                  {loading ? "Crunching Rival Data..." : "No coverage found for " + competitor}
                </div>
              )}
            </div>
          </div>

          {/* New: Detailed Comparison Metrics Section */}
          <div className="pt-12 border-t border-slate-200">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Comparative Performance Metrics</h3>
              <p className="text-sm text-slate-500">Cross-comparing media traction and sentiment strength between {mainClient} and {competitor}.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Share of Voice Widget */}
               <div className="dashboard-card p-6 bg-white overflow-hidden">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Market Share of Voice (SOV)</h4>
                  <SOVChart mainCount={mainData?.meta?.total_articles || 0} compCount={compData?.meta?.total_articles || 0} mainName={mainClient} compName={competitor} />
               </div>

               {/* Sentiment Direct Compare */}
               <div className="dashboard-card p-6 bg-white">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Net Sentiment Index</h4>
                  <NetSentimentCompare mainData={mainData} compData={compData} mainName={mainClient} compName={competitor} />
               </div>

               {/* Media Engagement Table */}
               <div className="dashboard-card p-6 bg-white lg:col-span-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Targeted Publication Reach</h4>
                  <EngagementComparison mainData={mainData} compData={compData} />
               </div>
            </div>

            {/* Performance Matrix Table */}
            <div className="mt-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Strategic Metric</th>
                      <th className="px-6 py-4 font-bold text-blue-600 uppercase tracking-wider text-[10px] text-center">{mainClient}</th>
                      <th className="px-6 py-4 font-bold text-rose-500 uppercase tracking-wider text-[10px] text-center">{competitor}</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-center">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <ComparisonRow 
                      label="Viral Mention Volume" 
                      mainVal={mainData?.meta?.total_articles || 0} 
                      compVal={compData?.meta?.total_articles || 0} 
                      formatter={(v: number) => v.toLocaleString()}
                    />
                    <ComparisonRow 
                      label="Key Journalist Coverage" 
                      mainVal={mainData?.widgets?.top_journalists?.data?.length || 0} 
                      compVal={compData?.widgets?.top_journalists?.data?.length || 0} 
                    />
                    <ComparisonRow 
                      label="Media Outlet Diversity" 
                      mainVal={mainData?.widgets?.top_publications?.data?.length || 0} 
                      compVal={compData?.widgets?.top_publications?.data?.length || 0} 
                    />
                    <ComparisonRow 
                      label="Agentic/Tech Mentions" 
                      mainVal={calculateWeightedMentions(mainData)} 
                      compVal={calculateWeightedMentions(compData)} 
                    />
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SOVChart({ mainCount, compCount, mainName, compName }: { mainCount: number, compCount: number, mainName: string, compName: string }) {
  const total = mainCount + compCount;
  const mainPerc = total > 0 ? (mainCount / total) * 100 : 0;
  const compPerc = total > 0 ? (compCount / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest px-1">
        <span className="text-blue-600">{mainName} ({mainPerc.toFixed(1)}%)</span>
        <span className="text-rose-500">{compPerc.toFixed(1)}% ({compName})</span>
      </div>
      <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
        <div 
          className="h-full bg-blue-600 transition-all duration-1000 ease-out relative" 
          style={{ width: `${mainPerc}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        <div 
          className="h-full bg-rose-500 transition-all duration-1000 ease-out relative" 
          style={{ width: `${compPerc}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-white/10 to-transparent"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="text-center">
          <p className="text-xl font-black text-slate-800">{mainCount.toLocaleString()}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Articles</p>
        </div>
        <div className="text-center border-l border-slate-100">
          <p className="text-xl font-black text-slate-800">{compCount.toLocaleString()}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Articles</p>
        </div>
      </div>
    </div>
  );
}

function NetSentimentCompare({ mainData, compData, mainName, compName }: { mainData: any, compData: any, mainName: string, compName: string }) {
  const getNet = (data: any) => {
    const donut = data?.widgets?.sentiment_overview?.donut || [];
    const pos = donut.find((d: any) => d.label === "positive")?.count || 0;
    const neg = donut.find((d: any) => d.label === "negative")?.count || 0;
    const total = donut.reduce((acc: number, d: any) => acc + d.count, 0);
    return total > 0 ? ((pos - neg) / total) * 100 : 0;
  };

  const mainNet = getNet(mainData);
  const compNet = getNet(compData);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div className="space-y-1">
             <p className="text-[10px] font-bold text-slate-400 uppercase">{mainName}</p>
             <p className={`text-2xl font-black ${mainNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {mainNet > 0 ? '+' : ''}{mainNet.toFixed(1)}
             </p>
          </div>
          <div className="h-10 w-px bg-slate-100"></div>
          <div className="space-y-1 text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase">{compName}</p>
             <p className={`text-2xl font-black ${compNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {compNet > 0 ? '+' : ''}{compNet.toFixed(1)}
             </p>
          </div>
       </div>
       <div className="pt-2">
         <p className="text-[10px] text-slate-400 font-medium italic">
            * Sentiment index is calculated as (Positive - Negative) / Total Mentions.
         </p>
       </div>
    </div>
  );
}

function EngagementComparison({ mainData, compData }: { mainData: any, compData: any }) {
  const mainPubs = mainData?.widgets?.top_publications?.data || [];
  const compPubs = compData?.widgets?.top_publications?.data || [];
  
  // Combine unique publishers
  const allPubs = Array.from(new Set([
    ...mainPubs.slice(0, 3).map((p: any) => p.publisher),
    ...compPubs.slice(0, 3).map((p: any) => p.publisher)
  ])).slice(0, 4);

  return (
    <div className="space-y-4">
      {allPubs.map((pub) => {
        const mCount = mainPubs.find((p: any) => p.publisher === pub)?.article_count || 0;
        const cCount = compPubs.find((p: any) => p.publisher === pub)?.article_count || 0;
        const total = mCount + cCount;
        const mP = total > 0 ? (mCount / total) * 100 : 0;
        
        return (
          <div key={pub} className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-600">
              <span className="truncate max-w-[120px]">{pub}</span>
              <span>{mCount} vs {cCount}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-500" style={{ width: `${mP}%` }}></div>
              <div className="h-full bg-rose-400" style={{ width: `${100-mP}%` }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComparisonRow({ label, mainVal, compVal, formatter = (v: any) => v }: { label: string, mainVal: any, compVal: any, formatter?: Function }) {
  const diff = mainVal - compVal;
  const isBetter = diff >= 0;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4 font-semibold text-slate-700">{label}</td>
      <td className="px-6 py-4 text-center font-black text-slate-800">{formatter(mainVal)}</td>
      <td className="px-6 py-4 text-center font-bold text-slate-600">{formatter(compVal)}</td>
      <td className="px-6 py-4 text-center">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${isBetter ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {isBetter ? '↑' : '↓'} {Math.abs(diff).toLocaleString()}
        </span>
      </td>
    </tr>
  );
}

function calculateWeightedMentions(data: any) {
  // Mock logic: Look for tech/AI keywords in word cloud
  const cloud = data?.widgets?.word_cloud?.data || [];
  const techKeywords = ["ai", "tech", "platform", "cloud", "digital", "data", "software", "innovation"];
  return cloud.filter((w: any) => techKeywords.includes(w.word.toLowerCase())).length;
}

function AnalysisBlocks({ data, onDrillDown, isRival = false }: { data: any, onDrillDown: (filters: any) => void, isRival?: boolean }) {
  const w = data?.widgets || {};
  const accentColor = isRival ? "rose" : "blue";

  return (
    <div className="space-y-8">
      <div className="dashboard-card p-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Sentiment Spectrum</h4>
        <SentimentOverview donut={w.sentiment_overview?.donut ?? []} onDrillDown={(sentiment) => onDrillDown({ sentiment })} />
      </div>

      <div className="dashboard-card p-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Mention Landscape (Word Cloud)</h4>
        <WordCloud data={w.word_cloud?.data ?? []} message={w.word_cloud?.message} />
      </div>

      <div className="dashboard-card p-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Top Media Outlets</h4>
        <TopPublications 
          data={w.top_publications?.data?.slice(0, 10) ?? []} 
          onDrillDown={(publication) => onDrillDown({ publication })} 
        />
      </div>

      <div className="dashboard-card p-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Brand & Company Mentions</h4>
        <TopCompanies 
          data={w.top_companies?.data?.slice(0, 8) ?? []} 
          onDrillDown={(brand) => onDrillDown({ brand })} 
        />
      </div>

      <div className="dashboard-card p-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Key Journalists</h4>
        <TopJournalists 
          data={w.top_journalists?.data?.slice(0, 8) ?? []} 
          onDrillDown={(author) => onDrillDown({ author })} 
        />
      </div>

      <div className="dashboard-card p-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Trending Topics</h4>
        <HotTopics data={w.hot_topics?.data?.slice(0, 8) ?? []} message={w.hot_topics?.message} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className={`dashboard-card p-5 ${isRival ? 'bg-rose-50/30' : 'bg-emerald-50/30'} border-opacity-50`}>
          <h4 className={`text-[10px] font-bold ${isRival ? 'text-rose-700' : 'text-emerald-700'} uppercase tracking-widest mb-4`}>Positive Keywords</h4>
          <PositiveWordCloud data={w.positive_word_cloud?.data ?? []} />
        </div>
        <div className="dashboard-card p-5 bg-rose-50/30 border-rose-100">
          <h4 className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-4">Negative Risk Factors</h4>
          <NegativeWordCloud data={w.negative_word_cloud?.data ?? []} />
        </div>
      </div>
    </div>
  );
}

function ComparisonKpis({ meta, color = "blue" }: { meta: any, color?: string }) {
  const total = meta?.total_articles || 0;
  const english = meta?.english_articles || 0;
  const duplicate = meta?.duplicate_articles || 0;
  const dupRate = total > 0 ? ((duplicate / total) * 100).toFixed(1) : "0";

  const colorClass = color === "blue" ? "border-l-blue-600" : "border-l-rose-500";

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${colorClass}`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vol. Mentions</p>
        <p className="text-2xl font-black text-slate-800">{total.toLocaleString()}</p>
      </div>
      <div className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${colorClass}`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Share of Eng.</p>
        <p className="text-2xl font-black text-slate-800">{english.toLocaleString()}</p>
      </div>
      <div className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${colorClass}`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Duplication</p>
        <p className="text-2xl font-black text-slate-800">{dupRate}%</p>
      </div>
      <div className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${colorClass}`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data Quality</p>
        <p className="text-2xl font-black text-slate-800">High</p>
      </div>
    </div>
  );
}
