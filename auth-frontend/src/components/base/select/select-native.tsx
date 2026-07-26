import * as React from "react";
import { cn } from "@/lib/utils";

export interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: { label: string; value: string }[];
  size?: "sm" | "md" | "lg";
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, options, size = "md", ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex w-full rounded-xl border border-border bg-card px-3 text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" && "h-9 text-xs",
          size === "md" && "h-10 text-sm",
          size === "lg" && "h-11 text-base",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-card text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

NativeSelect.displayName = "NativeSelect";
