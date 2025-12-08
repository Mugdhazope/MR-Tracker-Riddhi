import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string;
  change?: string;
  subValue?: string;
  icon: LucideIcon;
  color: 'primary' | 'secondary';
}

export function StatsCard({ label, value, change, subValue, icon: Icon, color }: StatsCardProps) {
  const isPositiveChange = change?.startsWith('+');
  
  return (
    <div className="pharma-card p-5 lg:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center',
          color === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'
        )}>
          <Icon className={cn(
            'w-5 h-5',
            color === 'primary' ? 'text-primary' : 'text-secondary'
          )} />
        </div>
        {change && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            isPositiveChange ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'
          )}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{value}</p>
        {subValue && (
          <p className="text-sm text-muted-foreground">{subValue}</p>
        )}
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
