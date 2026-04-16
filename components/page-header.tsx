import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  badge?: string;
}

export function PageHeader({ title, description, icon: Icon, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex items-start md:items-end justify-between mb-6 md:mb-8 gap-3">
      <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary-surface flex items-center justify-center shrink-0">
            <Icon size={18} className="text-primary md:hidden" strokeWidth={2} />
            <Icon size={20} className="text-primary hidden md:block" strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-text-primary tracking-tight truncate">{title}</h1>
            {badge && (
              <span className="px-2 py-0.5 rounded-full bg-primary-surface text-primary text-[11px] font-bold shrink-0">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs md:text-sm text-text-tertiary mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
