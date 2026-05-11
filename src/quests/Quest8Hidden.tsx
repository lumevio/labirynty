import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import MemoryLockInput from '../components/quest-ui/MemoryLockInput';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 6;
const CODE_FRAGMENT_KEY = 'OMEGA';

type HiddenSpot = { id: number; x: number; y: number; found: boolean; clue: string };

export default function Quest8Hidden({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest, completeTask, completeQuest,
    addCodeFragment, setMemory,
    addScore, unlockHiddenQuest,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [error, setError] = useState(false);

  // Task 0: Hidden spots discovery
  const [hiddenSpots, setHiddenSpots] = useState<HiddenSpot[]>([
    { id: 1, x: 15, y: 25, found: false, clue: 'O' },
    { id: 2, x: 78, y: 18, found: false, clue: 'M' },
    { id: 3, x: 35, y: 65, found: false, clue: 'E' },
    { id: 4, x: 88, y: 75, found: false, clue: 'G' },
    { id: 5, x: 50, y: 45, found: false, clue: 'A' },
  ]);

  // Task 1: Cipher decoding
  const [cipherInput, setCipherInput] = useState('');

  // Task 2: Hidden audio (simulated frequency tuning)
  const [frequency, setFrequency] = useState(500);
  const [signalDetected, setSignalDetected] = useState(false);

  // Task 3: Konami-like sequence
  const KONAMI = ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT'];
  const [konamiInput, setKonamiInput] = useState<string[]>([]);

  // Task 4: Hidden text in fake content
  const [decoyText, setDecoyText] = useState('');

  useEffect(() => { initQuest(8, TOTAL_TASKS); }, []);

  const nextTask = useCallback(() => {
    completeTask(8, task);
    addScore(30);
    setTask((t) => t + 1);
    setError(false);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(8);
    addCodeFragment({
      questId: 8,
      fragment: CODE_FRAGMENT_KEY,
      type: 'key',
      discoveredAt: Date.now(),
    });
    setMemory('q8_key', CODE_FRAGMENT_KEY, 8);
    unlockHiddenQuest(99); // Bonus hidden quest
    onComplete();
  }, []);

  // Task 0: Reveal hidden spot
  const findSpot = (id: number) => {
    setHiddenSpots((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, found: true } : s
      );

      if (updated.every((s) => s.found)) {
        const word = updated.map((s) => s.clue).join('');
        setMemory('q8_hidden_word', word, 8);
        setTimeout(nextTask, 1000);
      }

      return updated;
    });
  };

  // Task 2: Frequency lock
  useEffect(() => {
    if (task !== 2) return;

    if (Math.abs(frequency - 783) < 10) {
      setSignalDetected(true);

      const timer = setTimeout(() => {
        setMemory('q8_frequency', String(frequency), 8);
        nextTask();
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setSignalDetected(false);
    }
  }, [frequency, task]);

  // Task 3: Konami code
  const handleKonamiInput = (dir: string) => {
    const newInput = [...konamiInput, dir];

    if (newInput.length > KONAMI.length) {
      newInput.shift();
    }

    setKonamiInput(newInput);

    const matches = newInput.every((d, i) => d === KONAMI[KONAMI.length - newInput.length + i]);

    if (newInput.length === KONAMI.length && matches) {
      setMemory('q8_konami_unlocked', 'true', 8);
      setTimeout(nextTask, 800);
    }
  };

  const ui = {
    title: { pl: 'UKRYTY SYGNAŁ', en: 'HIDDEN SIGNAL' },

    t0Title: { pl: 'POSZUKIWANIE PUNKTÓW', en: 'POINT HUNT' },
    t0Desc: {
      pl: 'Na ekranie ukrytych jest 5 punktów. Każdy zawiera jedną literę. Znajdź wszystkie, aby odkryć słowo. Patrz uważnie na detale.',
      en: '5 points are hidden on screen. Each contains one letter. Find them all to reveal the word. Look carefully at details.',
    },

    t1Title: { pl: 'DEKODOWANIE SZYFRU', en: 'CIPHER DECODING' },
    t1Desc: {
      pl: 'Odszyfruj poniższy tekst używając szyfru Cezara (przesunięcie -3). Zaszyfrowane: "RPHJD"',
      en: 'Decode the text below using Caesar cipher (shift -3). Encrypted: "RPHJD"',
    },

    t2Title: { pl: 'TUNING CZĘSTOTLIWOŚCI', en: 'FREQUENCY TUNING' },
    t2Desc: {
      pl: 'Znajdź ukrytą częstotliwość sygnału. Strojenie precyzyjne, słuchaj dokładnie!',
      en: 'Find the hidden signal frequency. Precise tuning, listen carefully!',
    },

    t3Title: { pl: 'TAJNY KOD', en: 'SECRET CODE' },
    t3Desc: {
      pl: 'Wprowadź ukrytą sekwencję ruchów (klasyk wśród kodów). Wskazówka: ↑↑↓↓...',
      en: 'Enter the hidden movement sequence (a classic code). Hint: ↑↑↓↓...',
    },

    t4Title: { pl: 'POWRÓT DO Q3', en: 'BACK-REF: Q3' },
    t4Desc: {
      pl: 'Wpisz słowo-klucz odkryte w Queście 3.',
      en: 'Enter the keyword discovered in Quest 3.',
    },

    t5Title: { pl: 'FRAGMENT ODKRYTY', en: 'FRAGMENT DISCOVERED' },
  } as const;

  return (
    <QuestFrame title={`QUEST 8 — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>👁️ Q8</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        {task === 0 && <span>🔍 {hiddenSpots.filter((s) => s.found).length}/5</span>}
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: HIDDEN SPOTS ============ */}
        <QuestTaskShell
          key="t0"
          taskNumber={1}
          totalTasks={TOTAL_TASKS}
          taskType="observation"
          title={ui.t0Title[L]}
          description={ui.t0Desc[L]}
          isActive={task === 0}
          isCompleted={task > 0}
          physicalHint={L === 'pl' ? '📍 BRAMA UKRYTA — SZUKAJ DROBNYCH SZCZEGÓŁÓW' : '📍 HIDDEN GATE — LOOK FOR TINY DETAILS'}
        >
          <div className="space-y-4">
            <div className="
              relative h-64 rounded-xl border-2 border-[#8B4513]
              bg-gradient-to-br from-[#3D2A00] via-[#1A0C03] to-[#0D0600] overflow-hidden
            ">
              {/* Decoy elements */}
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-[#FFE27A]/10"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}

              {/* Hidden spots */}
              {hiddenSpots.map((spot) => (
                <motion.button
                  key={spot.id}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => findSpot(spot.id)}
                  className={`
                    absolute w-3 h-3 rounded-full
                    ${spot.found
                      ? 'bg-[#5CBD76] shadow-[0_0_15px_rgba(92,189,118,0.8)]'
                      : 'bg-[#FFE27A]/30 hover:bg-[#FFE27A]/60'
                    }
                  `}
                  style={{
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                  }}
                >
                  {spot.found && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-orbitron text-xs font-bold text-[#5CBD76]">
                      {spot.clue}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="
              bg-[#1A0C03] rounded-lg border border-[#8B4513]/30 p-3 text-center
            ">
              <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest mb-1">
                {L === 'pl' ? 'ODKRYTE LITERY' : 'DISCOVERED LETTERS'}
              </p>
              <p className="font-mono text-2xl font-bold text-[#FFE27A] tracking-[0.5em]">
                {hiddenSpots
                  .filter((s) => s.found)
                  .map((s) => s.clue)
                  .join(' ')
                  .padEnd(9, '_')}
              </p>
            </div>
          </div>
        </QuestTaskShell>

        {/* ============ TASK 1: CAESAR CIPHER ============ */}
        <QuestTaskShell
          key="t1"
          taskNumber={2}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={ui.t1Title[L]}
          description={ui.t1Desc[L]}
          isActive={task === 1}
          isCompleted={task > 1}
        >
          <div className="space-y-4">
            <div className="
              bg-[#1A0C03] rounded-xl border-2 border-[#C97A3F]/40 p-4 text-center
            ">
              <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest mb-2">
                {L === 'pl' ? 'ZASZYFROWANE' : 'ENCRYPTED'}
              </p>
              <p className="font-mono text-3xl font-bold text-red-400 tracking-[0.4em]">
                RPHJD
              </p>
            </div>

            <div className="
              bg-[#5C2E0A]/20 rounded-lg border border-[#C97A3F]/20 p-3
            ">
              <p className="text-[10px] text-[#FFE27A]/70">
                💡 {L === 'pl'
                  ? 'Każda litera jest przesunięta o 3 miejsca w alfabecie. Cofnij ją o 3.'
                  : 'Each letter is shifted by 3 positions in the alphabet. Shift it back by 3.'}
              </p>
            </div>

            <input
              type="text"
              value={cipherInput}
              onChange={(e) => setCipherInput(e.target.value.toUpperCase())}
              placeholder="? ? ? ? ?"
              maxLength={5}
              className="
                w-full bg-[#1A0C03] border-2 border-[#8B4513]
                rounded-xl p-3 text-center font-mono text-2xl
                font-bold text-[#FFE27A] tracking-[0.4em]
                focus:outline-none focus:border-[#FFE27A]
              "
            />

            <QuestButton
              onClick={() => {
                if (cipherInput === 'OMEGA') {
                  setMemory('q8_decoded', cipherInput, 8);
                  nextTask();
                } else {
                  setError(true);
                  setTimeout(() => setError(false), 1000);
                }
              }}
              variant="gold"
              disabled={cipherInput.length < 5}
            >
              🔓 {L === 'pl' ? 'DEKODUJ' : 'DECODE'}
            </QuestButton>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Nieprawidłowy kod. R=O, P=M...' : 'Wrong code. R=O, P=M...'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 2: FREQUENCY TUNING ============ */}
        <QuestTaskShell
          key="t2"
          taskNumber={3}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={ui.t2Title[L]}
          description={ui.t2Desc[L]}
          isActive={task === 2}
          isCompleted={task > 2}
        >
          <div className="space-y-4">
            <div className="
              bg-[#1A0C03] rounded-2xl border-2 border-[#FFE27A]/40 p-6 text-center
            ">
              <motion.div
                animate={{
                  scale: signalDetected ? [1, 1.1, 1] : 1,
                  opacity: signalDetected ? 1 : 0.5,
                }}
                transition={{ duration: 0.5, repeat: signalDetected ? Infinity : 0 }}
                className="text-5xl"
              >
                {signalDetected ? '📡' : '📻'}
              </motion.div>

              <p className="mt-3 font-mono text-3xl font-bold text-[#FFE27A]">
                {frequency} <span className="text-sm text-[#C97A3F]">Hz</span>
              </p>

              {signalDetected && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-[#5CBD76] animate-pulse font-mono"
                >
                  ✅ {L === 'pl' ? 'SYGNAŁ ZŁAPANY!' : 'SIGNAL LOCKED!'}
                </motion.p>
              )}
            </div>

            <input
              type="range"
              min={100}
              max={2000}
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value))}
              className="w-full accent-[#FFE27A]"
            />

            <div className="flex justify-between text-[9px] font-mono text-[#C97A3F]">
              <span>100 Hz</span>
              <span>2000 Hz</span>
            </div>

            <div className="grid grid-cols-4 gap-1">
              <QuestButton onClick={() => setFrequency((f) => Math.max(100, f - 100))} variant="wood">
                -100
              </QuestButton>
              <QuestButton onClick={() => setFrequency((f) => Math.max(100, f - 10))} variant="wood">
                -10
              </QuestButton>
              <QuestButton onClick={() => setFrequency((f) => Math.min(2000, f + 10))} variant="wood">
                +10
              </QuestButton>
              <QuestButton onClick={() => setFrequency((f) => Math.min(2000, f + 100))} variant="wood">
                +100
              </QuestButton>
            </div>

            <p className="text-center text-[9px] font-mono text-[#FFE27A]/40">
              💡 {L === 'pl' ? 'Szukaj między 700-800 Hz' : 'Search between 700-800 Hz'}
            </p>
          </div>
        </QuestTaskShell>

        {/* ============ TASK 3: KONAMI CODE ============ */}
        <QuestTaskShell
          key="t3"
          taskNumber={4}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={ui.t3Title[L]}
          description={ui.t3Desc[L]}
          isActive={task === 3}
          isCompleted={task > 3}
        >
          <div className="space-y-4">
            <div className="
              bg-[#1A0C03] rounded-xl border border-[#8B4513]/30 p-3
            ">
              <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest mb-2 text-center">
                {L === 'pl' ? 'TWOJA SEKWENCJA' : 'YOUR SEQUENCE'}
              </p>
              <p className="text-center font-mono text-2xl text-[#FFE27A] tracking-widest min-h-[36px]">
                {konamiInput.map((d) => {
                  switch (d) {
                    case 'UP': return '↑';
                    case 'DOWN': return '↓';
                    case 'LEFT': return '←';
                    case 'RIGHT': return '→';
                    default: return '';
                  }
                }).join(' ')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
              <div />
              <QuestButton onClick={() => handleKonamiInput('UP')} variant="wood">↑</QuestButton>
              <div />
              <QuestButton onClick={() => handleKonamiInput('LEFT')} variant="wood">←</QuestButton>
              <QuestButton onClick={() => setKonamiInput([])} variant="red">✕</QuestButton>
              <QuestButton onClick={() => handleKonamiInput('RIGHT')} variant="wood">→</QuestButton>
              <div />
              <QuestButton onClick={() => handleKonamiInput('DOWN')} variant="wood">↓</QuestButton>
              <div />
            </div>

            <div className="text-center text-[9px] font-mono text-[#FFE27A]/40">
              ↑ ↑ ↓ ↓ ← → ← →
            </div>
          </div>
        </QuestTaskShell>

        {/* ============ TASK 4: BACK-REF Q3 ============ */}
        <QuestTaskShell
          key="t4"
          taskNumber={5}
          totalTasks={TOTAL_TASKS}
          taskType="memory_lock"
          title={ui.t4Title[L]}
          description={ui.t4Desc[L]}
          isActive={task === 4}
          isCompleted={task > 4}
        >
          <MemoryLockInput
            memoryKey="q3_quiz_word"
            expectedValue="CORN"
            sourceQuest={3}
            hint={L === 'pl' ? 'Słowo-klucz odkryte na końcu quizu Q3' : 'Keyword discovered at end of Q3 quiz'}
            onUnlock={nextTask}
            onFail={onFail}
            lang={L}
          />
        </QuestTaskShell>

        {/* ============ TASK 5: FRAGMENT REVEAL ============ */}
        <QuestTaskShell
          key="t5"
          taskNumber={6}
          totalTasks={TOTAL_TASKS}
          taskType="code_input"
          title={ui.t5Title[L]}
          isActive={task === 5}
          isCompleted={task > 5}
        >
          <CodeFragmentReveal
            fragment={{
              questId: 8,
              fragment: CODE_FRAGMENT_KEY,
              type: 'key',
              discoveredAt: Date.now(),
            }}
            lang={L}
            onContinue={handleComplete}
          />
        </QuestTaskShell>
      </AnimatePresence>
    </QuestFrame>
  );
}