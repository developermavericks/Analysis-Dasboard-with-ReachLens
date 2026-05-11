import { Bar, BarChart, ResponsiveContainer, Cell, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS: Record<string, string> = {
  positive: "#10b981", 
  neutral: "#94a3b8", 
  negative: "#ef4444"
};

type Props = {
  donut: any[];
  onDrillDown: (label: string) => void;
};

export function SentimentOverview({ donut, onDrillDown }: Props) {
  if (!donut || donut.length === 0) return null;

  const data = donut.map(d => ({
    name: d.label.charAt(0).toUpperCase() + d.label.slice(1),
    rawValue: d.label,
    value: d.count,
    color: COLORS[d.label.toLowerCase()] ?? "#cbd5e1"
  }));

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="h-[300px] w-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                return (
                  <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100 flex items-center gap-3 animate-in fade-in zoom-in duration-200">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-900 font-bold">{item.name}</span>
                    <span className="text-blue-600 font-semibold">{item.value}</span>
                    <span className="text-slate-400 font-normal">({percent}%)</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="value" 
            radius={[6, 6, 0, 0]} 
            barSize={45}
            animationDuration={1500}
            className="cursor-pointer"
            onClick={(data) => onDrillDown(data.payload.rawValue)}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-8 mt-4 pt-4 border-t border-slate-50 w-full justify-center">
        {data.map((d, i) => (
          <button 
            key={i} 
            onClick={() => onDrillDown(d.rawValue)}
            className="flex items-center gap-2 group transition-all hover:scale-105"
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }}></div>
            <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors uppercase tracking-widest">{d.name}</span>
            <span className="text-sm font-black text-slate-900">{d.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
