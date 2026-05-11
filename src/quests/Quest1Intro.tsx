import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 8;
const CODE_FRAGMENT = '37';

const AVAILABLE_AVATARS = [
  { emoji: '🌽', label: { pl: 'Kukurydza', en: 'Corn' } },
  { emoji: '🦊', label: { pl: 'Lis', en: 'Fox' } },
  { emoji: '🦉', label: { pl: 'Sowa', en: 'Owl' } },
  { emoji: '🐺', label: { pl: 'Wilk', en: 'Wolf' } },
  { emoji: '🦅', label: { pl: 'Orzeł', en: 'Eagle' } },
  { emoji: '🐉', label: { pl: 'Smok', en: 'Dragon' } },
  { emoji: '🦁', label: { pl: 'Lew', en: 'Lion' } },
  { emoji: '🐯', label: { pl: 'Tygrys', en: 'Tiger' } },
  { emoji: '🦄', label: { pl: 'Jednorożec', en: 'Unicorn' } },
];

export default function Quest1Intro({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest,
    completeTask,
    completeQuest,
    addCodeFragment,
    setMemory,
    addScore,
    setPlayerName,
    setPlayerAvatar,
    setGameStarted,
    playerName,
    playerAvatar,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [boot, setBoot] = useState(0);
  const [nfcScanned, setNfcScanned] = useState(false);
  const [observationAnswer, setObservationAnswer] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState(false);

  // Player registration
  const [nameInput, setNameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🌽');
  const [nameError, setNameError] = useState<string | null>(null);

  // Welcome animation
  const [welcomePhase, setWelcomePhase] = useState(0);

  useEffect(() => {
    initQuest(1, TOTAL_TASKS);
    setGameStarted();
  }, []);

  const nextTask = useCallback(() => {
    completeTask(1, task);
    addScore(10);
    setTask((t) => t + 1);
    setError(false);
  }, [task]);

 const handleComplete = useCallback(() => {
  completeQuest(1);

  addCodeFragment({
    questId: 1,
    fragment: CODE_FRAGMENT,
    type: 'digits',
    discoveredAt: Date.now(),
  });

  setMemory('q1_start_code', CODE_FRAGMENT, 1);

  setTask(8); // 🔥 KLUCZOWE – przejście dalej
  onComplete();
}, [
  completeQuest,
  addCodeFragment,
  setMemory,
  setTask,
  onComplete,
]);

  // Boot engine
  useEffect(() => {
    if (task !== 3) return;

    const interval = setInterval(() => {
      setBoot((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => nextTask(), 500);
          return 100;
        }
        return prev + 3;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [task]);

  // Welcome animation sequence
  useEffect(() => {
    if (task !== 2) return;

    setWelcomePhase(0);
    const timer1 = setTimeout(() => setWelcomePhase(1), 800);
    const timer2 = setTimeout(() => setWelcomePhase(2), 1800);
    const timer3 = setTimeout(() => setWelcomePhase(3), 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [task]);

  const validateName = (name: string): string | null => {
    const trimmed = name.trim();

    if (trimmed.length < 2) {
      return L === 'pl' ? 'Min. 2 znaki' : 'Min. 2 characters';
    }

    if (trimmed.length > 12) {
      return L === 'pl' ? 'Max. 12 znaków' : 'Max. 12 characters';
    }

    if (!/^[a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_-]+$/.test(trimmed)) {
      return L === 'pl' ? 'Tylko litery, cyfry, _ i -' : 'Only letters, digits, _ and -';
    }

    return null;
  };

  const t = {
    welcomeTitle: { pl: 'WITAJ W LABIRYNTZATOR', en: 'WELCOME TO LABIRYNTZATOR' },
    welcomeDesc: {
      pl: 'Interaktywna gra w fizycznym labiryncie kukurydzy w Zatorze. Twoja przygoda zaczyna się TUTAJ.',
      en: 'Interactive game in physical corn maze in Zator. Your adventure begins HERE.',
    },
    startBtn: { pl: 'WEJDŹ DO GRY', en: 'ENTER GAME' },

    nameTitle: { pl: 'WPROWADŹ KSYWKĘ', en: 'ENTER NICKNAME' },
    nameDesc: {
      pl: 'Twoja ksywka będzie widoczna w rankingu i zapamiętana przez system. Wybierz mądrze!',
      en: 'Your nickname will appear in rankings and be remembered by the system. Choose wisely!',
    },
    namePlaceholder: { pl: 'np. KUKURYDZIANY_NINJA', en: 'e.g. CORN_NINJA' },
    confirmName: { pl: 'POTWIERDŹ KSYWKĘ', en: 'CONFIRM NICKNAME' },

    avatarTitle: { pl: 'WYBIERZ AWATAR', en: 'CHOOSE AVATAR' },
    avatarDesc: {
      pl: 'Wybierz symbol, który będzie reprezentować Cię w grze.',
      en: 'Choose the symbol that will represent you in the game.',
    },
    confirmAvatar: { pl: 'POTWIERDŹ AWATAR', en: 'CONFIRM AVATAR' },

    welcomePlayerTitle: { pl: 'WITAJ, BOHATERZE!', en: 'WELCOME, HERO!' },

    bootTitle: { pl: 'INICJALIZACJA SYSTEMU', en: 'SYSTEM INITIALIZATION' },
    bootDesc: {
      pl: 'System NFC przygotowuje Twój profil gracza i mapuje labirynt.',
      en: 'NFC system prepares your player profile and maps the maze.',
    },
    bootSteps: {
      pl: [
        'Tworzenie profilu gracza...',
        'Łączenie z NFC GRID...',
        'Mapowanie labiryntu Zator...',
        'Kalibracja sensorów...',
        'PROFIL GOTOWY',
      ],
      en: [
        'Creating player profile...',
        'Connecting to NFC GRID...',
        'Mapping Zator maze...',
        'Calibrating sensors...',
        'PROFILE READY',
      ],
    },

    obsTitle: { pl: 'PIERWSZA OBSERWACJA', en: 'FIRST OBSERVATION' },
    obsQuestion: {
      pl: 'Rozejrzyj się wokół wejścia. Ile ŻÓŁTYCH tabliczek widzisz w promieniu 5 metrów?',
      en: 'Look around the entrance. How many YELLOW signs do you see within 5 meters?',
    },
    obsHint: {
      pl: '📍 Stoisz przy WEJŚCIU GŁÓWNYM. Obróć się o 360°.',
      en: '📍 You are at MAIN ENTRANCE. Turn 360°.',
    },

    scanTitle: { pl: 'PIERWSZY SKAN NFC', en: 'FIRST NFC SCAN' },
    scanDesc: {
      pl: 'Znajdź punkt NFC oznaczony symbolem ⚡ na słupku przy wejściu i przyłóż telefon.',
      en: 'Find NFC point marked with ⚡ on the post near entrance and tap your phone.',
    },

    codeTitle: { pl: 'ODKRYCIE KODU', en: 'CODE DISCOVERY' },
    codeQuestion: {
      pl: 'Na odwrocie tabliczki NFC znajdziesz 2-cyfrowy kod. Wpisz go poniżej. ZAPAMIĘTAJ — będzie potrzebny w innych questach!',
      en: 'On the back of NFC sign you will find a 2-digit code. Enter it below. REMEMBER IT — needed in other quests!',
    },

    fragmentTitle: { pl: 'PIERWSZY FRAGMENT ZDOBYTY', en: 'FIRST FRAGMENT EARNED' },

    verify: { pl: 'WERYFIKUJ', en: 'VERIFY' },
    next: { pl: 'DALEJ', en: 'NEXT' },
  } as const;

  const bootStep =
    boot < 20 ? 0 :
    boot < 40 ? 1 :
    boot < 60 ? 2 :
    boot < 80 ? 3 : 4;

  return (
    <QuestFrame title={`QUEST 1 — ${t.bootTitle[L]}`}>

      {/* Player profile bar (visible from task 2 onwards) */}
      {task >= 2 && playerName && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            flex items-center gap-2 mb-4 p-2
            rounded-lg border border-[#5CBD76]/30
            bg-[#5CBD76]/5
          "
        >
          <span className="text-2xl">{playerAvatar}</span>
          <div className="flex-1">
            <p className="font-orbitron text-[9px] text-[#5CBD76]/60 tracking-widest">
              {L === 'pl' ? 'GRACZ' : 'PLAYER'}
            </p>
            <p className="font-orbitron text-xs font-bold text-[#FFE27A] tracking-wider">
              {playerName}
            </p>
          </div>
          <span className="font-mono text-[9px] text-[#C97A3F]">
            📍 {task + 1}/{TOTAL_TASKS}
          </span>
        </motion.div>
      )}

      {/* Task counter (when no profile yet) */}
      {(task < 2 || !playerName) && (
        <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
          <span>🌽 Q1</span>
          <span>📍 {task + 1}/{TOTAL_TASKS}</span>
          <span>{L === 'pl' ? 'INTRO' : 'INTRO'}</span>
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: WELCOME SCREEN ============ */}
        {task === 0 && (
          <QuestTaskShell
            key="t0"
            taskNumber={1}
            totalTasks={TOTAL_TASKS}
            taskType="question"
            title={t.welcomeTitle[L]}
            description={t.welcomeDesc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-6 text-center">
              {/* Animated logo */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-7xl"
              >
                🌽
              </motion.div>

              {/* Floating sparkles */}
              <div className="relative h-12">
                {['✨', '⭐', '🌟', '💫'].map((sparkle, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.5,
                      repeat: Infinity,
                    }}
                    className="absolute text-2xl"
                    style={{ left: `${20 + i * 20}%` }}
                  >
                    {sparkle}
                  </motion.span>
                ))}
              </div>

              <div className="
                bg-[#1A0C03]/60 rounded-xl border border-[#8B4513]/30 p-3
              ">
                <p className="font-orbitron text-[10px] text-[#C97A3F] tracking-widest mb-1">
                  {L === 'pl' ? '⚡ ZACZYNAMY!' : '⚡ LET\'S START!'}
                </p>
                <p className="text-xs text-[#FFE27A]/70">
                  {L === 'pl'
                    ? 'Najpierw stwórz swój profil gracza.'
                    : 'First create your player profile.'}
                </p>
              </div>

              <QuestButton onClick={nextTask} variant="gold">
                ⚡ {t.startBtn[L]}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 1: NICKNAME INPUT ============ */}
        {task === 1 && (
          <QuestTaskShell
            key="t1"
            taskNumber={2}
            totalTasks={TOTAL_TASKS}
            taskType="code_input"
            title={t.nameTitle[L]}
            description={t.nameDesc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-4">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-5xl"
                >
                  🎮
                </motion.div>
              </div>

              {/* Live preview */}
              <div className="
                rounded-xl border-2 border-[#FFE27A]/40
                bg-[#1A0C03] p-4 text-center
                shadow-[inset_0_0_20px_rgba(255,226,122,0.1)]
              ">
                <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest mb-2">
                  {L === 'pl' ? 'PODGLĄD KSYWKI' : 'NICKNAME PREVIEW'}
                </p>
                <p className="font-orbitron text-xl font-bold text-[#FFE27A] tracking-wider min-h-[28px]">
                  {nameInput.trim().toUpperCase() || '???'}
                </p>
                <p className="mt-1 font-mono text-[9px] text-[#FFE27A]/40">
                  {nameInput.length}/12
                </p>
              </div>

              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameError(null);
                }}
                placeholder={t.namePlaceholder[L]}
                maxLength={12}
                autoComplete="off"
                autoCapitalize="characters"
                className={`
                  w-full bg-[#1A0C03] border-2 rounded-xl p-3
                  text-center font-mono text-lg font-bold
                  text-[#FFE27A] uppercase tracking-[0.2em]
                  focus:outline-none transition-colors
                  placeholder:text-[#8B4513]/40 placeholder:text-xs
                  placeholder:tracking-normal placeholder:normal-case
                  ${nameError ? 'border-red-500' : 'border-[#8B4513] focus:border-[#FFE27A]'}
                `}
              />

              {nameError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 font-mono text-center"
                >
                  ❌ {nameError}
                </motion.p>
              )}

              <div className="
                bg-[#5C2E0A]/30 rounded-lg p-2 border border-[#C97A3F]/20
              ">
                <p className="text-[10px] text-[#C97A3F] text-center">
                  💡 {L === 'pl'
                    ? 'Tylko litery, cyfry, _ i - (2-12 znaków)'
                    : 'Only letters, digits, _ and - (2-12 chars)'}
                </p>
              </div>

              <QuestButton
                onClick={() => {
                  const validation = validateName(nameInput);

                  if (validation) {
                    setNameError(validation);
                    return;
                  }

                  const finalName = nameInput.trim().toUpperCase();
                  setPlayerName(finalName);
                  setMemory('player_name', finalName, 1);
                  nextTask();
                }}
                variant="gold"
                disabled={nameInput.trim().length < 2}
              >
                ✅ {t.confirmName[L]}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 2: AVATAR SELECTION ============ */}
        {task === 2 && (
          <QuestTaskShell
            key="t2"
            taskNumber={3}
            totalTasks={TOTAL_TASKS}
            taskType="question"
            title={t.avatarTitle[L]}
            description={t.avatarDesc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-4">
              {/* Profile preview */}
              <div className="
                rounded-2xl border-2 border-[#FFE27A]/40
                bg-gradient-to-b from-[#5C2E0A]/40 to-[#1A0C03]
                p-6 text-center
                shadow-[inset_0_0_30px_rgba(255,226,122,0.15)]
              ">
                <motion.div
                  key={selectedAvatar}
                  initial={{ scale: 0.5, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="text-7xl mb-3"
                >
                  {selectedAvatar}
                </motion.div>

                <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest mb-1">
                  {L === 'pl' ? 'TWÓJ PROFIL' : 'YOUR PROFILE'}
                </p>

                <p className="font-orbitron text-lg font-bold text-[#FFE27A] tracking-wider">
                  {playerName || '???'}
                </p>

                <p className="mt-1 font-mono text-[9px] text-[#FFE27A]/50">
                  {AVAILABLE_AVATARS.find((a) => a.emoji === selectedAvatar)?.label[L]}
                </p>
              </div>

              {/* Avatar grid */}
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_AVATARS.map((avatar) => (
                  <motion.button
                    key={avatar.emoji}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAvatar(avatar.emoji)}
                    className={`
                      h-20 rounded-xl border-2 flex flex-col items-center justify-center
                      transition-all
                      ${selectedAvatar === avatar.emoji
                        ? 'border-[#FFE27A] bg-[#FFE27A]/20 shadow-[0_0_15px_rgba(255,226,122,0.3)]'
                        : 'border-[#8B4513]/40 bg-[#1A0C03] hover:border-[#FFE27A]/40'
                      }
                    `}
                  >
                    <span className="text-3xl">{avatar.emoji}</span>
                    <span className="font-orbitron text-[8px] text-[#FFE27A]/60 mt-1 tracking-wider">
                      {avatar.label[L]}
                    </span>
                  </motion.button>
                ))}
              </div>

              <QuestButton
                onClick={() => {
                  setPlayerAvatar(selectedAvatar);
                  setMemory('player_avatar', selectedAvatar, 1);
                  nextTask();
                }}
                variant="gold"
              >
                ✅ {t.confirmAvatar[L]}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 3: WELCOME PLAYER + BOOT ============ */}
        {task === 3 && (
          <QuestTaskShell
            key="t3"
            taskNumber={4}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={t.welcomePlayerTitle[L]}
            description={t.bootDesc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-4">
              {/* Personalized welcome */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="
                  rounded-2xl border-2 border-[#5CBD76]/40
                  bg-gradient-to-b from-[#1F3D1C]/40 to-[#1A0C03]
                  p-4 text-center
                "
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="text-6xl mb-3"
                >
                  {playerAvatar}
                </motion.div>

                <p className="font-orbitron text-[10px] text-[#5CBD76] tracking-widest mb-2">
                  {L === 'pl' ? '🎉 WITAJ' : '🎉 WELCOME'}
                </p>

                <motion.h3
                  animate={{
                    textShadow: [
                      '0 0 10px rgba(255,226,122,0.3)',
                      '0 0 30px rgba(255,226,122,0.6)',
                      '0 0 10px rgba(255,226,122,0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="font-orbitron text-2xl font-black tracking-[0.15em] text-[#FFE27A]"
                >
                  {playerName}
                </motion.h3>

                <p className="mt-2 font-mono text-[10px] text-[#FFE27A]/60">
                  {L === 'pl'
                    ? 'Twój profil został zarejestrowany!'
                    : 'Your profile has been registered!'}
                </p>
              </motion.div>

              {/* Boot progress */}
              <div className="space-y-3">
                <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest text-center">
                  {L === 'pl' ? '⚡ INICJALIZACJA SYSTEMU' : '⚡ SYSTEM INITIALIZATION'}
                </p>

                <div className="w-full h-3 bg-[#1A0C03] rounded-full overflow-hidden border border-[#3D1F08]">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#C97A3F] via-[#FFE27A] to-[#5CBD76]"
                    animate={{ width: `${boot}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-[#C97A3F]">{boot}%</span>
                  <span className="text-[#FFE27A]/60 animate-pulse">
                    {t.bootSteps[L][bootStep]}
                  </span>
                </div>
              </div>
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 4: PHYSICAL OBSERVATION ============ */}
        {task === 4 && (
          <QuestTaskShell
            key="t4"
            taskNumber={5}
            totalTasks={TOTAL_TASKS}
            taskType="observation"
            title={t.obsTitle[L]}
            description={t.obsQuestion[L]}
            isActive
            isCompleted={false}
            physicalHint={t.obsHint[L]}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {['2', '3', '4', '5'].map((n) => (
                  <QuestButton
                    key={n}
                    onClick={() => {
                      setObservationAnswer(n);
                      if (n === '3') {
                        setMemory('q1_yellow_signs', n, 1);
                        nextTask();
                      } else {
                        setError(true);
                        setTimeout(() => setError(false), 1000);
                      }
                    }}
                    variant={observationAnswer === n ? 'gold' : 'wood'}
                  >
                    {n}
                  </QuestButton>
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-400 font-mono text-center"
                >
                  ❌ {L === 'pl' ? 'Rozejrzyj się uważniej!' : 'Look more carefully!'}
                </motion.p>
              )}
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 5: NFC SCAN ============ */}
        {task === 5 && (
          <QuestTaskShell
            key="t5"
            taskNumber={6}
            totalTasks={TOTAL_TASKS}
            taskType="physical"
            title={t.scanTitle[L]}
            description={t.scanDesc[L]}
            isActive
            isCompleted={false}
            physicalHint={L === 'pl' ? 'SŁUPEK PRZY WEJŚCIU — SYMBOL ⚡' : 'POST NEAR ENTRANCE — SYMBOL ⚡'}
          >
            <div className="text-center space-y-4">
              {!nfcScanned ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setNfcScanned(true);
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                  }}
                  className="
                    mx-auto grid h-32 w-32 place-items-center
                    rounded-full border-2 border-[#FFE27A]
                    bg-[radial-gradient(circle,rgba(255,226,122,0.2),rgba(26,12,3,0.95)_60%)]
                    shadow-[0_0_30px_rgba(255,226,122,0.15)]
                  "
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl"
                  >
                    📡
                  </motion.div>
                </motion.button>
              ) : (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <p className="text-[#5CBD76] font-orbitron text-sm">
                    ✅ {L === 'pl' ? 'NFC ZSYNCHRONIZOWANE' : 'NFC SYNCHRONIZED'}
                  </p>

                  <div className="mt-4">
                    <QuestButton onClick={nextTask} variant="green">
                      {t.next[L]} →
                    </QuestButton>
                  </div>
                </motion.div>
              )}
            </div>
          </QuestTaskShell>
        )}

        {task === 6 && (
  <QuestTaskShell
    key="t6"
    taskNumber={7}
    totalTasks={TOTAL_TASKS}
    taskType="code_input"
    title={t.codeTitle[L]}
    description={t.codeQuestion[L]}
    isActive
    isCompleted={false}
    physicalHint={L === 'pl' ? 'ODWRÓĆ TABLICZKĘ NFC' : 'FLIP THE NFC SIGN'}
  >
    <div className="space-y-4">

      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={codeInput}
        onChange={(e) => {
          setError(false);
          setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 2));
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (codeInput === CODE_FRAGMENT) {
              nextTask();
            } else {
              setError(true);
            }
          }
        }}
        placeholder="_ _"
        className="
          w-full bg-[#1A0C03] border-2 border-[#8B4513]
          rounded-xl p-4 text-center font-mono text-3xl
          font-bold text-[#FFE27A] tracking-[1em]
          focus:outline-none focus:border-[#FFE27A]
          transition-colors
        "
      />

      <QuestButton
        onClick={() => {
          const clean = codeInput.trim();

          if (clean === CODE_FRAGMENT) {
            setError(false);
            nextTask();
          } else {
            setError(true);
            setTimeout(() => setError(false), 800);
          }
        }}
        variant="gold"
        disabled={false}
      >
        🔐 {t.verify[L]}
      </QuestButton>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-red-400 font-mono text-center"
        >
          ❌ {L === 'pl' ? 'Sprawdź tabliczkę ponownie' : 'Check the sign again'}
        </motion.p>
      )}

      <div className="bg-[#5C2E0A]/30 rounded-lg p-2 border border-[#C97A3F]/20">
        <p className="text-[9px] text-[#C97A3F] text-center">
          ⚠️ {L === 'pl'
            ? `${playerName}, ZAPAMIĘTAJ TEN KOD! Będzie potrzebny w Q3 i Q15.`
            : `${playerName}, REMEMBER THIS CODE! Needed in Q3 and Q15.`}
        </p>
      </div>

    </div>
  </QuestTaskShell>
)}
{task === 7 && (
  <QuestTaskShell
    key="t7"
    taskNumber={8}
    totalTasks={TOTAL_TASKS}
    taskType="code_input"
    title={t.fragmentTitle[L]}
    isActive
    isCompleted={false}
  >
    <div className="space-y-4">

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          rounded-xl border-2 border-[#5CBD76]/40
          bg-[#5CBD76]/10 p-3 text-center
        "
      >
        <p className="font-orbitron text-[10px] text-[#5CBD76] tracking-widest mb-1">
          🏆 {L === 'pl' ? 'PIERWSZE OSIĄGNIĘCIE' : 'FIRST ACHIEVEMENT'}
        </p>

        <p className="font-mono text-xs text-[#FFE27A]/80">
          {playerAvatar} {playerName}
        </p>
      </motion.div>

      <CodeFragmentReveal
        fragment={finalFragment}
        lang={L}
        onContinue={() => {
          handleComplete();
        }}
      />

    </div>
  </QuestTaskShell>
)}