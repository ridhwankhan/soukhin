import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', loading, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary: 'bg-[#1B4332] text-white hover:bg-[#163828] focus-visible:ring-[#1B4332]',
      secondary: 'bg-[#F5F0E8] text-[#1A1A1A] hover:bg-[#EDE5D8] focus-visible:ring-[#9A7535]',
      outline: 'border border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white focus-visible:ring-[#1B4332]',
      ghost: 'text-[#4A4A4A] hover:bg-[#F5F0E8] focus-visible:ring-[#9A7535]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs tracking-wide',
      md: 'px-6 py-3 text-sm tracking-wide',
      lg: 'px-8 py-3.5 text-sm tracking-wide',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
