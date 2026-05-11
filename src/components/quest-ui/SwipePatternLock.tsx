import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface SwipePatternLockProps {
  expectedPattern: number[];
  onUnlock: () => void;
  onFail: () => void;
  lang: 'pl' | 'en';
}

export default function SwipePatternLock({
  expectedPattern,
  onUnlock,
  onFail,
  lang,
}: SwipePatternLockProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLButtonElement[]>([]);

  const handlePointerDown = (i: number) => {
    setDrawing(true);
    setPattern([i]);
  };

  const handlePointerEnter = (i: number) => {
    if (drawing && !pattern.includes(i)) {
      setPattern((prev) => [...prev, i]);
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  const handlePointerUp = () => {
    setDrawing(false);

    if (pattern.length === 0) return;

    const correct = pattern.length === expectedPattern.length &&
      pattern.every((p, i) => p === expectedPattern[i]);

    if (correct) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(onUnlock, 300);
    } else {
      setError(true);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);

      setTimeout(() => {
        setError(false);
        setPattern([]);
      }, 800);
    }
  };

  const getDotPosition = (i: number) => {
    const button = dotsRef.current[i];
    if (!button || !containerRef.current) return { x: 0, y: 0 };

    const buttonRect = button.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    return {
      x: buttonRect.left - containerRect.left + buttonRect.width / 2,
      y: buttonRect.top - containerRect.top + buttonRect.height / 2,
    };
  };

  return (
    <div className="space-y-4">
      <p className="text-center font-orbitron text-[10px] text-[#FFE27A]/60 tracking-widest">
        {lang === 'pl' ? 'NARYSUJ WZÓR' : 'DRAW PATTERN'}
      </p>

      <div
        ref={containerRef}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="
          relative mx-auto bg-[#1A0C03] rounded-2xl border-2 border-[#8B4513]
          p-6 select-none
        "
        style={{ width: 240, height: 240 }}
      >
        {/* Connection lines */}
        <svg className="absolute inset-6 pointer-events-none" width="192" height="192">
          {pattern.length > 1 &&
            pattern.slice(0, -1).map((idx, i) => {
              const from = getDotPosition(idx);
              const to = getDotPosition(pattern[i + 1]);
              const containerRect = containerRef.current?.getBoundingClientRect();
              const offsetX = (containerRect?.left || 0) + 24;
              const offsetY = (containerRect?.top || 0) + 24;

              return (
                <line
                  key={`line-${i}`}
                  x1={from.x - 24}
                  y1={from.y - 24}
                  x2={to.x - 24}
                  y2={to.y - 24}
                  stroke={error ? '#EF4444' : '#FFE27A'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  className={error ? 'opacity-60' : 'opacity-80'}
                />
              );
            })}
        </svg>

        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 9 }, (_, i) => {
            const isActive = pattern.includes(i);
            const order = pattern.indexOf(i);

            return (
              <motion.button
                key={i}
                ref={(el) => {
                  if (el) dotsRef.current[i] = el;
                }}
                onPointerDown={() => handlePointerDown(i)}
                onPointerEnter={() => handlePointerEnter(i)}
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
                className={`
                  h-12 w-12 rounded-full border-2 flex items-center justify-center
                  font-orbitron text-xs font-bold
                  ${error
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : isActive
                      ? 'border-[#FFE27A] bg-[#FFE27A]/30 text-[#FFE27A]'
                      : 'border-[#8B4513]/50 bg-[#3D1F08] text-[#8B4513]'
                  }
                `}
              >
                {isActive && order + 1}
              </motion.button>
            );
          })}
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-red-400 font-mono"
        >
          ❌ {lang === 'pl' ? 'Błędny wzór!' : 'Wrong pattern!'}
        </motion.p>
      )}
    </div>
  );
}