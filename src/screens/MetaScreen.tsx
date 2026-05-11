import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import CyberButton from '../components/CyberButton';
import { TrophySvg } from '../components/CornGraphics';
import { ASSETS } from '../constants/assets';
import { useGameStore } from '../store/gameStore';

/* ---------------- STATIC LEADERBOARD (SAFE) ---------------- */

const mockLeaderboard = [
  { rank: 1, name: 'CyberN1nja', score: 5850, time: '18:32' },
  { rank: 2, name: 'QuestMstr', score: 5620, time: '21:15' },
  { rank: 3, name: 'NeonWlk3r', score: 5400, time: '23:44' },
  { rank: 4, name: 'GlitchByt3', score: 5100, time: '25:01' },
  { rank: 5, name: 'DarkPh0x', score: 4800, time: '27:33' },
  { rank: 6, name: 'PixelStr0m', score: 4500, time: '29:55' },
  { rank: 7, name: 'VoidRunn3r', score: 4200, time: '31:20' },
  { rank: 8, name: 'NfcHunt3r', score: 3900, time: '35:10' },
  { rank: 9, name: 'ByteShift', score: 3600, time: '38:42' },
  { rank: 10, name: 'QR_Mast3r', score: 3200, time: '42:15' },
];

interface Props {
  onNavigate: (route: string) => void;
}

export default function MetaScreen({ onNavigate }: Props) {
  const { t, lang } = useTranslation();

  const playerScore = useGameStore((s) => s.playerScore);
  const getElapsedTime = useGameStore((s) => s.getElapsedTime);
  const resetGame = useGameStore((s) => s.resetGame);
  const completedQuests = useGameStore((s) => s.completedQuests);

  const [elapsed, setElapsed] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setElapsed(getElapsedTime());

    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [getElapsedTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const playerTime = formatTime(elapsed);
  const playerName = lang === 'pl' ? 'TY' : 'YOU';

  const allEntries = [
    ...mockLeaderboard,
    {
      rank: 0,
      name: playerName,
      score: playerScore,
      time: playerTime,
    },
  ]
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const playerRank =
    allEntries.find((e) => e.name === playerName)?.rank || 999;

  const handleShare = () => {
    const text = `🌽 LABIRYNTZATOR\n🏆 Score: ${playerScore}\n⏱️ Time: ${playerTime}\n📊 Rank: #${playerRank}`;

    if (navigator.share) {
      navigator.share({ title: 'LABIRYNTZATOR', text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const handleReplay = () => {
    resetGame();
    onNavigate('');
  };

  return (
    <div className="min-h-dvh bg-black px-4 py-8 relative overflow-hidden">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src={ASSETS.backgroundMain}
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* CONFETTI */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * 400,
                y: -20,
                opacity: 1,
              }}
              animate={{
                y: 900,
                opacity: 0,
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
              }}
              className="absolute text-xl"
            >
              🌽
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-lg mx-auto">
        
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img src={ASSETS.logo} className="w-16 h-16" />
        </div>

        {/* TROPHY */}
        <div className="text-center mb-6">
          <div className="w-32 h-32 mx-auto mb-4">
            <TrophySvg size={130} />
          </div>

          <h1 className="text-3xl font-bold text-corn-gold">
            {t?.meta?.title ?? (lang === 'pl' ? 'META ROZGRYWKI' : 'GAME COMPLETE')}
          </h1>
        </div>

        {/* STATS */}
        <div className="bg-black/60 p-4 rounded-xl border border-corn-gold/20 mb-6">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-xs text-white/40">SCORE</p>
              <p className="text-xl text-corn-gold">{playerScore}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">TIME</p>
              <p className="text-xl text-corn-amber">{playerTime}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">QUESTS</p>
              <p className="text-xl text-corn-green">
                {completedQuests.length}/15
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40">RANK</p>
              <p className="text-xl text-corn-gold">#{playerRank}</p>
            </div>
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="bg-black/60 p-4 rounded-xl border border-corn-gold/20 mb-6">
          <h3 className="text-center text-white/60 mb-3">RANKING</h3>

          {allEntries.slice(0, 8).map((e) => (
            <div
              key={e.rank}
              className="flex justify-between text-sm py-1"
            >
              <span className="text-white/60">
                #{e.rank} {e.name}
              </span>
              <span className="text-corn-green">{e.score}</span>
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="space-y-3">
          <CyberButton
            onClick={handleShare}
            variant="primary"
            className="w-full"
          >
            SHARE
          </CyberButton>

          <CyberButton
            onClick={handleReplay}
            variant="secondary"
            className="w-full"
          >
            REPLAY
          </CyberButton>
        </div>
      </div>
    </div>
  );
}