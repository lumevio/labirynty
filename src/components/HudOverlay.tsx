import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../hooks/useTranslation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ASSETS } from '../constants/assets';

export default function HudOverlay() {
  const { t } = useTranslation();
  const playerScore = useGameStore(s => s.playerScore);
  const completedQuests = useGameStore(s => s.completedQuests);
  const getElapsedTime = useGameStore(s => s.getElapsedTime ?? (() => 0));
  const cornCoinsCollected = useGameStore(s => s.cornCoinsCollected);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setElapsed(getElapsedTime()), 1000);
    return () => clearInterval(iv);
  }, [getElapsedTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = Math.round((completedQuests.length / 15) * 100);

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="bg-black/80 backdrop-blur-md border-b border-corn-gold/10 px-3 py-2">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Logo + Score */}
          <div className="flex items-center gap-2">
            <img src={ASSETS.logo} alt="" className="w-7 h-7 object-contain" />
            <div>
              <span className="text-[8px] font-mono text-white/40 uppercase block">{t.score}</span>
              <span className="font-orbitron text-sm font-bold text-corn-gold">
                {playerScore}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="flex-1 mx-4">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7cba3f, #ffd700, #ff8c00)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-[8px] font-mono text-center text-white/30 mt-0.5">
              {completedQuests.length}/15
            </div>
          </div>

          {/* Time + Bonus */}
          <div className="flex items-center gap-2">
            {cornCoinsCollected > 0 && (
              <span className="text-xs text-corn-gold">🌾{cornCoinsCollected}</span>
            )}
            <div className="text-right">
              <span className="text-[8px] font-mono text-white/40 uppercase block">{t.time}</span>
              <span className="font-mono text-sm font-bold text-corn-amber">
                {formatTime(elapsed)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
