import { motion } from 'framer-motion';
import QuestButton from './QuestButton';

interface BackRefPromptProps {
  targetQuest: number;
  targetTask: number;
  hint: string;
  physicalLocation?: string;
  onNavigate: () => void;
  onSubmitCode: (code: string) => void;
  lang: 'pl' | 'en';
}

export default function BackRefPrompt({
  targetQuest,
  targetTask,
  hint,
  physicalLocation,
  onNavigate,
  onSubmitCode,
  lang,
}: BackRefPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* ALERT */}
      <div className="
        rounded-xl border-2 border-[#C97A3F]
        bg-gradient-to-b from-[#5C2E0A] to-[#3D1F08]
        p-4 text-center
        shadow-[inset_0_0_20px_rgba(201,122,63,0.15)]
      ">
        <div className="text-3xl mb-2">🔁</div>

        <h4 className="font-orbitron text-sm tracking-wider text-[#FFE27A] mb-2">
          {lang === 'pl' ? 'WYMAGANY POWRÓT' : 'BACKTRACK REQUIRED'}
        </h4>

        <p className="text-xs text-[#FFE27A]/70 leading-relaxed">
          {lang === 'pl'
            ? `Wróć do Questa ${targetQuest}, zadanie ${targetTask}`
            : `Return to Quest ${targetQuest}, task ${targetTask}`}
        </p>

        <div className="mt-3 bg-[#1A0C03] rounded-lg p-2 border border-[#8B4513]/30">
          <span className="font-mono text-[10px] text-[#C97A3F]">
            💡 {hint}
          </span>
        </div>
      </div>

      {/* PHYSICAL LOCATION */}
      {physicalLocation && (
        <div className="
          flex items-center gap-3 rounded-xl
          border border-[#C97A3F]/40
          bg-[#C97A3F]/10 p-3
        ">
          <span className="text-2xl">🗺️</span>
          <div>
            <span className="block font-orbitron text-[9px] tracking-widest text-[#C97A3F]">
              {lang === 'pl' ? 'IDŹ DO LOKALIZACJI' : 'GO TO LOCATION'}
            </span>
            <span className="text-sm font-bold text-[#FFE27A]">{physicalLocation}</span>
          </div>
        </div>
      )}

      {/* CODE INPUT */}
      <div className="space-y-3">
        <input
          type="text"
          inputMode="text"
          placeholder={lang === 'pl' ? 'Wpisz znaleziony kod...' : 'Enter found code...'}
          className="
            w-full bg-[#1A0C03] border-2 border-[#8B4513]
            rounded-xl p-3 text-center font-mono text-lg
            font-bold text-[#FFE27A] uppercase tracking-[0.3em]
            focus:outline-none focus:border-[#FFE27A] transition-colors
            placeholder:text-[#8B4513]/50 placeholder:text-sm
            placeholder:tracking-normal
          "
          onChange={(e) => {
            const val = e.target.value.trim();
            if (val.length >= 2) onSubmitCode(val);
          }}
        />

        <QuestButton onClick={onNavigate}>
          {lang === 'pl'
            ? `🧭 NAWIGUJ DO QUESTA ${targetQuest}`
            : `🧭 NAVIGATE TO QUEST ${targetQuest}`}
        </QuestButton>
      </div>
    </motion.div>
  );
}