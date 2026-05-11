import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../systems/GameState';
import { useTranslation } from '../hooks/useTranslation';

const SECRET_CODES = {
  GHOST_FARMER: { sequence: ['👻', '🌽', '👻', '🌽'], questId: 99 },
  CORN_WHISPERER: { sequence: ['🌽', '🌽', '🌽', '🌽', '🌽'], questId: 98 },
  ANCIENT: { sequence: ['🛡', '⚔', '🏛', '📜'], questId: 97 },
};

export default function HiddenQuestUnlocker() {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';
  const { unlockHiddenQuest, hiddenQuestsUnlocked } = useGameStore();

  const [tapHistory, setTapHistory] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const lastTapRef = useRef(0);

  // 7 quick taps anywhere = ghost mode
  useEffect(() => {
    const handleClick = () => {
      const now = Date.now();
      if (now - lastTapRef.current < 500) {
        setTapCount((prev) => {
          const next = prev + 1;
          if (next >= 7 && !hiddenQuestsUnlocked.includes(99)) {
            unlockHiddenQuest(99);
            setShowNotification(L === 'pl'
              ? '👻 ODBLOKOWANO: Duch Farmera'
              : '👻 UNLOCKED: Ghost Farmer');
            setTimeout(() => setShowNotification(null), 4000);
            return 0;
          }
          return next;
        });
      } else {
        setTapCount(1);
      }
      lastTapRef.current = now;
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [hiddenQuestsUnlocked]);

  // Konami code anywhere
  useEffect(() => {
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let inputs: string[] = [];

    const handleKey = (e: KeyboardEvent) => {
      inputs.push(e.key);
      if (inputs.length > konami.length) inputs.shift();

      if (inputs.length === konami.length &&
          inputs.every((k, i) => k === konami[i])) {
        if (!hiddenQuestsUnlocked.includes(98)) {
          unlockHiddenQuest(98);
          setShowNotification(L === 'pl'
            ? '🌽 ODBLOKOWANO: Szeptacz Kukurydzy'
            : '🌽 UNLOCKED: Corn Whisperer');
          setTimeout(() => setShowNotification(null), 4000);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hiddenQuestsUnlocked]);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 20, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="
            fixed top-0 left-1/2 -translate-x-1/2 z-[9999]
            rounded-2xl border-2 border-purple-500
            bg-gradient-to-b from-purple-900 to-[#1A0C03]
            shadow-[0_0_40px_rgba(168,85,247,0.6)]
            px-6 py-3
          "
        >
          <p className="font-orbitron text-xs font-bold tracking-widest text-purple-300">
            {showNotification}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}