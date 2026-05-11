type Props = {
  data: any[];
  onDrillDown: (author: string) => void;
};

export function TopJournalists({ data, onDrillDown }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {data.slice(0, 10).map((item, idx) => (
        <button 
          key={idx} 
          onClick={() => onDrillDown(item.author)}
          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/60 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-500 group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:rotate-6 transition-transform">
              {item.author ? item.author.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none mb-1">{item.author}</p>
              <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em]">Verified Contributor</p>
              </div>
            </div>
          </div>
          <div className="text-right px-2">
            <span className="text-lg font-black text-slate-900 leading-none block">
              {Number(item.article_count).toLocaleString()}
            </span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 block">Articles Found</span>
          </div>
        </button>
      ))}
    </div>
  );
}
