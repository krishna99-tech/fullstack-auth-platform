import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  title: string;
  subtitle?: string;
}

export function RatingBadge({ rating, title, subtitle, className, ...props }: RatingBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-4 bg-background/50 backdrop-blur-sm border rounded-full px-4 py-2 shadow-sm", className)} {...props}>
      <div className="flex gap-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              "w-4 h-4", 
              i < Math.floor(rating) ? "fill-amber-500" : "fill-muted text-muted"
            )} 
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-foreground">{title}</span>
        {subtitle && (
          <>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span className="text-muted-foreground">{subtitle}</span>
          </>
        )}
      </div>
    </div>
  );
}
