import React from 'react';
import { cn } from '@/lib/utils';

export interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  social: 'google' | 'github' | 'facebook' | 'apple';
  theme?: 'brand' | 'default' | 'outline';
  href?: string;
}

export const SocialButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, SocialButtonProps>(
  ({ social, theme = 'brand', className, children, href, ...props }, ref) => {
    
    const icons = {
      google: (
        <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      ),
      github: (
        <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      ),
      facebook: (
        <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
      apple: (
        <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09.101.146.216.3.336.452 1.157 1.464 2.508 3.167 4.148 3.13 1.56-.035 2.15-.985 4.025-.985 1.86 0 2.404.985 4.041.954 1.696-.033 2.88-1.572 4.01-3.033.155-.2.305-.407.447-.62a11.161 11.161 0 001.815-3.818c-.035-.015-3.568-1.371-3.605-5.467-.031-3.435 2.8-5.078 2.92-5.148-1.583-2.316-4.044-2.632-4.922-2.73-2.072-.258-4.2 1.171-5.264 1.171zM15.421 4.298c.846-1.025 1.417-2.453 1.26-3.876-1.213.048-2.72.808-3.606 1.884-.796.963-1.48 2.427-1.298 3.82 1.36.106 2.766-.757 3.644-1.828z" />
        </svg>
      )
    };

    const themeStyles = {
      brand: {
        google: 'bg-white text-black hover:bg-gray-100 border border-gray-200',
        github: 'bg-[#24292F] text-white hover:bg-[#24292F]/90 dark:bg-white dark:text-black dark:hover:bg-gray-100',
        facebook: 'bg-[#1877F2] text-white hover:bg-[#1877F2]/90',
        apple: 'bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90',
      },
      default: {
        google: 'bg-background text-foreground border hover:bg-muted',
        github: 'bg-background text-foreground border hover:bg-muted',
        facebook: 'bg-background text-foreground border hover:bg-muted',
        apple: 'bg-background text-foreground border hover:bg-muted',
      },
      outline: {
        google: 'bg-transparent text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
        github: 'bg-transparent text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
        facebook: 'bg-transparent text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
        apple: 'bg-transparent text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
      }
    };

    const baseClass = cn(
      "w-full inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      themeStyles[theme]?.[social],
      className
    );

    if (href) {
      return (
        <a href={href} className={baseClass} ref={ref as React.Ref<HTMLAnchorElement>}>
          {icons[social]}
          {children}
        </a>
      );
    }

    return (
      <button 
        ref={ref as React.Ref<HTMLButtonElement>}
        className={baseClass} 
        {...props}
      >
        {icons[social]}
        {children}
      </button>
    );
  }
);

SocialButton.displayName = "SocialButton";
