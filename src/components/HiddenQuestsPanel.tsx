import { motion } from 'framer-motion';
import { useGameStore } from '../systems/GameState';
import { useTranslation } from '../hooks/useTranslation';

const HIDDEN_QUESTS = [
  {
    id: 99,
    title: { pl: '👻 Duch Farmera', en: '👻 Ghost Farmer' },
    hint: { pl: 'Tap 7 razy szybko gdziekolwiek...', en: 'Tap 7 times quickly anywhere...' },
    color: 'purple',
  },
  {
    id: 98,
    title: { pl: '🌽 Szeptacz Kukurydzy', en: '🌽 Corn Whisperer' },
    hint: { pl: 'Klasyka gier...', en: 'Gaming classic...' },
    color: 'yellow',
  },
  {
    id: 97,
    title: { pl: '🛡 Starożytny Strażnik', en: '🛡 Ancient Guardian' },
    hint: { pl: 'Zbierz wszystkie fragmenty...', en: 'Collect all fragments...' },
    color: 'blue',
  },
];

export default function HiddenQuestsPanel({
  onSelectQuest,
}: {
  onSelectQuest: (id: number) => void;
}) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';
  const { hiddenQuestsUnlocked } = useGameStore();

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="font-orbitron text-sm font-bold tracking-widest text-purple-400">
          🌟 {L === 'pl' ? 'UKRYTE QUESTY' : 'HIDDEN QUESTS'}
        </h3>
        <p className="text-[10px] font-mono text-purple-400/60 mt-1">
          {hiddenQuestsUnlocked.length}/3 {L === 'pl' ? 'odkrytych' : 'discovered'}
        </p>
      </div>

      {HIDDEN_QUESTS.map((quest) => {
        const isUnlocked = hiddenQuestsUnlocked.includes(quest.id);

        return (
          <motion.button
            key={quest.id}
            whileHover={isUnlocked ? { scale: 1.02 } : {}}
            whileTap={isUnlocked ? { scale: 0.98 } : {}}
            onClick={() => isUnlocked && onSelectQuest(quest.id)}
            disabled={!isUnlocked}
            className={`
              w-full rounded-xl border-2 p-4 text-left
              transition-all
              ${isUnlocked
                ? `border-${quest.color}-500/60 bg-${quest.color}-500/10 cursor-pointer`
                : 'border-[#8B4513]/30 bg-[#1A0C03] opacity-40 cursor-not-allowed'
              }
            `}
          >
            <p className="font-orbitron text-sm font-bold text-[#FFE27A] mb-1">
              {isUnlocked ? quest.title[L] : '???'}
            </p>

            <p className="font-mono text-[10px] text-[#C97A3F]">
              {isUnlocked
                ? L === 'pl' ? '✅ Dostępny' : '✅ Available'
                : `🔒 ${quest.hint[L]}`}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}