import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuestButton from './QuestButton';

interface MorseCodePuzzleProps {
  encodedWord: string;
  expectedAnswer: string;
  hint?: string;
  onSolved: () => void;
  onFail: () => void;
  lang: 'pl' | 'en';
}

const MORSE_MAP: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
};

export default function MorseCodePuzzle({
  encodedWord,
  expectedAnswer,
  hint,
  onSolved,
  onFail,
  lang,
}: MorseCodePuzzleProps) {
  const [input, setInput] = useState('');
  const [playing, setPlaying] = useState(false);
  const [activeSignal, setActiveSignal] = useState<'dot' | 'dash' | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(false);

  const morseSequence = encodedWord
    .toUpperCase()
    .split('')
    .map((c) => MORSE_MAP[c] || ' ')
    .join(' / ');

  const playMorse = async () => {
    setPlaying(true);
    const chars = morseSequence.split('');

    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];

      if (c === '.') {
        setActiveSignal('dot');
        if (navigator.vibrate) navigator.vibrate(150);
        await new Promise((r) => setTimeout(r, 200));
      } else if (c === '-') {
        setActiveSignal('dash');
        if (navigator.vibrate) navigator.vibrate(450);
        await new Promise((r) => setTimeout(r, 500));
      } else {
        await new Promise((r) => setTimeout(r, 300));
      }

      setActiveSignal(null);
      await new Promise((r) => setTimeout(r, 100));
    }

    setPlaying(false);
  };

  return (
    <div className="space-y-4">
      <div
        className="
          rounded-2xl border-2 border-[#FFE27A]/40
          bg-gradient-to-b from-[#1A0C03] to-[#0D0600]
          p-6 text-center
        "
      >
        <motion.div
          animate={{
            scale: activeSignal ? 1.3 : 1,
            opacity: activeSignal ? 1 : 0.4,
          }}
          transition={{ duration: 0.1 }}
          className={`
            mx-auto h-20 w-20 rounded-full mb-3
            ${activeSignal === 'dot' ? 'bg-[#5CBD76]' : ''}
            ${activeSignal === 'dash' ? 'bg-[#FFE27A]' : ''}
            ${!activeSignal ? 'bg-[#3D1F08]' : ''}
            shadow-[0_0_30px_currentColor]
          `}
        />

        <p className="font-mono text-xs text-[#C97A3F] tracking-widest mb-3">
          {playing
            ? lang === 'pl' ? 'NADAWANIE...' : 'TRANSMITTING...'
            : lang === 'pl' ? 'GOTOWY' : 'READY'}
        </p>

        <p className="font-mono text-sm text-[#FFE27A] tracking-widest mb-2 break-all">
          {morseSequence}
        </p>

        <QuestButton onClick={playMorse} variant="gold" disabled={playing}>
          📡 {lang === 'pl' ? 'ODTWÓRZ' : 'PLAY'}
        </QuestButton>
      </div>

      {hint && (
        <div className="bg-[#5C2E0A]/30 rounded-lg p-2 border border-[#C97A3F]/20">
          <p className="text-[10px] text-[#C97A3F] text-center">💡 {hint}</p>
        </div>
      )}

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value.toUpperCase())}
        placeholder={lang === 'pl' ? 'ODSZYFRUJ SŁOWO...' : 'DECODE WORD...'}
        className={`
          w-full bg-[#1A0C03] border-2 rounded-xl p-3 text-center
          font-mono text-lg font-bold tracking-[0.3em]
          focus:outline-none transition-colors
          ${error ? 'border-red-500 text-red-400 animate-shake' : 'border-[#8B4513] text-[#FFE27A] focus:border-[#FFE27A]'}
        `}
      />

      <QuestButton
        onClick={() => {
          if (input.toUpperCase() === expectedAnswer.toUpperCase()) {
            onSolved();
          } else {
            setError(true);
            setAttempts((a) => a + 1);
            setTimeout(() => setError(false), 1000);

            if (attempts >= 2) {
              setTimeout(onFail, 1500);
            }
          }
        }}
        variant="green"
        disabled={input.length === 0}
      >
        🔓 {lang === 'pl' ? 'DEKODUJ' : 'DECODE'}
      </QuestButton>
    </div>
  );
}