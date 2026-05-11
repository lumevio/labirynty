import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../hooks/useTranslation';
import HudOverlay from '../components/HudOverlay';
import { MazeMapView } from '../components/CornGraphics';
import { ASSETS } from '../constants/assets';
import { useState, useEffect, useRef } from 'react';

interface Props {
  onNavigate: (route: string) => void;
}

export default function GameMapScreen({ onNavigate }: Props) {
  const { t } = useTranslation();

  const quests = useGameStore((s) => s.quests);
  const toggleAdminMode = useGameStore((s) => s.toggleAdminMode);

  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const pinRef = useRef<HTMLInputElement>(null);

  const ADMIN_PIN = '1337';
  const safeQuests = Array.isArray(quests) ? quests : [];

  useEffect(() => {
    if (showPin) setTimeout(() => pinRef.current?.focus(), 50);
  }, [showPin]);

  const handleQuestClick = (questId: number) => {
    const quest = safeQuests.find((q) => q.id === questId);
    if (!quest || quest.status === 'locked') return;
    onNavigate(`quest/${questId}`);
  };

  const confirmPin = () => {
    if (pin === ADMIN_PIN) {
      toggleAdminMode();
      setShowPin(false);
      setPin('');
      onNavigate('admin');
    } else {
      setPin('');
      alert('WRONG PIN');
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img
          src={ASSETS.backgroundMain}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <HudOverlay />
      </div>

      {/* TITLE (overlay, no layout impact) */}
      <div className="absolute top-3 left-0 right-0 z-20 flex justify-center items-center gap-3 pointer-events-none">
        <img src={ASSETS.logo} className="w-9 h-9" />
        <h2 className="font-orbitron text-lg text-yellow-400">
          {t.questMap}
        </h2>
      </div>

      {/* MAP - PERFECT CENTER */}
      <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">

        <div className="w-full h-full flex items-center justify-center">

          {/* RESPONSIVE GAME VIEWPORT */}
          <div className="relative w-[min(95vw,1100px)] h-[min(95vh,900px)] flex items-center justify-center">

            <MazeMapView
              quests={safeQuests}
              onQuestClick={handleQuestClick}
            />

          </div>

        </div>

      </div>

      {/* ADMIN BUTTON */}
      <button
        onClick={() => setShowPin(true)}
        className="
          absolute bottom-4 right-4 z-30
          w-11 h-11 rounded-full
          flex items-center justify-center
          text-yellow-400 opacity-20 hover:opacity-100
          bg-black/40 border border-yellow-500
        "
      >
        ⚙
      </button>

      {/* PIN MODAL */}
      <AnimatePresence>
        {showPin && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-black border border-yellow-500 p-4 rounded-xl w-64">

              <p className="text-yellow-400 text-center mb-3">
                ADMIN ACCESS
              </p>

              <input
                ref={pinRef}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmPin()}
                className="w-full p-2 bg-black border border-yellow-500 text-white outline-none"
                placeholder="PIN"
              />

              <div className="flex gap-2 mt-3">
                <button
                  onClick={confirmPin}
                  className="flex-1 bg-yellow-500 text-black p-2"
                >
                  ENTER
                </button>

                <button
                  onClick={() => setShowPin(false)}
                  className="flex-1 border border-white/20 text-white"
                >
                  CLOSE
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}