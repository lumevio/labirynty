import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import MemoryLockInput from '../components/quest-ui/MemoryLockInput';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 7;
const CODE_FRAGMENT = '58';

type Card = {
  id: number;
  symbol: string;
  isPair: boolean;
};

type SimonStep = string;

export default function Quest5Memory({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest, completeTask, completeQuest,
    addCodeFragment, setMemory, getMemory, hasMemory,
    addScore,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [error, setError] = useState(false);

  // Task 0: Physical memory challenge
  const [physicalItems, setPhysicalItems] = useState<string[]>([]);

  // Task 1: Enhanced card memory (6 pairs + 2 decoys)
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [memAttempts, setMemAttempts] = useState(0);

  // Task 2: Simon Says (growing sequence)
  const [simonSequence, setSimonSequence] = useState<SimonStep[]>([]);
  const [simonInput, setSimonInput] = useState<SimonStep[]>([]);
  const [simonPhase, setSimonPhase] = useState<'watching' | 'input'>('watching');
  const [simonRound, setSimonRound] = useState(1);
  const [activeSimon, setActiveSimon] = useState<string | null>(null);

  // Task 3: Number sequence memory
  const [numberSequence, setNumberSequence] = useState<number[]>([]);
  const [numberInput, setNumberInput] = useState<number[]>([]);
  const [numberPhase, setNumberPhase] = useState<'show' | 'input'>('show');
  const [numberRound, setNumberRound] = useState(1);

  // Task 4: Spatial pattern memory
  const [spatialGrid, setSpatialGrid] = useState<boolean[]>(new Array(16).fill(false));
  const [spatialTarget, setSpatialTarget] = useState<boolean[]>(new Array(16).fill(false));
  const [spatialPhase, setSpatialPhase] = useState<'show' | 'input'>('show');

  const SYMBOLS = ['🌽', '🌾', '🍃', '☀️', '⚡', '🔺'];
  const SIMON_COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

  useEffect(() => { initQuest(5, TOTAL_TASKS); }, []);

  // Initialize card game
  useEffect(() => {
    if (task === 1) {
      const pairs = [...SYMBOLS, ...SYMBOLS];
      const decoys = ['⚠️', '❓'];
      const all = [...pairs, ...decoys].map((symbol, id) => ({
        id,
        symbol,
        isPair: !['⚠️', '❓'].includes(symbol),
      }));
      setCards(all.sort(() => Math.random() - 0.5));
      setFlipped([]);
      setMatched([]);
      setMemAttempts(0);
    }
  }, [task]);

  // Initialize Simon Says
  useEffect(() => {
    if (task === 2) {
      startSimonRound(1);
    }
  }, [task]);

  // Initialize number sequence
  useEffect(() => {
    if (task === 3) {
      generateNumberSequence(3);
    }
  }, [task]);

  // Initialize spatial pattern
  useEffect(() => {
    if (task === 4) {
      generateSpatialPattern();
    }
  }, [task]);

  const nextTask = useCallback(() => {
    completeTask(5, task);
    addScore(20);
    setTask((t) => t + 1);
    setError(false);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(5);
    addCodeFragment({
      questId: 5,
      fragment: CODE_FRAGMENT,
      type: 'digits',
      discoveredAt: Date.now(),
    });
    setMemory('q5_code', CODE_FRAGMENT, 5);
    onComplete();
  }, []);

  // Simon Says logic
  const startSimonRound = (round: number) => {
    setSimonRound(round);
    setSimonPhase('watching');
    setSimonInput([]);

    const seq = Array.from({ length: round + 2 }, () =>
      SIMON_COLORS[Math.floor(Math.random() * 4)]
    );
    setSimonSequence(seq);

    // Play sequence with delays
    seq.forEach((color, i) => {
      setTimeout(() => {
        setActiveSimon(color);
        setTimeout(() => setActiveSimon(null), 400);
      }, i * 800);
    });

    setTimeout(() => {
      setSimonPhase('input');
    }, seq.length * 800 + 500);
  };

  // Number sequence logic
  const generateNumberSequence = (length: number) => {
    const seq = Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
    setNumberSequence(seq);
    setNumberInput([]);
    setNumberPhase('show');

    setTimeout(() => setNumberPhase('input'), length * 600 + 1000);
  };

  // Spatial pattern logic
  const generateSpatialPattern = () => {
    const pattern = new Array(16).fill(false);
    const activeCells = new Set<number>();

    while (activeCells.size < 5) {
      activeCells.add(Math.floor(Math.random() * 16));
    }

    activeCells.forEach((i) => { pattern[i] = true; });
    setSpatialTarget(pattern);
    setSpatialGrid(new Array(16).fill(false));
    setSpatialPhase('show');

    setTimeout(() => setSpatialPhase('input'), 3000);
  };

  // Card flip handler
  const handleCardFlip = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMemAttempts((a) => a + 1);
      const [a, b] = newFlipped;

      if (cards[a].symbol === cards[b].symbol && cards[a].isPair) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);

        if (newMatched.length >= 12) {
          setMemory('q5_memory_pairs', String(memAttempts + 1), 5);
          setTimeout(nextTask, 800);
        }
      } else {
        setTimeout(() => setFlipped([]), 600);

        if (memAttempts >= 20) {
          onFail();
        }
      }
    }
  };

  const simonColorMap: Record<string, string> = {
    RED: 'bg-red-500',
    BLUE: 'bg-blue-500',
    GREEN: 'bg-green-500',
    YELLOW: 'bg-yellow-500',
  };

  const ui = {
    title: { pl: 'PAMIĘĆ SIECI', en: 'NETWORK MEMORY' },

    t0Title: { pl: 'PAMIĘĆ FIZYCZNA', en: 'PHYSICAL MEMORY' },
    t0Desc: {
      pl: 'Na POLANIE CENTRALNEJ znajduje się 5 przedmiotów na stole. Obejrzyj je uważnie przez 30 sekund, potem odwróć się i wymień je wszystkie.',
      en: 'On the CENTRAL CLEARING there are 5 items on the table. Study them carefully for 30 seconds, then turn away and list them all.',
    },

    t1Title: { pl: 'SIATKA PAMIĘCI', en: 'MEMORY GRID' },
    t1Desc: {
      pl: 'Znajdź 6 par symboli. UWAGA: 2 karty są fałszywe (⚠️ i ❓) — nie mają par! Masz 20 prób.',
      en: 'Find 6 symbol pairs. WARNING: 2 cards are decoys (⚠️ and ❓) — no pairs! You have 20 attempts.',
    },

    t2Title: { pl: 'SIMON MÓWI', en: 'SIMON SAYS' },
    t2Desc: {
      pl: 'Zapamiętaj i odtwórz rosnącą sekwencję kolorów. Z każdą rundą sekwencja się wydłuża!',
      en: 'Memorize and reproduce a growing color sequence. Each round the sequence gets longer!',
    },

    t3Title: { pl: 'SEKWENCJA CYFR', en: 'DIGIT SEQUENCE' },
    t3Desc: {
      pl: 'Zapamiętaj wyświetlane cyfry i odtwórz je w tej samej kolejności. Sekwencja rośnie z każdą rundą!',
      en: 'Memorize displayed digits and reproduce them in the same order. Sequence grows each round!',
    },

    t4Title: { pl: 'WZORZEC PRZESTRZENNY', en: 'SPATIAL PATTERN' },
    t4Desc: {
      pl: 'Zapamiętaj podświetlone komórki siatki 4×4, a następnie odtwórz wzorzec z pamięci.',
      en: 'Memorize highlighted cells in a 4×4 grid, then reproduce the pattern from memory.',
    },

    t5Title: { pl: 'BACK-REF: QUEST 7', en: 'BACK-REF: QUEST 7' },
    t5Desc: {
      pl: 'Wpisz liczbę rzędów kukurydzy zapamiętaną z Questa 7.',
      en: 'Enter the number of corn rows memorized from Quest 7.',
    },
  } as const;

  return (
    <QuestFrame title={`QUEST 5 — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>🧠 Q5</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        {task === 1 && <span>🎯 {matched.length / 2}/6 | ⚡ {memAttempts}</span>}
        {task === 2 && <span>🔄 R{simonRound}</span>}
        {task === 3 && <span>🔢 R{numberRound}</span>}
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: PHYSICAL MEMORY ============ */}
        <QuestTaskShell
          key="t0"
          taskNumber={1}
          totalTasks={TOTAL_TASKS}
          taskType="observation"
          title={ui.t0Title[L]}
          description={ui.t0Desc[L]}
          isActive={task === 0}
          isCompleted={task > 0}
          physicalHint={L === 'pl' ? '📍 POLANA CENTRALNA — STÓŁ Z PRZEDMIOTAMI' : '📍 CENTRAL CLEARING — TABLE WITH ITEMS'}
        >
          <div className="space-y-3">
            <p className="text-center text-[10px] text-[#C97A3F] font-mono">
              {L === 'pl' ? 'Wpisz 5 przedmiotów (po jednym)' : 'Enter 5 items (one by one)'}
            </p>

            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full border border-[#FFE27A]/30 bg-[#FFE27A]/10 flex items-center justify-center font-mono text-[10px] text-[#FFE27A]">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={physicalItems[i] || ''}
                  onChange={(e) => {
                    const items = [...physicalItems];
                    items[i] = e.target.value;
                    setPhysicalItems(items);
                  }}
                  placeholder={L === 'pl' ? 'przedmiot...' : 'item...'}
                  className="
                    flex-1 bg-[#1A0C03] border border-[#8B4513]
                    rounded-lg p-2 text-sm text-[#FFE27A]
                    focus:outline-none focus:border-[#FFE27A]
                    placeholder:text-[#8B4513]/40
                  "
                />
              </div>
            ))}

            <QuestButton
              onClick={() => {
                const filled = physicalItems.filter((item) => item.trim().length > 0);

                if (filled.length >= 4) {
                  setMemory('q5_physical_items', filled.join(','), 5);
                  nextTask();
                } else {
                  setError(true);
                  setTimeout(() => setError(false), 1000);
                }
              }}
              variant="gold"
              disabled={physicalItems.filter((i) => i?.trim()).length < 3}
            >
              📋 {L === 'pl' ? 'ZŁÓŻ RAPORT' : 'SUBMIT REPORT'}
            </QuestButton>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Minimum 4 przedmioty!' : 'Minimum 4 items!'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 1: CARD MEMORY ============ */}
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
          <div className="grid grid-cols-4 gap-1.5 max-w-xs mx-auto">
            {cards.map((card, i) => {
              const isFlipped = flipped.includes(i);
              const isMatched = matched.includes(i);

              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCardFlip(i)}
                  className={`
                    h-14 rounded-lg flex items-center justify-center text-lg
                    border-2 transition-all
                    ${isMatched
                      ? 'border-[#5CBD76] bg-[#5CBD76]/15'
                      : isFlipped
                        ? 'border-[#FFE27A] bg-[#FFE27A]/10'
                        : 'border-[#8B4513]/30 bg-[#1A0C03]'
                    }
                  `}
                >
                  {isFlipped || isMatched ? card.symbol : '?'}
                </motion.button>
              );
            })}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 2: SIMON SAYS ============ */}
        <QuestTaskShell
          key="t2"
          taskNumber={3}
          totalTasks={TOTAL_TASKS}
          taskType="memory_lock"
          title={ui.t2Title[L]}
          description={ui.t2Desc[L]}
          isActive={task === 2}
          isCompleted={task > 2}
        >
          <div className="space-y-4">
            <div className="text-center font-orbitron text-[10px] text-[#FFE27A]/50 tracking-widest">
              {simonPhase === 'watching'
                ? (L === 'pl' ? 'OBSERWUJ...' : 'WATCH...')
                : (L === 'pl' ? 'ODTWÓRZ!' : 'REPRODUCE!')
              }
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-[200px] mx-auto">
              {SIMON_COLORS.map((color) => (
                <motion.button
                  key={color}
                  whileTap={simonPhase === 'input' ? { scale: 0.9 } : {}}
                  disabled={simonPhase !== 'input'}
                  onClick={() => {
                    if (simonPhase !== 'input') return;

                    const newInput = [...simonInput, color];
                    setSimonInput(newInput);

                    const idx = newInput.length - 1;

                    if (newInput[idx] !== simonSequence[idx]) {
                      setSimonInput([]);
                      setError(true);
                      setTimeout(() => {
                        setError(false);

                        if (simonRound <= 1) {
                          onFail();
                        } else {
                          startSimonRound(simonRound);
                        }
                      }, 800);
                      return;
                    }

                    if (newInput.length === simonSequence.length) {
                      if (simonRound >= 3) {
                        setMemory('q5_simon_completed', 'true', 5);
                        nextTask();
                      } else {
                        setTimeout(() => startSimonRound(simonRound + 1), 800);
                      }
                    }
                  }}
                  className={`
                    h-20 rounded-xl border-2 transition-all
                    ${activeSimon === color
                      ? `${simonColorMap[color]} border-white brightness-150`
                      : `${simonColorMap[color]} opacity-40 border-white/20`
                    }
                    ${simonPhase === 'input' ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                />
              ))}
            </div>

            <div className="text-center text-[9px] font-mono text-[#C97A3F]">
              {L === 'pl' ? 'RUNDA' : 'ROUND'} {simonRound}/3 |
              {L === 'pl' ? ' DŁUGOŚĆ' : ' LENGTH'}: {simonSequence.length}
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Błędna sekwencja!' : 'Wrong sequence!'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 3: NUMBER SEQUENCE ============ */}
        <QuestTaskShell
          key="t3"
          taskNumber={4}
          totalTasks={TOTAL_TASKS}
          taskType="memory_lock"
          title={ui.t3Title[L]}
          description={ui.t3Desc[L]}
          isActive={task === 3}
          isCompleted={task > 3}
        >
          <div className="space-y-4">
            {numberPhase === 'show' && (
              <div className="text-center space-y-3">
                <p className="font-orbitron text-[10px] text-[#FFE27A]/50 animate-pulse tracking-widest">
                  {L === 'pl' ? 'ZAPAMIĘTAJ...' : 'MEMORIZE...'}
                </p>

                <div className="flex justify-center gap-2">
                  {numberSequence.map((n, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.5 }}
                      className="
                        w-12 h-12 rounded-xl border-2 border-[#FFE27A]
                        bg-[#FFE27A]/10 flex items-center justify-center
                        font-mono text-xl font-bold text-[#FFE27A]
                      "
                    >
                      {n}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {numberPhase === 'input' && (
              <div className="space-y-3">
                <div className="flex justify-center gap-2 min-h-[48px]">
                  {numberSequence.map((_, i) => (
                    <div
                      key={i}
                      className={`
                        w-10 h-10 rounded-lg border-2
                        flex items-center justify-center font-mono font-bold
                        ${numberInput[i] !== undefined
                          ? 'border-[#FFE27A] bg-[#FFE27A]/10 text-[#FFE27A]'
                          : 'border-dashed border-[#8B4513]/30 text-[#8B4513]'
                        }
                      `}
                    >
                      {numberInput[i] ?? '?'}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (numberInput.length >= numberSequence.length) return;

                        const newInput = [...numberInput, n];
                        setNumberInput(newInput);

                        if (newInput.length === numberSequence.length) {
                          const correct = newInput.every((v, i) => v === numberSequence[i]);

                          if (correct) {
                            if (numberRound >= 3) {
                              setMemory('q5_numbers_completed', 'true', 5);
                              nextTask();
                            } else {
                              setNumberRound((r) => r + 1);
                              generateNumberSequence(3 + numberRound);
                            }
                          } else {
                            setNumberInput([]);
                            setError(true);
                            setTimeout(() => setError(false), 800);
                          }
                        }
                      }}
                      className="
                        h-10 rounded-lg border border-[#8B4513]/50
                        bg-[#1A0C03] font-mono text-sm font-bold
                        text-[#FFE27A] active:bg-[#FFE27A]/20
                      "
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>

                {numberInput.length > 0 && (
                  <QuestButton onClick={() => setNumberInput([])} variant="red">
                    ↩ {L === 'pl' ? 'WYCZYŚĆ' : 'CLEAR'}
                  </QuestButton>
                )}
              </div>
            )}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Błędna sekwencja!' : 'Wrong sequence!'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 4: SPATIAL PATTERN ============ */}
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
          <div className="space-y-4">
            <div className="text-center font-orbitron text-[10px] text-[#FFE27A]/50 tracking-widest">
              {spatialPhase === 'show'
                ? (L === 'pl' ? 'ZAPAMIĘTAJ WZORZEC...' : 'MEMORIZE PATTERN...')
                : (L === 'pl' ? 'ODTWÓRZ!' : 'REPRODUCE!')
              }
            </div>

            <div className="grid grid-cols-4 gap-1.5 max-w-[200px] mx-auto">
              {Array.from({ length: 16 }, (_, i) => {
                const isTarget = spatialTarget[i];
                const isSelected = spatialGrid[i];
                const showTarget = spatialPhase === 'show';

                return (
                  <motion.button
                    key={i}
                    whileTap={spatialPhase === 'input' ? { scale: 0.9 } : {}}
                    onClick={() => {
                      if (spatialPhase !== 'input') return;

                      setSpatialGrid((prev) => {
                        const next = [...prev];
                        next[i] = !next[i];
                        return next;
                      });
                    }}
                    className={`
                      h-12 rounded-lg border-2 transition-all
                      ${showTarget && isTarget
                        ? 'border-[#FFE27A] bg-[#FFE27A]/30'
                        : isSelected
                          ? 'border-[#5CBD76] bg-[#5CBD76]/20'
                          : 'border-[#8B4513]/30 bg-[#1A0C03]'
                      }
                    `}
                  />
                );
              })}
            </div>

            {spatialPhase === 'show' && (
              <div className="w-full h-1 bg-[#1A0C03] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full bg-[#FFE27A]"
                />
              </div>
            )}

            {spatialPhase === 'input' && (
              <QuestButton
                onClick={() => {
                  const correct = spatialGrid.every((v, i) => v === spatialTarget[i]);

                  if (correct) {
                    setMemory('q5_spatial_completed', 'true', 5);
                    nextTask();
                  } else {
                    setSpatialGrid(new Array(16).fill(false));
                    setError(true);
                    setTimeout(() => {
                      setError(false);
                      generateSpatialPattern();
                    }, 1000);
                  }
                }}
                variant="gold"
              >
                ✅ {L === 'pl' ? 'WERYFIKUJ WZORZEC' : 'VERIFY PATTERN'}
              </QuestButton>
            )}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Błędny wzorzec! Spróbuj ponownie.' : 'Wrong pattern! Try again.'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 5: MEMORY LOCK FROM Q7 ============ */}
        <QuestTaskShell
          key="t5"
          taskNumber={6}
          totalTasks={TOTAL_TASKS}
          taskType="memory_lock"
          title={ui.t5Title[L]}
          description={ui.t5Desc[L]}
          isActive={task === 5}
          isCompleted={task > 5}
        >
          <MemoryLockInput
            memoryKey="q7_row_count"
            expectedValue="8"
            sourceQuest={7}
            hint={L === 'pl' ? 'Ile rzędów kukurydzy policzyłeś w Quest 7?' : 'How many corn rows did you count in Quest 7?'}
            onUnlock={nextTask}
            onFail={onFail}
            lang={L}
          />
        </QuestTaskShell>

        {/* ============ TASK 6: FRAGMENT REVEAL ============ */}
        <QuestTaskShell
          key="t6"
          taskNumber={7}
          totalTasks={TOTAL_TASKS}
          taskType="code_input"
          title={L === 'pl' ? 'FRAGMENT ODKRYTY' : 'FRAGMENT DISCOVERED'}
          isActive={task === 6}
          isCompleted={task > 6}
        >
          <CodeFragmentReveal
            fragment={{
              questId: 5,
              fragment: CODE_FRAGMENT,
              type: 'digits',
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