import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'green' | 'corn';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

const variants = {
  primary: 'border-corn-gold text-corn-gold hover:bg-corn-gold/10 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]',
  secondary: 'border-corn-amber text-corn-amber hover:bg-corn-amber/10 hover:shadow-[0_0_20px_rgba(255,170,0,0.3)]',
  danger: 'border-corn-red text-corn-red hover:bg-corn-red/10 hover:shadow-[0_0_20px_rgba(204,51,0,0.3)]',
  green: 'border-corn-green text-corn-green hover:bg-corn-green/10 hover:shadow-[0_0_20px_rgba(124,186,63,0.3)]',
  corn: 'border-corn-kernel text-corn-kernel hover:bg-corn-kernel/10 hover:shadow-[0_0_25px_rgba(245,200,66,0.4)]',
};

const sizes = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export default function CyberButton({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', icon }: Props) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        relative font-orbitron font-bold uppercase tracking-wider
        border-2 bg-transparent
        transition-all duration-300
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      }}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        {children}
      </div>
    </motion.button>
  );
}
