import { Card } from '@/components/ui/Card';

export function SummaryCard({ title, value, icon, trend, highlight = false }) {
  return (
    <Card className={`flex flex-col gap-2 ${highlight ? 'bg-primary text-surface-bright border-transparent' : ''}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${highlight ? 'text-primary-container' : 'text-text-muted'}`}>{title}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${highlight ? 'bg-surface-bright/20' : 'bg-surface-container'}`}>
          <span className={`material-symbols-outlined text-[18px] ${highlight ? 'text-surface-bright' : 'text-secondary'}`}>
            {icon}
          </span>
        </div>
      </div>
      <div className="flex items-end gap-2 mt-2">
        <span className="font-newsreader text-3xl font-semibold tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold mb-1 ${trend > 0 ? 'text-primary' : 'text-error'} ${highlight && trend > 0 ? 'text-primary-container' : ''}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </Card>
  );
}
