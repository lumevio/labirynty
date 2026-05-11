import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../hooks/useTranslation';
import CyberButton from '../components/CyberButton';
import { ASSETS } from '../constants/assets';

interface Props {
  onNavigate: (route: string) => void;
}

const EMPTY_FN = () => {};

export default function StartScreen({ onNavigate }: Props) {
  const { t, lang } = useTranslation();

  const startGame = useGameStore((s) => s.startGame);
  const resetGame = useGameStore((s) => s.resetGame);
  const gameStarted = useGameStore((s) => s.gameStarted);

  const setLang = useGameStore.getState().setLang ?? EMPTY_FN;

  const store = useGameStore.getState();

  const cornMode = store.cornMode ?? false;
  const toggleCornMode = store.toggleCornMode ?? EMPTY_FN;

  const secretCodeInput = store.secretCodeInput ?? '';
  const setSecretCodeInput = store.setSecretCodeInput ?? EMPTY_FN;

  const handleStart = () => {
    startGame?.();
    onNavigate('game');
  };

  const handleSecretCode = (val: string) => {
    setSecretCodeInput(val);

    if (val.toUpperCase() === 'CORN' && !cornMode) {
      toggleCornMode();
      setSecretCodeInput('');
    }
  };

  const seasonCard = (title: string, img?: string, locked = false) => (
    <div className="relative rounded-xl overflow-hidden border border-white/20 bg-black/40 h-28 group">

      <img
        src={img || ASSETS.backgroundMain}
        className={`w-full h-full object-cover transition duration-300 ${
          locked ? 'blur-sm opacity-40' : 'group-hover:scale-110'
        }`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = ASSETS.backgroundMain;
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center text-corn-gold font-bold tracking-widest text-xs">
          WKRÓTCE
        </div>
      )}

      <p className="absolute bottom-2 left-2 text-xs font-bold text-white">
        {title}
      </p>
    </div>
  );

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src={ASSETS.backgroundMain}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* LIGHT EFFECT */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(circle, #ffd700, #ff8c00 30%, transparent 70%)',
        }}
      />

      {/* LANGUAGE */}
      <motion.div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setLang(lang === 'pl' ? 'en' : 'pl')}
          className="bg-black/50 px-4 py-2 text-xs text-white rounded-full border border-white/20"
        >
          {lang === 'pl' ? 'PL' : 'EN'}
        </button>
      </motion.div>

      {/* LOGO */}
      <motion.img
        src={ASSETS.logo}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-40 h-40 z-10 mb-4"
      />

      {/* TITLE */}
      <div className="text-center z-10 mb-4">
        <p className="text-corn-gold font-orbitron tracking-[0.3em]">
          QUEST SYSTEM
        </p>
        <p className="text-white/60 text-sm mt-2">
          {lang === 'pl'
            ? 'Interaktywna gra w labiryncie kukurydzy'
            : 'Interactive corn maze adventure'}
        </p>
      </div>

      {/* SEASONS */}
      <div className="z-10 w-full max-w-3xl mb-6">
        <p className="text-center text-corn-gold text-xs tracking-[0.3em] mb-3">
          SEZONY / SEASONS
        </p>

        <div className="grid grid-cols-3 gap-3">
          {seasonCard('SEZON 1', ASSETS.season1 ?? ASSETS.backgroundMain)}
{seasonCard('SEZON 2', ASSETS.season2 ?? ASSETS.backgroundMain)}
{seasonCard('SEZON 3', ASSETS.season3 ?? ASSETS.backgroundMain, true)}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex flex-col gap-3 z-10 w-full max-w-xs">
        <CyberButton onClick={handleStart} variant="primary" size="lg">
          {gameStarted ? t.continueGame : t.startGame}
        </CyberButton>

        {gameStarted && (
          <CyberButton onClick={resetGame} variant="danger" size="sm">
            {t.resetGame}
          </CyberButton>
        )}
      </div>

      {/* SECRET CODE */}
      <div className="mt-6 z-10">
        <input
          value={secretCodeInput}
          onChange={(e) => handleSecretCode(e.target.value)}
          placeholder={t.enterCode}
          className="bg-transparent border-b border-white/20 text-xs text-white/50 px-2 py-1 outline-none"
        />

        {cornMode && (
          <p className="text-corn-gold text-xs mt-2 text-center">
            🌽 {t.cornMode} 🌽
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-4 text-white/30 text-[10px] z-10">
        © 2026 LABIRYNTZATOR
      </div>
    </div>
  );
}