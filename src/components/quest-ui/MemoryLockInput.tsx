import { useState } from 'react';
import { motion } from 'framer-motion';
import QuestButton from './QuestButton';

interface MemoryLockInputProps {
  memoryKey: string;
  expectedValue: string;
  sourceQuest: number;
  hint: string;
  onUnlock: () => void;
  onFail: () => void;
  lang: 'pl' | 'en';
}

export default function MemoryLockInput({
  memoryKey,
  expectedValue,
  sourceQuest,
  hint,
  onUnlock,
  onFail,
  lang,
}: MemoryLockInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleVerify = () => {
    if (input.toUpperCase().trim() === expectedValue.toUpperCase().trim()) {
      onUnlock();
    } else {
      setError(true);
      setAttempts((a) => a + 1);
      setTimeout(() => setError(false), 1200);

      if (attempts >= 2) {
        setTimeout(onFail, 1500);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="
        rounded-xl border-2 border-[#7A5500]
        bg-gradient-to-b from-[#3D2A00] to-[#1A1100]
        p-4 text-center
      ">
        <div className="text-3xl mb-2">🧠</div>

        <h4 className="font-orbitron text-sm tracking-wider text-[#FFE27A] mb-2">
          {lang === 'pl' ? 'BLOKADA PAMIĘCI' : 'MEMORY LOCK'}
        </h4>

        <p className="text-xs text-[#FFE27A]/60 leading-relaxed">
          {lang === 'pl'
            ? `Użyj informacji zapamiętanej z Questa ${sourceQuest}`
            : `Use information memorized from Quest ${sourceQuest}`}
        </p>

        <div className="mt-2 bg-[#1A0C03] rounded-lg p-2 border border-[#7A5500]/30">
          <span className="font-mono text-[10px] text-[#D89A00]">💡 {hint}</span>
        </div>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={lang === 'pl' ? 'Wpisz zapamiętany kod...' : 'Enter memorized code...'}
        className={`
          w-full bg-[#1A0C03] border-2 rounded-xl p-3
          text-center font-mono text-xl font-bold uppercase tracking-[0.3em]
          focus:outline-none transition-colors
          placeholder:text-[#8B4513]/50 placeholder:text-sm placeholder:tracking-normal
          ${
            error
              ? 'border-red-500 text-red-400 animate-shake'
              : 'border-[#8B4513] text-[#FFE27A] focus:border-[#FFE27A]'
          }
        `}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-red-400 font-mono"
        >
          ❌ {lang === 'pl' ? `Błędny kod (próba ${attempts}/3)` : `Wrong code (attempt ${attempts}/3)`}
        </motion.p>
      )}

      <QuestButton onClick={handleVerify} variant="gold">
        {lang === 'pl' ? '🔓 ODBLOKUJ' : '🔓 UNLOCK'}
      </QuestButton>
    </motion.div>
  );
}