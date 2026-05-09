import { cn } from '@engine-room/ui';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number; // positive = up, negative = down
  suffix?: string;
  className?: string;
}

export function StatCard({ label, value, trend, suffix, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'cyber-panel p-4',
        className,
      )}
    >
      <p className="font-mono text-[9px] uppercase tracking-[3px] text-warning">{label}</p>
      <p className="mt-2 font-display text-display-sm font-bold uppercase tracking-[2px] text-accent [font-family:Orbitron,monospace]">
        {value}
        {suffix && (
          <span className="ml-1 font-mono text-body-sm text-fg-muted">{suffix}</span>
        )}
      </p>
      {trend !== undefined && (
        <p
          className={cn(
            'mt-1 font-mono text-micro',
            trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-fg-muted',
          )}
        >
          {trend > 0 ? '+' : ''}{trend}%
        </p>
      )}
    </div>
  );
}
