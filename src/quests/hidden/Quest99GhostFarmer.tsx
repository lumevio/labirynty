import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useGameStore } from '../../systems/GameState';
import QuestFrame from '../../components/quest-ui/QuestFrame';
import QuestButton from '../../components/quest-ui/QuestButton';
import QuestTaskShell from '../../components/quest-ui/QuestTaskShell';
import MorseCodePuzzle from '../../components/quest-ui/MorseCodePuzzle';
import type { StandardQuestProps } from '../../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 5;

export default function Quest99GhostFarmer({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const { addScore, setMemory, unlockHiddenQuest } = useGameStore();

  const [task, setTask] = useState(0);
  const [ghostPos, setGhostPos] = useState({ x: 50, y: 50 });
  const [tearsCollected, setTearsCollected] = useState(0);
  const [whispers, setWhispers] = useState<string[]>([]);
  const [chant, setChant] = useState('');

  // Ghost movement
  useEffect(() => {
    if (task !== 0) return;

    const interval = setInterval(() => {
      setGhostPos({
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 15,
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [task]);

  // Whispers playback
  useEffect(() => {
    if (task !== 2) return;

    const ghostWhispers = [
      L === 'pl' ? 'pamiętaj... rzędach...' : 'remember... rows...',
      L === 'pl' ? 'siódmego rzędu...' : 'seventh row...',
      L === 'pl' ? 'pod kamieniem...' : 'under the stone...',
      L === 'pl' ? 'klucz... do prawdy...' : 'key... to truth...',
    ];

    let idx = 0;
    const interval = setInterval(() => {
      setWhispers((prev) => [...prev, ghostWhispers[idx]]);
      idx++;
      if (idx >= ghostWhispers.length) clearInterval(interval);
    }, 2000);

    return () => clearInterval(interval);
  }, [task]);

  const nextTask = useCallback(() => {
    addScore(100);
    setTask((t) => t + 1);
  }, []);

  const handleComplete = useCallback(() => {
    unlockHiddenQuest(99);
    setMemory('q99_ghost_freed', 'true', 99);
    onComplete();
  }, []);

  const ui = {
    title: { pl: '👻 DUCH FARMERA', en: '👻 GHOST FARMER' },

    t0Title: { pl: 'POLOWANIE NA DUCHA', en: 'GHOST HUNT' },
    t0Desc: {
      pl: 'Złap ducha 5 razy. Pojawia się losowo na ekranie. Tylko najbystrzejsi go widzą.',
      en: 'Catch the ghost 5 times. It appears randomly on screen. Only the keenest see it.',
    },

    t1Title: { pl: 'ŁZY ZBIORÓW', en: 'HARVEST TEARS' },
    t1Desc: {
      pl: 'Zbierz 7 spadających łez ducha. Każda zawiera fragment jego wspomnienia.',
      en: 'Collect 7 falling ghost tears. Each holds a fragment of his memory.',
    },

    t2Title: { pl: 'SZEPTY ZIEMI', en: 'EARTH WHISPERS' },
    t2Desc: {
      pl: 'Wsłuchaj się w szepty. Po wszystkich szeptach wpisz kluczowe słowo (3 litery).',
      en: 'Listen to whispers. After all whispers, enter the key word (3 letters).',
    },

    t3Title: { pl: 'OSTATNIA WIADOMOŚĆ', en: 'LAST MESSAGE' },
    t3Desc: {
      pl: 'Duch nadaje ostatnią wiadomość w Morse\'ie.',
      en: 'Ghost transmits last message in Morse.',
    },

    t4Title: { pl: 'UWOLNIENIE', en: 'LIBERATION' },
    t4Desc: {
      pl: 'Wyrecytuj zaklęcie uwolnienia: "WOLNOŚĆ"',
      en: 'Recite liberation spell: "FREEDOM"',
    },
  } as const;

  return (
    <QuestFrame title={`SECRET — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-purple-400/60 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg border border-purple-500/20">
        <span>👻 HIDDEN</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        <span>🌙 SECRET</span>
      </div>

      <AnimatePresence mode="wait">

        {/* TASK 0: GHOST CATCHING */}
        {task === 0 && (
          <QuestTaskShell
            key="t0"
            taskNumber={1}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={ui.t0Title[L]}
            description={ui.t0Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-3">
              <div className="text-center font-mono text-sm text-purple-400">
                {L === 'pl' ? 'Złapane' : 'Caught'}: {tearsCollected}/5
              </div>

              <div
                className="
                  relative h-72 rounded-2xl border-2 border-purple-500/40
                  bg-gradient-to-b from-purple-900/40 via-[#1A0C03] to-[#0D0600]
                  overflow-hidden
                "
              >
                {/* Background mist */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [Math.random() * 100, Math.random() * 100],
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Infinity,
                    }}
                    className="absolute w-12 h-12 rounded-full bg-purple-300/10 blur-xl"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}

                {/* Ghost */}
                <motion.button
                  animate={{
                    left: `${ghostPos.x}%`,
                    top: `${ghostPos.y}%`,
                    opacity: [0.3, 0.9, 0.3],
                  }}
                  transition={{
                    left: { duration: 0.5, ease: 'easeInOut' },
                    top: { duration: 0.5, ease: 'easeInOut' },
                    opacity: { duration: 1.5, repeat: Infinity },
                  }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    const newCount = tearsCollected + 1;
                    setTearsCollected(newCount);
                    if (navigator.vibrate) navigator.vibrate(50);

                    if (newCount >= 5) {
                      setMemory('q99_ghost_caught', 'true', 99);
                      setTimeout(nextTask, 800);
                    }
                  }}
                  className="absolute text-5xl"
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  👻
                </motion.button>
              </div>
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 1: TEARS COLLECTOR (placeholder simplified) */}
        {task === 1 && (
          <QuestTaskShell
            key="t1"
            taskNumber={2}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={ui.t1Title[L]}
            description={ui.t1Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 7 }, (_, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.8 }}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: [0, 100, 0], opacity: [1, 1, 0.3] }}
                    transition={{
                      delay: i * 0.3,
                      duration: 3,
                      repeat: Infinity,
                    }}
                    onClick={() => {
                      const newCount = tearsCollected + 1;
                      setTearsCollected(newCount);

                      if (newCount >= 7) {
                        setMemory('q99_tears_collected', 'true', 99);
                        setTimeout(nextTask, 500);
                      }
                    }}
                    className="text-3xl"
                  >
                    💧
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-xs text-purple-400 font-mono">
                {L === 'pl' ? 'Łzy' : 'Tears'}: {tearsCollected}/7
              </p>
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 2: WHISPERS */}
        {task === 2 && (
          <QuestTaskShell
            key="t2"
            taskNumber={3}
            totalTasks={TOTAL_TASKS}
            taskType="memory_lock"
            title={ui.t2Title[L]}
            description={ui.t2Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-3">
              <div className="
                rounded-xl border-2 border-purple-500/40
                bg-[#0D0600] p-4 min-h-[120px] space-y-2
              ">
                {whispers.map((w, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 0.7, x: 0 }}
                    className="font-mono text-xs text-purple-300 italic"
                  >
                    "...{w}"
                  </motion.p>
                ))}
              </div>

              {whispers.length >= 4 && (
                <>
                  <input
                    type="text"
                    value={chant}
                    onChange={(e) => setChant(e.target.value.toUpperCase())}
                    placeholder="???"
                    maxLength={3}
                    className="
                      w-full bg-[#1A0C03] border-2 border-purple-500/50
                      rounded-xl p-3 text-center font-mono text-2xl font-bold
                      text-purple-300 tracking-[0.4em]
                      focus:outline-none focus:border-purple-400
                    "
                  />

                  <QuestButton
                    onClick={() => {
                      if (chant === 'KEY') {
                        setMemory('q99_whispers', 'KEY', 99);
                        nextTask();
                      } else {
                        setChant('');
                      }
                    }}
                    variant="gold"
                  >
                    🌙 {L === 'pl' ? 'WSŁUCHAJ' : 'LISTEN'}
                  </QuestButton>
                </>
              )}
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 3: MORSE GHOST MESSAGE */}
        {task === 3 && (
          <QuestTaskShell
            key="t3"
            taskNumber={4}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={ui.t3Title[L]}
            description={ui.t3Desc[L]}
            isActive
            isCompleted={false}
          >
            <MorseCodePuzzle
              encodedWord="FREE"
              expectedAnswer="FREE"
              hint={L === 'pl' ? '4 litery — to czego pragnie duch' : '4 letters — what ghost desires'}
              onSolved={() => {
                setMemory('q99_morse', 'FREE', 99);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* TASK 4: LIBERATION */}
        {task === 4 && (
          <QuestTaskShell
            key="t4"
            taskNumber={5}
            totalTasks={TOTAL_TASKS}
            taskType="memory_lock"
            title={ui.t4Title[L]}
            description={ui.t4Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-4 text-center">
              <motion.div
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl"
              >
                👻
              </motion.div>

              <input
                type="text"
                placeholder={L === 'pl' ? 'WOLNOŚĆ...' : 'FREEDOM...'}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (val === (L === 'pl' ? 'WOLNOŚĆ' : 'FREEDOM')) {
                    setTimeout(handleComplete, 1500);
                  }
                }}
                className="
                  w-full bg-[#1A0C03] border-2 border-purple-500
                  rounded-xl p-3 text-center font-mono text-xl font-bold
                  text-purple-300 tracking-[0.3em]
                  focus:outline-none focus:shadow-[0_0_20px_rgba(168,85,247,0.5)]
                "
              />
            </div>
          </QuestTaskShell>
        )}

      </AnimatePresence>
    </QuestFrame>
  );
}