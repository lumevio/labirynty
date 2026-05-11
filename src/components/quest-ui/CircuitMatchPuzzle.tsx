import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuestButton from './QuestButton';

interface Pin {
  id: string;
  side: 'left' | 'right';
  index: number;
  color: string;
  label: string;
}

interface CircuitMatchPuzzleProps {
  pins: { left: Pin[]; right: Pin[] };
  correctConnections: Record<string, string>; // leftPinId -> rightPinId
  onSolved: () => void;
  onFail: () => void;
  lang: 'pl' | 'en';
}

export default function CircuitMatchPuzzle({
  pins,
  correctConnections,
  onSolved,
  onFail,
  lang,
}: CircuitMatchPuzzleProps) {
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [activePin, setActivePin] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<Record<string, HTMLDivElement>>({});

  const handlePinClick = (pinId: string, side: 'left' | 'right') => {
    if (!activePin) {
      setActivePin(pinId);
      return;
    }

    const activeSide = activePin.startsWith('L') ? 'left' : 'right';

    if (side === activeSide) {
      setActivePin(pinId);
      return;
    }

    const leftId = side === 'left' ? pinId : activePin;
    const rightId = side === 'right' ? pinId : activePin;

    setConnections((prev) => {
      const filtered = Object.fromEntries(
        Object.entries(prev).filter(
          ([l, r]) => l !== leftId && r !== rightId
        )
      );
      return { ...filtered, [leftId]: rightId };
    });

    setActivePin(null);
  };

  const verify = () => {
    const allCorrect = Object.entries(correctConnections).every(
      ([l, r]) => connections[l] === r
    );

    if (allCorrect && Object.keys(connections).length === Object.keys(correctConnections).length) {
      onSolved();
    } else {
      setError(true);
      setAttempts((a) => a + 1);
      setTimeout(() => setError(false), 1000);

      if (attempts >= 3) onFail();
    }
  };

  const getPinPosition = (pinId: string) => {
    const el = pinRefs.current[pinId];
    if (!el || !containerRef.current) return { x: 0, y: 0 };

    const elRect = el.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    return {
      x: elRect.left - containerRect.left + elRect.width / 2,
      y: elRect.top - containerRect.top + elRect.height / 2,
    };
  };

  return (
    <div className="space-y-4">
      <p className="text-center font-orbitron text-[10px] text-[#FFE27A]/60 tracking-widest">
        {lang === 'pl' ? 'POŁĄCZ ODPOWIEDNIE PINY' : 'CONNECT MATCHING PINS'}
      </p>

      <div
        ref={containerRef}
        className="
          relative bg-[#1A0C03] rounded-2xl border-2 border-[#8B4513]
          p-4
        "
        style={{ minHeight: 300 }}
      >
        {/* SVG lines layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {Object.entries(connections).map(([left, right]) => {
            const from = getPinPosition(left);
            const to = getPinPosition(right);
            const isCorrect = correctConnections[left] === right;

            return (
              <g key={`${left}-${right}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isCorrect ? '#5CBD76' : '#FFE27A'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-80"
                />
                {/* Bolts at endpoints */}
                <circle cx={from.x} cy={from.y} r="4" fill={isCorrect ? '#5CBD76' : '#FFE27A'} />
                <circle cx={to.x} cy={to.y} r="4" fill={isCorrect ? '#5CBD76' : '#FFE27A'} />
              </g>
            );
          })}
        </svg>

        <div className="relative z-10 flex justify-between gap-8">
          {/* Left pins */}
          <div className="flex flex-col gap-3">
            {pins.left.map((pin) => (
              <motion.div
                key={pin.id}
                ref={(el) => {
                  if (el) pinRefs.current[pin.id] = el;
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePinClick(pin.id, 'left')}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                  ${activePin === pin.id ? 'ring-2 ring-[#FFE27A]' : ''}
                  bg-[#3D1F08] border border-[#8B4513]/50
                `}
              >
                <div
                  className="w-3 h-3 rounded-full border border-white/30"
                  style={{ backgroundColor: pin.color }}
                />
                <span className="font-mono text-xs text-[#FFE27A]">{pin.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Right pins */}
          <div className="flex flex-col gap-3">
            {pins.right.map((pin) => (
              <motion.div
                key={pin.id}
                ref={(el) => {
                  if (el) pinRefs.current[pin.id] = el;
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePinClick(pin.id, 'right')}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                  ${activePin === pin.id ? 'ring-2 ring-[#FFE27A]' : ''}
                  bg-[#3D1F08] border border-[#8B4513]/50
                `}
              >
                <span className="font-mono text-xs text-[#FFE27A]">{pin.label}</span>
                <div
                  className="w-3 h-3 rounded-full border border-white/30"
                  style={{ backgroundColor: pin.color }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <QuestButton
          onClick={() => {
            setConnections({});
            setActivePin(null);
          }}
          variant="red"
        >
          ↩ {lang === 'pl' ? 'WYCZYŚĆ' : 'RESET'}
        </QuestButton>
        <QuestButton onClick={verify} variant="gold">
          ⚡ {lang === 'pl' ? 'TESTUJ' : 'TEST'}
        </QuestButton>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-red-400 font-mono"
        >
          ❌ {lang === 'pl' ? 'Błędne połączenia!' : 'Wrong connections!'}
        </motion.p>
      )}
    </div>
  );
}