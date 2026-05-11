import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface QuestButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'gold' | 'green' | 'red' | 'wood';
  disabled?: boolean;
  className?: string;
}

export default function QuestButton({
  onClick,
  children,
  variant = 'wood',
  disabled = false,
  className = '',
}: QuestButtonProps) {
  const gradients = {
    wood: 'from-[#A85A26] via-[#8B4513] to-[#5C2E0A] text-[#FFE27A]',
    gold: 'from-[#FFE27A] via-[#D89A00] to-[#7A5500] text-[#3D1F08]',
    green: 'from-[#3D6B3C] via-[#2E5A2C] to-[#1F3D1C] text-[#A6E88B]',
    red: 'from-[#A83232] via-[#801A1A] to-[#4D0F0F] text-[#FFB3B3]',
  };

  const handlePress = (e?: any) => {
    if (disabled) return;

    e?.preventDefault?.();
    e?.stopPropagation?.();

    onClick?.();
  };

  return (
    <motion.button
      type="button"

      // animacje tylko wizualne
      whileHover={disabled ? {} : { y: -2, scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.97 }}

      // 🔥 UNIFIED EVENT SYSTEM (FIX MOBILE)
      onClick={handlePress}
      onTouchEnd={handlePress}
      onPointerUp={handlePress}

      disabled={disabled}

      className={`
        relative w-full rounded-xl p-[2px]
        font-orbitron font-bold text-xs tracking-wider

        bg-gradient-to-b from-[#C97A3F] to-[#3D1F08]
        shadow-lg

        select-none
        touch-manipulation

        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <div
        className={`
          relative overflow-hidden rounded-[10px]
          border border-[#3D1F08] px-4 py-3
          bg-gradient-to-b ${gradients[variant]}
        `}
      >
        {/* highlight górny */}
        <span className="absolute inset-x-2 top-0.5 h-[2px] rounded-full bg-white/20 blur-[0.5px]" />

        {/* content */}
        <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          {children}
        </span>
      </div>
    </motion.button>
  );
}