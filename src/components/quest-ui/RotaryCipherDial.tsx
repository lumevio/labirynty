import { useState } from 'react';
import { motion } from 'framer-motion';
import QuestButton from './QuestButton';

interface RotaryCipherDialProps {
  encryptedText: string;
  expectedShift: number;
  expectedAnswer: string;
  onSolved: () => void;
  onFail: () => void;
  lang: 'pl' | 'en';
}

export default function RotaryCipherDial({
  encryptedText,
  expectedShift,
  expectedAnswer,
  onSolved,
  onFail,
  lang,
}: RotaryCipherDialProps) {
  const [shift, setShift] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(false);

  const decode = (text: string, shiftValue: number) => {
    return text
      .toUpperCase()
      .split('')
      .map((c) => {
        if (c < 'A' || c > 'Z') return c;
        const code = c.charCodeAt(0) - 65;
        const newCode = (((code - shiftValue) % 26) + 26) % 26;
        return String.fromCharCode(newCode + 65);
      })
      .join('');
  };

  const decoded = decode(encryptedText, shift);

  return (
    <div className="space-y-4">
      <div
        className="
          rounded-2xl border-2 border-[#C97A3F]/40
          bg-[#1A0C03] p-4 text-center
        "
      >
        <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest mb-2">
          {lang === 'pl' ? 'ZASZYFROWANE' : 'ENCRYPTED'}
        </p>
        <p className="font-mono text-2xl font-bold text-red-400 tracking-[0.3em]">
          {encryptedText}
        </p>
      </div>

      {/* Rotary dial */}
      <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
        <motion.div
          animate={{ rotate: -shift * (360 / 26) }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="
            absolute inset-0 rounded-full border-4 border-[#C97A3F]
            bg-gradient-to-br from-[#5C2E0A] to-[#1A0C03]
            shadow-[0_0_40px_rgba(255,226,122,0.2),inset_0_0_20px_rgba(0,0,0,0.6)]
          "
        >
          {Array.from({ length: 26 }, (_, i) => {
            const angle = (i * 360) / 26;
            const isHighlighted = i === 0;

            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 origin-bottom"
                style={{
                  transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                  height: '110px',
                }}
              >
                <div
                  className={`
                    -mt-1 font-orbitron text-xs font-bold text-center
                    ${isHighlighted ? 'text-[#FFE27A] text-base' : 'text-[#FFE27A]/40'}
                  `}
                  style={{ transform: `rotate(${-angle}deg)` }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Center indicator */}
        <div
          className="
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            h-16 w-16 rounded-full border-2 border-[#FFE27A]
            bg-[#3D1F08] flex flex-col items-center justify-center
            shadow-[0_0_20px_rgba(255,226,122,0.4)]
          "
        >
          <span className="font-mono text-[8px] text-[#C97A3F]">SHIFT</span>
          <span className="font-orbitron text-2xl font-bold text-[#FFE27A]">
            {shift}
          </span>
        </div>

        {/* Pointer arrow */}
        <div
          className="
            absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1
            w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px]
            border-l-transparent border-r-transparent border-t-[#FFE27A]
          "
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-4 gap-2">
        <QuestButton onClick={() => setShift((s) => (s - 5 + 26) % 26)} variant="wood">
          ◀◀
        </QuestButton>
        <QuestButton onClick={() => setShift((s) => (s - 1 + 26) % 26)} variant="wood">
          ◀
        </QuestButton>
        <QuestButton onClick={() => setShift((s) => (s + 1) % 26)} variant="wood">
          ▶
        </QuestButton>
        <QuestButton onClick={() => setShift((s) => (s + 5) % 26)} variant="wood">
          ▶▶
        </QuestButton>
      </div>

      {/* Decoded preview */}
      <div
        className="
          rounded-xl border-2 border-[#5CBD76]/40
          bg-[#1F3D1C]/40 p-4 text-center
        "
      >
        <p className="font-orbitron text-[9px] text-[#5CBD76] tracking-widest mb-2">
          {lang === 'pl' ? 'PODGLĄD' : 'PREVIEW'}
        </p>
        <p className="font-mono text-xl font-bold text-[#5CBD76] tracking-[0.3em]">
          {decoded}
        </p>
      </div>

      <QuestButton
        onClick={() => {
          if (decoded === expectedAnswer.toUpperCase()) {
            onSolved();
          } else {
            setError(true);
            setAttempts((a) => a + 1);
            setTimeout(() => setError(false), 1000);

            if (attempts >= 4) onFail();
          }
        }}
        variant="gold"
      >
        🔓 {lang === 'pl' ? 'POTWIERDŹ' : 'CONFIRM'}
      </QuestButton>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-red-400 font-mono"
        >
          ❌ {lang === 'pl' ? 'Niewłaściwe przesunięcie!' : 'Wrong shift!'}
        </motion.p>
      )}
    </div>
  );
}