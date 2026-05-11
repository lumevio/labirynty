import { motion } from 'framer-motion';
import QuestButton from './QuestButton';

interface JumpPromptProps {
  targetQuest: number;
  reason: string;
  requiredMemory?: string;
  hasRequiredMemory: boolean;
  onJump: () => void;
  lang: 'pl' | 'en';
}

export default function JumpPrompt({
  targetQuest,
  reason,
  requiredMemory,
  hasRequiredMemory,
  onJump,
  lang,
}: JumpPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="
        rounded-xl border-2 border-[#2E7A46]
        bg-gradient-to-b from-[#1F3D1C] to-[#0D1A0B]
        p-4 text-center
        shadow-[inset_0_0_20px_rgba(92,189,118,0.1)]
      ">
        <div className="text-3xl mb-2">🔀</div>

        <h4 className="font-orbitron text-sm tracking-wider text-[#A6E88B] mb-2">
          {lang === 'pl' ? 'PRZESKOK WYMAGANY' : 'JUMP REQUIRED'}
        </h4>

        <p className="text-xs text-[#A6E88B]/70 leading-relaxed">{reason}</p>

        {/* Wymagana pamięć */}
        {requiredMemory && (
          <div className="mt-3 bg-[#0D1A0B] rounded-lg p-2 border border-[#2E7A46]/30">
            <span className="font-mono text-[10px] text-[#5CBD76]">
              {hasRequiredMemory ? '✅' : '❌'} {lang === 'pl' ? 'WYMAGANE:' : 'REQUIRED:'}{' '}
              {requiredMemory}
            </span>
          </div>
        )}
      </div>

      <QuestButton
        onClick={onJump}
        variant="green"
        disabled={requiredMemory ? !hasRequiredMemory : false}
      >
        {lang === 'pl'
          ? `🔀 PRZEJDŹ DO QUESTA ${targetQuest}`
          : `🔀 JUMP TO QUEST ${targetQuest}`}
      </QuestButton>
    </motion.div>
  );
}