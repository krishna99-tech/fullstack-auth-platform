import React from 'react';
import { Button as UIButton, type buttonVariants } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export interface BaseButtonProps extends Omit<React.ComponentProps<typeof UIButton>, 'size' | 'color'> {
  color?: 'primary' | 'secondary' | 'primary-destructive' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ color = 'primary', size = 'md', iconLeading, iconTrailing, className, children, ...props }, ref) => {
    
    // Map custom 'color' prop to standard Shadcn UI 'variant'
    let variant: VariantProps<typeof buttonVariants>['variant'] = 'default';
    switch (color) {
      case 'primary-destructive':
        variant = 'destructive';
        break;
      case 'secondary':
        variant = 'secondary';
        break;
      case 'outline':
        variant = 'outline';
        break;
      case 'ghost':
        variant = 'ghost';
        break;
      case 'link':
        variant = 'link';
        break;
      case 'primary':
      default:
        variant = 'default';
        break;
    }

    // Map custom 'size' prop to standard Shadcn UI 'size'
    let uiSize: VariantProps<typeof buttonVariants>['size'] = 'default';
    switch (size) {
      case 'xs':
        uiSize = 'xs';
        break;
      case 'sm':
        uiSize = 'sm';
        break;
      case 'lg':
        uiSize = 'lg';
        break;
      case 'icon':
        uiSize = 'icon';
        break;
      case 'md':
      default:
        uiSize = 'default'; // md translates to default in standard Shadcn
        break;
    }

    return (
      <UIButton
        ref={ref}
        variant={variant}
        size={uiSize}
        className={cn("gap-2", className)}
        {...props}
      >
        {iconLeading}
        {children}
        {iconTrailing}
      </UIButton>
    );
  }
);
Button.displayName = "Button";
