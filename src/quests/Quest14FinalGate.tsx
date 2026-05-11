import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import MemoryLockInput from '../components/quest-ui/MemoryLockInput';
import SwipePatternLock from '../components/quest-ui/SwipePatternLock';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 6;
const FINAL_KEY = 'GATE';

export default function Quest14FinalGate({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest,
    completeTask,
    completeQuest,
    addCodeFragment,
    setMemory,
    addScore,
    codeFragments,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [error, setError] = useState(false);

  // Task 0: Sequence input (number + symbol combo)
  const masterSequence = [1, 3, 2, 4];
  const [progress, setProgress] = useState<number[]>([]);

  // Task 1: Multi-key combination
  const [keysHeld, setKeysHeld] = useState<Set<string>>(new Set());

  // Task 2: Final code assembly preview
  const allFragments = codeFragments;

  useEffect(() => {
    initQuest(14, TOTAL_TASKS);
  }, []);

  const nextTask = useCallback(() => {
    completeTask(14, task);
    addScore(50);
    setTask((t) => t + 1);
    setError(false);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(14);
    addCodeFragment({
      questId: 14,
      fragment: FINAL_KEY,
      type: 'key',
      discoveredAt: Date.now(),
    });
    setMemory('q14_final_key', FINAL_KEY, 14);
    onComplete();
  }, []);

  const pressMasterKey = (n: number) => {
    if (error) return;

    const newProgress = [...progress, n];

    if (newProgress[newProgress.length - 1] !== masterSequence[newProgress.length - 1]) {
      setProgress([]);
      setError(true);
      setTimeout(() => setError(false), 1000);
      return;
    }

    setProgress(newProgress);

    if (newProgress.length === masterSequence.length) {
      setMemory('q14_master_sequence', 'unlocked', 14);
      setTimeout(nextTask, 500);
    }
  };

  const toggleKey = (key: string) => {
    setKeysHeld((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const ui = {
    title: { pl: 'BRAMA FINAŁOWA', en: 'FINAL GATE' },

    t0Title: { pl: 'KOD MISTRZA', en: 'MASTER CODE' },
    t0Desc: {
      pl: 'Wpisz sekwencję mistrza w kolejności: 1 → 3 → 2 → 4',
      en: 'Enter master sequence in order: 1 → 3 → 2 → 4',
    },

    t1Title: { pl: 'WIELOKLAWISZOWA KOMBINACJA', en: 'MULTI-KEY COMBO' },
    t1Desc: {
      pl: 'Trzymaj jednocześnie klawisze A + C + E aby otworzyć przejście.',
      en: 'Hold simultaneously keys A + C + E to open passage.',
    },

    t2Title: { pl: 'WZÓR FINAŁOWY', en: 'FINAL PATTERN' },
    t2Desc: {
      pl: 'Narysuj wzór koniecznym dla aktywacji bramy. Wzór to klepsydra.',
      en: 'Draw pattern required for gate activation. Pattern is hourglass.',
    },

    t3Title: { pl: 'BACK-REF Q12', en: 'BACK-REF Q12' },
    t3Desc: {
      pl: 'Wpisz symbol z Wieży Wzorców (Q12).',
      en: 'Enter symbol from Pattern Tower (Q12).',
    },

    t4Title: { pl: 'PRZEGLĄD FRAGMENTÓW', en: 'FRAGMENT REVIEW' },
    t4Desc: {
      pl: 'Sprawdź czy zebrałeś wystarczającą liczbę fragmentów do finału.',
      en: 'Check if you collected enough fragments for finale.',
    },

    t5Title: { pl: 'KLUCZ ODKRYTY', en: 'KEY DISCOVERED' },
  } as const;

  return (
    <QuestFrame title={`QUEST 14 — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>🚪 Q14</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        <span>BRAMA FINAŁOWA</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: MASTER SEQUENCE ============ */}
        {task === 0 && (
          <QuestTaskShell
            key="t0"
            taskNumber={1}
            totalTasks={TOTAL_TASKS}
            taskType="code_input"
            title={ui.t0Title[L]}
            description={ui.t0Desc[L]}
            isActive
            isCompleted={false}
            physicalHint={L === 'pl' ? '📍 BRAMA FINAŁOWA — PANEL CYFROWY' : '📍 FINAL GATE — DIGITAL PANEL'}
          >
            <div className="space-y-4">
              <div
                className="
                  rounded-2xl border-2 border-[#FFE27A]/40
                  bg-[#1A0C03] p-4 text-center
                "
              >
                <p className="font-orbitron text-[10px] text-[#C97A3F] tracking-widest mb-2">
                  {L === 'pl' ? 'POSTĘP' : 'PROGRESS'}
                </p>
                <div className="flex justify-center gap-2 min-h-[40px]">
                  {masterSequence.map((_, i) => (
                    <div
                      key={i}
                      className={`
                        w-10 h-10 rounded-lg border-2
                        flex items-center justify-center font-mono text-lg font-bold
                        ${progress[i] !== undefined
                          ? error
                            ? 'border-red-500 bg-red-500/20 text-red-400'
                            : 'border-[#5CBD76] bg-[#5CBD76]/20 text-[#5CBD76]'
                          : 'border-dashed border-[#8B4513]/40 text-[#8B4513]'
                        }
                      `}
                    >
                      {progress[i] ?? '?'}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <motion.button
                    key={n}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => pressMasterKey(n)}
                    className="
                      h-16 rounded-xl border-2 border-[#8B4513]/50
                      bg-[#1A0C03] font-orbitron text-2xl font-bold text-[#FFE27A]
                      active:bg-[#FFE27A]/20 transition-colors
                    "
                  >
                    {n}
                  </motion.button>
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-xs text-red-400 font-mono animate-pulse"
                >
                  ❌ {L === 'pl' ? 'BŁĘDNA SEKWENCJA' : 'WRONG SEQUENCE'}
                </motion.p>
              )}
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 1: MULTI-KEY HOLD ============ */}
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
            <div className="space-y-4">
              <div
                className="
                  rounded-2xl border-2 p-4 text-center transition-colors
                  ${keysHeld.has('A') && keysHeld.has('C') && keysHeld.has('E')
                    ? 'border-[#5CBD76] bg-[#5CBD76]/10'
                    : 'border-[#8B4513]/40 bg-[#1A0C03]'}
                "
              >
                <p className="font-orbitron text-xs text-[#FFE27A] tracking-widest">
                  {L === 'pl' ? 'TRZYMAJ' : 'HOLD'}: A + C + E
                </p>
                <p className="mt-2 text-2xl">
                  {keysHeld.has('A') ? '✅' : '⬜'} {keysHeld.has('C') ? '✅' : '⬜'} {keysHeld.has('E') ? '✅' : '⬜'}
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {['A', 'B', 'C', 'D', 'E'].map((k) => {
                  const required = ['A', 'C', 'E'].includes(k);

                  return (
                    <motion.button
                      key={k}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleKey(k)}
                      className={`
                        h-14 rounded-xl border-2 font-orbitron text-lg font-bold
                        ${keysHeld.has(k)
                          ? required
                            ? 'border-[#5CBD76] bg-[#5CBD76]/30 text-[#5CBD76]'
                            : 'border-red-500 bg-red-500/30 text-red-400'
                          : 'border-[#8B4513]/50 bg-[#1A0C03] text-[#FFE27A]'
                        }
                      `}
                    >
                      {k}
                    </motion.button>
                  );
                })}
              </div>

              <QuestButton
                onClick={() => {
                  const correct =
                    keysHeld.has('A') && keysHeld.has('C') && keysHeld.has('E') &&
                    !keysHeld.has('B') && !keysHeld.has('D');

                  if (correct) {
                    setMemory('q14_combo', 'ACE', 14);
                    nextTask();
                  } else {
                    setError(true);
                    setTimeout(() => setError(false), 1000);
                  }
                }}
                variant="gold"
              >
                ⚡ {L === 'pl' ? 'AKTYWUJ' : 'ACTIVATE'}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 2: FINAL PATTERN ============ */}
        {task === 2 && (
          <QuestTaskShell
            key="t2"
            taskNumber={3}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={ui.t2Title[L]}
            description={ui.t2Desc[L]}
            isActive
            isCompleted={false}
          >
            <SwipePatternLock
              expectedPattern={[0, 2, 4, 6, 8, 4]}
              onUnlock={() => {
                setMemory('q14_pattern', 'hourglass', 14);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 3: BACK-REF Q12 ============ */}
        {task === 3 && (
          <QuestTaskShell
            key="t3"
            taskNumber={4}
            totalTasks={TOTAL_TASKS}
            taskType="memory_lock"
            title={ui.t3Title[L]}
            description={ui.t3Desc[L]}
            isActive
            isCompleted={false}
          >
            <MemoryLockInput
              memoryKey="q12_symbol"
              expectedValue="🔮"
              sourceQuest={12}
              hint={L === 'pl' ? 'Mistyczny symbol' : 'Mystic symbol'}
              onUnlock={nextTask}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 4: FRAGMENT REVIEW ============ */}
        {task === 4 && (
          <QuestTaskShell
            key="t4"
            taskNumber={5}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={ui.t4Title[L]}
            description={ui.t4Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-3">
              <div
                className="
                  rounded-2xl border-2 border-[#FFE27A]/40
                  bg-[#1A0C03] p-4
                "
              >
                <p className="font-orbitron text-[10px] text-[#C97A3F] tracking-widest mb-3 text-center">
                  {L === 'pl' ? 'ZEBRANE FRAGMENTY' : 'COLLECTED FRAGMENTS'}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {allFragments.map((frag) => (
                    <div
                      key={`${frag.questId}-${frag.type}`}
                      className="
                        bg-[#3D1F08] rounded-lg p-2 border border-[#5CBD76]/30
                        text-center
                      "
                    >
                      <p className="text-[8px] font-mono text-[#C97A3F]">Q{frag.questId}</p>
                      <p className="font-mono text-sm font-bold text-[#5CBD76]">
                        {frag.fragment}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-center font-mono text-[10px] text-[#5CBD76]">
                  ✅ {allFragments.length} {L === 'pl' ? 'fragmentów' : 'fragments'}
                </p>
              </div>

              <QuestButton
                onClick={nextTask}
                variant={allFragments.length >= 5 ? 'green' : 'red'}
                disabled={allFragments.length < 5}
              >
                {allFragments.length >= 5
                  ? L === 'pl' ? '✅ KONTYNUUJ' : '✅ CONTINUE'
                  : L === 'pl' ? '❌ ZA MAŁO FRAGMENTÓW' : '❌ NOT ENOUGH FRAGMENTS'}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 5: FINAL KEY ============ */}
        {task === 5 && (
          <QuestTaskShell
            key="t5"
            taskNumber={6}
            totalTasks={TOTAL_TASKS}
            taskType="code_input"
            title={ui.t5Title[L]}
            isActive
            isCompleted={false}
          >
            <CodeFragmentReveal
              fragment={{
                questId: 14,
                fragment: FINAL_KEY,
                type: 'key',
                discoveredAt: Date.now(),
              }}
              lang={L}
              onContinue={handleComplete}
            />
          </QuestTaskShell>
        )}
      </AnimatePresence>
    </QuestFrame>
  );
}