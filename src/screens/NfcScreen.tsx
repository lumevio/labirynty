import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../hooks/useTranslation';
import CyberButton from '../components/CyberButton';
import { NfcScanSvg, LockedGateSvg } from '../components/CornGraphics';
import { ASSETS } from '../constants/assets';

interface Props {
  tagId: string;
  onNavigate: (route: string) => void;
}

export default function NfcScreen({ tagId, onNavigate }: Props) {
  const { t, lang } = useTranslation();
  const quests = useGameStore(s => s.quests);
  const canAccessQuest = useGameStore(s => s.canAccessQuest);
  const addNfcScan = useGameStore(s => s.addNfcScan);
  const [status, setStatus] = useState<'scanning' | 'granted' | 'denied'>('scanning');
  const [targetQuest, setTargetQuest] = useState<number | null>(null);

  useEffect(() => {
    const quest = quests.find(q => q.nfcTagId === tagId);
    const timer = setTimeout(() => {
      if (!quest) { setStatus('denied'); return; }
      setTargetQuest(quest.id);
      if (canAccessQuest(quest.id)) {
        setStatus('granted');
        addNfcScan(tagId, quest.id, true);
      } else {
        setStatus('denied');
        addNfcScan(tagId, quest.id, false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [tagId, quests, canAccessQuest, addNfcScan]);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative">
      {/* Tło */}
      <div className="absolute inset-0">
        <img src={ASSETS.backgroundMain} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
      </div>

      <div className="text-center max-w-sm w-full relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <img src={ASSETS.logo} alt="" className="w-16 h-16 mx-auto object-contain" />
        </motion.div>

        {status === 'scanning' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <NfcScanSvg size={140} />
            </motion.div>
            <h2 className="font-orbitron text-xl text-corn-gold animate-pulse">
              {lang === 'pl' ? 'SKANOWANIE NFC...' : 'SCANNING NFC...'}
            </h2>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.3 }}
                  className="w-3 h-3 rounded-full bg-corn-gold" />
              ))}
            </div>
            <p className="text-xs font-mono text-white/30">TAG: {tagId}</p>
          </motion.div>
        )}

        {status === 'granted' && targetQuest && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-7xl">✅</motion.div>
            <h2 className="font-orbitron text-xl text-corn-green">{t.unlocked}!</h2>
            <p className="text-white/50 text-sm font-mono">CHECKPOINT #{targetQuest}</p>
            <CyberButton onClick={() => onNavigate(`quest/${targetQuest}`)} size="lg" className="w-full" icon="▶">
              {lang === 'pl' ? 'ROZPOCZNIJ ZADANIE' : 'START QUEST'}
            </CyberButton>
          </motion.div>
        )}

        {status === 'denied' && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <motion.div animate={{ x: [-10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }}>
              <LockedGateSvg size={120} />
            </motion.div>
            <h2 className="font-orbitron text-xl text-red-500">{t.accessDenied}</h2>
            <p className="text-white/50 text-sm">{t.completeFirst}</p>
            <CyberButton onClick={() => onNavigate('game')} variant="secondary" className="w-full">
              🗺️ {t.questMap}
            </CyberButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}
