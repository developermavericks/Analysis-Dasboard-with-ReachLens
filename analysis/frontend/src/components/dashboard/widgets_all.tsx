import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Languages, 
  Copy, 
  AlertTriangle,
  PieChart,
  BarChart,
  Globe,
  Users,
  MessageSquare,
  Activity,
  Heart,
  TrendingDown,
  Building2
} from "lucide-react";
import { HotTopics } from "./widgets/HotTopics";
import { NegativeWordCloud } from "./widgets/NegativeWordCloud";
import { PositiveWordCloud } from "./widgets/PositiveWordCloud";
import { SentimentOverview } from "./widgets/SentimentOverview";
import { TopCompanies } from "./widgets/TopCompanies";
import { TopJournalists } from "./widgets/TopJournalists";
import { TopPublications } from "./widgets/TopPublications";
import { WordCloud } from "./widgets/WordCloud";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
} as const;

const WidgetCard = ({ title, icon: Icon, children, className = "" }: { title: string, icon: any, children: any, className?: string }) => (
  <motion.div 
    variants={itemVariants}
    className={`dashboard-card p-6 flex flex-col group ${className}`}
  >
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-sm font-black text-slate-800 flex items-center gap-3 tracking-tight">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
          <Icon size={18} />
        </div>
        {title.toUpperCase()}
      </h3>
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
        <Activity size={14} />
      </div>
    </div>
    <div className="flex-1 w-full">
      {children}
    </div>
  </motion.div>
);

export function DashboardWidgets({ data, onDrillDown }: { data: any, onDrillDown: (filters: any) => void }) {
  const w = data?.widgets ?? {};
  const meta = data?.meta ?? {};

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20"
    >
      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Mentions", value: meta.total_articles?.toLocaleString(), icon: TrendingUp, color: "blue" },
          { label: "English Articles", value: meta.english_articles?.toLocaleString(), icon: Languages, color: "emerald" },
          { 
            label: "Duplicate Rate", 
            value: meta.total_articles > 0 ? ((meta.duplicate_articles / meta.total_articles) * 100).toFixed(1) + "%" : "0%", 
            icon: Copy, 
            color: "amber" 
          },
          { label: "Processing Errors", value: meta.failed_rows || 0, icon: AlertTriangle, color: "rose" }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            variants={itemVariants}
            className="dashboard-card p-6 group cursor-default"
          >
            <div className={`p-3 w-fit rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 mb-6 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={22} />
            </div>
            <p className="stat-label mb-1">{stat.label}</p>
            <p className={`stat-value ${stat.color === 'rose' && stat.value > 0 ? 'text-rose-600' : ''}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <WidgetCard title="Sentiment Breakdown" icon={PieChart} className="lg:col-span-4">
          <SentimentOverview 
            donut={w.sentiment_overview?.donut ?? []} 
            onDrillDown={(sentiment) => onDrillDown({ sentiment })}
          />
        </WidgetCard>
        
        <WidgetCard title="Top Media Outlets" icon={Globe} className="lg:col-span-8">
          <TopPublications 
            data={w.top_publications?.data ?? []} 
            onDrillDown={(publication) => onDrillDown({ publication })}
          />
        </WidgetCard>

        <WidgetCard title="Intelligence Word Cloud" icon={MessageSquare} className="lg:col-span-8">
          <WordCloud data={w.word_cloud?.data ?? []} message={w.word_cloud?.message} />
        </WidgetCard>

        <WidgetCard title="Top Companies & Brands" icon={Building2} className="lg:col-span-4">
          <TopCompanies 
            data={w.top_companies?.data ?? []} 
            onDrillDown={(brand) => onDrillDown({ brand })}
          />
        </WidgetCard>

        <WidgetCard title="Key Journalists" icon={Users} className="lg:col-span-4">
          <TopJournalists 
            data={w.top_journalists?.data ?? []} 
            onDrillDown={(author) => onDrillDown({ author })}
          />
        </WidgetCard>

        <WidgetCard title="Trending Issues" icon={BarChart} className="lg:col-span-4">
          <HotTopics data={w.hot_topics?.data ?? []} message={w.hot_topics?.message} />
        </WidgetCard>

        <motion.div variants={itemVariants} className="lg:col-span-4 grid grid-rows-2 gap-8">
          <div className="dashboard-card p-6 bg-emerald-50/20 border-emerald-100/50 group">
             <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
               Positive Insights
               <Heart size={14} className="group-hover:scale-125 transition-transform" />
             </h4>
             <PositiveWordCloud data={w.positive_word_cloud?.data ?? []} />
          </div>
          <div className="dashboard-card p-6 bg-rose-50/20 border-rose-100/50 group">
             <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                Negative Risks
                <TrendingDown size={14} className="group-hover:scale-125 transition-transform" />
             </h4>
             <NegativeWordCloud data={w.negative_word_cloud?.data ?? []} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
