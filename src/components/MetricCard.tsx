import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = 'emerald'
}: MetricCardProps) {
  const colorMap: Record<string, { bg: string; text: string; lightBg: string }> = {
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-500', lightBg: 'bg-emerald-50' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-500', lightBg: 'bg-amber-50' },
    rose: { bg: 'bg-rose-600', text: 'text-rose-500', lightBg: 'bg-rose-50' },
    blue: { bg: 'bg-blue-600', text: 'text-blue-500', lightBg: 'bg-blue-50' },
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-500', lightBg: 'bg-indigo-50' }
  };

  const currentTheme = colorMap[color] || colorMap.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-full"
      id={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Decorative background circle */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${currentTheme.lightBg} opacity-60 pointer-events-none`} />

      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-slate-500 text-sm font-medium tracking-tight h-10 overflow-hidden line-clamp-2">{title}</span>
          <div className={`p-2.5 rounded-xl ${currentTheme.lightBg} ${currentTheme.text} flex items-center justify-center`}>
            {icon}
          </div>
        </div>

        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
          {value}
        </h3>
      </div>

      {/* Footer info (trend or description) */}
      {(trend || subtitle) && (
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
          {trend ? (
            <span className="flex items-center gap-1">
              <span className={`font-semibold px-2 py-0.5 rounded-full ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              {' vs mes anterior'}
            </span>
          ) : (
            <span className="truncate max-w-full font-medium text-slate-400">{subtitle}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
