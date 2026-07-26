import React from 'react';
import { Package, Shield, Rocket, Mail, Lock, Sparkles, CreditCard, Users, Activity, LineChart, MonitorSmartphone, ShieldCheck, KeySquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export type IllustrationType = 
  | 'box' 
  | 'shield' 
  | 'rocket' 
  | 'mail' 
  | 'lock'
  | 'sparkles'
  | 'card'
  | 'users'
  | 'activity'
  | 'chart'
  | 'monitor'
  | 'shield-check'
  | 'key';

export interface IllustrationProps extends React.HTMLAttributes<HTMLDivElement> {
  type: IllustrationType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function Illustration({ 
  type, 
  size = 'md', 
  variant = 'default',
  className,
  ...props 
}: IllustrationProps) {
  
  // Map types to Lucide icons
  const iconMap: Record<IllustrationType, React.ElementType> = {
    box: Package,
    shield: Shield,
    rocket: Rocket,
    mail: Mail,
    lock: Lock,
    sparkles: Sparkles,
    card: CreditCard,
    users: Users,
    activity: Activity,
    chart: LineChart,
    monitor: MonitorSmartphone,
    'shield-check': ShieldCheck,
    key: KeySquare,
  };

  const Icon = iconMap[type];

  // Size variations
  const sizeStyles = {
    sm: 'w-10 h-10 p-2.5',
    md: 'w-14 h-14 p-3.5',
    lg: 'w-20 h-20 p-5',
    xl: 'w-32 h-32 p-8',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  // Color variations
  const variantStyles = {
    default: 'bg-muted/50 text-muted-foreground border-border shadow-sm',
    primary: 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/10 dark:text-blue-400',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/10 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/10 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/10 dark:text-red-400',
  };

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center rounded-2xl border shadow-lg transition-transform hover:-translate-y-1 duration-300',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Decorative background glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/40 to-transparent dark:from-white/5 opacity-50 mix-blend-overlay pointer-events-none" />
      
      {/* Icon */}
      <Icon className={cn(iconSizes[size], 'relative z-10')} />
    </div>
  );
}
