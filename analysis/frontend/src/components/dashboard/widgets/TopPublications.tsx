import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

type Props = {
  data: any[];
  onDrillDown: (publication: string) => void;
};

export function TopPublications({ data, onDrillDown }: Props) {
  if (!data || data.length === 0) return null;

  const chartData = data.slice(0, 10).map((item, idx) => ({
    name: item.publisher,
    count: item.article_count,
    color: `hsl(${210 + (idx * 12)}, 70%, 50%)`
  }));

  return (
    <div className="h-[350px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="vertical" 
          margin={{ left: 20, right: 30 }}
        >
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }} 
            width={120}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 8 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 rounded-xl shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-top-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                    <p className="text-slate-900 font-bold">{payload[0].value} <span className="font-medium text-slate-500">Mentions</span></p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="count" 
            radius={[0, 4, 4, 0]} 
            barSize={18}
            className="cursor-pointer"
            onClick={(data) => onDrillDown(data.name)}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
