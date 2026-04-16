import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  change?: string;
  changePositive?: boolean;
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary-surface',
  change,
  changePositive,
  className = '',
}: KpiCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-card-border card-shadow ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-text-tertiary tracking-wide">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
            <Icon size={16} className={iconColor} strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold text-text-primary tracking-tight tabular-nums">{value}</p>
      {change && (
        <p className={`text-xs font-semibold mt-1.5 ${changePositive ? 'text-accent' : 'text-hot'}`}>
          {change}
        </p>
      )}
    </div>
  );
}
