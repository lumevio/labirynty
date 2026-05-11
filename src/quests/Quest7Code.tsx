import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import BackRefPrompt from '../components/quest-ui/BackRefPrompt';
import MemoryLockInput from '../components/quest-ui/MemoryLockInput';
import JumpPrompt from '../components/quest-ui/JumpPrompt';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 6;
const CODE_FRAGMENT = '4821';

export default function Quest7Code({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest,
    completeTask,
    completeQuest,
    addCodeFragment,
    setMemory,
    getMemory,
    hasMemory,
    addScore,
    requestJump,
    requestBackRef,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [rowCount, setRowCount] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [markerCount, setMarkerCount] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => { initQuest(7, TOTAL_TASKS); }, []);

  const nextTask = useCallback(() => {
    completeTask(7, task);
    addScore(20);
    setTask((t) => t + 1);
    setError(false);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(7);
    addCodeFragment({
      questId: 7,
      fragment: CODE_FRAGMENT,
      type: 'digits',
      discoveredAt: Date.now(),
    });
    setMemory('q7_code', CODE_FRAGMENT, 7);
    onComplete();
  }, []);

  const ui = {
    title: { pl: 'KOD W KUKURYDZY', en: 'CORN CODE' },

    // Task 0: Observation — count corn rows
    t0Title: { pl: 'OBSERWACJA TERENU', en: 'FIELD OBSERVATION' },
    t0Desc: {
      pl: 'Ile rzędów kukurydzy widzisz bezpośrednio przy wejściu do tego sektora? Policz uważnie!',
      en: 'How many rows of corn do you see right at this sector entrance? Count carefully!',
    },
    t0Hint: { pl: '📍 ZAKRĘT LABIRYNTU — patrz w lewo', en: '📍 MAZE TURN — look left' },

    // Task 1: Symbol selection
    t1Title: { pl: 'WYBÓR SYMBOLU', en: 'SYMBOL SELECTION' },
    t1Desc: {
      pl: 'Który symbol widzisz na tabliczce nad przejściem?',
      en: 'Which symbol do you see on the sign above the passage?',
    },

    // Task 2: Physical count
    t2Title: { pl: 'LICZENIE ZNACZNIKÓW', en: 'MARKER COUNT' },
    t2Desc: {
      pl: 'Policz CZERWONE znaczniki na słupkach w tym korytarzu. Zapisz liczbę!',
      en: 'Count RED markers on the posts in this corridor. Write down the number!',
    },

    // Task 3: Back-reference to Q2
    t3Title: { pl: 'POWRÓT DO QUESTA 2', en: 'RETURN TO QUEST 2' },
    t3Desc: {
      pl: 'Wpisz 4 ostatnie cyfry kodu z tabliczki znajdującej się w LEWYM ROGU mapy Questa 2.',
      en: 'Enter the last 4 digits of the code from the sign in the LEFT CORNER of Quest 2 map.',
    },

    // Task 4: Memory lock from Q4
    t4Title: { pl: 'WERYFIKACJA PAMIĘCI', en: 'MEMORY VERIFICATION' },
    t4Desc: {
      pl: 'Który kolor występował najczęściej w Queście 4?',
      en: 'Which color appeared most frequently in Quest 4?',
    },

    // Task 5: Jump to Q11
    t5Title: { pl: 'PRZESKOK SYSTEMOWY', en: 'SYSTEM JUMP' },
    t5Desc: {
      pl: 'Przejdź fizycznie do HUB LOGICZNEGO (Quest 11) i zapisz kolejność kolorów z tabliczki przy wejściu.',
      en: 'Walk to the LOGIC HUB (Quest 11) and note the color sequence from the entrance sign.',
    },
  } as const;

  return (
    <QuestFrame title={`QUEST 7 — ${ui.title[L]}`}>
      {/* HUD */}
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>🌽 Q7</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: OBSERVATION — Count corn rows ============ */}
        <QuestTaskShell
          key="t0"
          taskNumber={1}
          totalTasks={TOTAL_TASKS}
          taskType="observation"
          title={ui.t0Title[L]}
          description={ui.t0Desc[L]}
          isActive={task === 0}
          isCompleted={task > 0}
          physicalHint={ui.t0Hint[L]}
        >
          <div className="space-y-4">
            <input
              type="number"
              inputMode="numeric"
              value={rowCount}
              onChange={(e) => setRowCount(e.target.value)}
              placeholder="0"
              className="
                w-full bg-[#1A0C03] border-2 border-[#8B4513]
                rounded-xl p-3 text-center font-mono text-2xl
                font-bold text-[#FFE27A]
                focus:outline-none focus:border-[#FFE27A]
              "
            />

            <QuestButton
              onClick={() => {
                const count = parseInt(rowCount);

                if (count >= 6 && count <= 10) {
                  setMemory('q7_row_count', rowCount, 7);
                  nextTask();
                } else {
                  setError(true);
                  setTimeout(() => setError(false), 1000);
                }
              }}
              variant="gold"
              disabled={!rowCount}
            >
              {L === 'pl' ? '✅ POTWIERDŹ' : '✅ CONFIRM'}
            </QuestButton>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center"
              >
                ❌ {L === 'pl' ? 'Policz ponownie — szukaj regularnych rzędów' : 'Count again — look for regular rows'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 1: SYMBOL SELECTION ============ */}
        <QuestTaskShell
          key="t1"
          taskNumber={2}
          totalTasks={TOTAL_TASKS}
          taskType="observation"
          title={ui.t1Title[L]}
          description={ui.t1Desc[L]}
          isActive={task === 1}
          isCompleted={task > 1}
          physicalHint={L === 'pl' ? '📍 PATRZ NA TABLICZKĘ NAD PRZEJŚCIEM' : '📍 LOOK AT THE SIGN ABOVE THE PASSAGE'}
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              { symbol: '🌽', label: 'A' },
              { symbol: '🚪', label: 'B' },
              { symbol: '🧭', label: 'C' },
            ].map(({ symbol, label }) => (
              <QuestButton
                key={label}
                onClick={() => {
                  setSelectedSymbol(label);

                  if (label === 'A') {
                    setMemory('q7_symbol', symbol, 7);
                    setTimeout(nextTask, 400);
                  } else {
                    setError(true);
                    setTimeout(() => setError(false), 800);
                  }
                }}
                variant={selectedSymbol === label ? 'gold' : 'wood'}
              >
                <span className="text-xl">{symbol}</span>
                <span className="block text-[10px] mt-1">{label}</span>
              </QuestButton>
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-400 font-mono text-center mt-3"
            >
              ❌ {L === 'pl' ? 'Sprawdź tabliczkę ponownie' : 'Check the sign again'}
            </motion.p>
          )}
        </QuestTaskShell>

        {/* ============ TASK 2: COUNT RED MARKERS ============ */}
        <QuestTaskShell
          key="t2"
          taskNumber={3}
          totalTasks={TOTAL_TASKS}
          taskType="physical"
          title={ui.t2Title[L]}
          description={ui.t2Desc[L]}
          isActive={task === 2}
          isCompleted={task > 2}
          physicalHint={L === 'pl' ? '📍 PRZEJDŹ CAŁY KORYTARZ — LICZ CZERWONE SŁUPKI' : '📍 WALK THE WHOLE CORRIDOR — COUNT RED POSTS'}
        >
          <div className="space-y-4">
            <input
              type="number"
              inputMode="numeric"
              value={markerCount}
              onChange={(e) => setMarkerCount(e.target.value)}
              placeholder="0"
              className="
                w-full bg-[#1A0C03] border-2 border-[#8B4513]
                rounded-xl p-3 text-center font-mono text-2xl
                font-bold text-[#FFE27A]
                focus:outline-none focus:border-[#FFE27A]
              "
            />

            <QuestButton
              onClick={() => {
                if (markerCount === '5') {
                  setMemory('q7_red_markers', markerCount, 7);
                  nextTask();
                } else {
                  setError(true);
                  setTimeout(() => setError(false), 1000);
                }
              }}
              variant="gold"
              disabled={!markerCount}
            >
              {L === 'pl' ? '📊 RAPORTUJ' : '📊 REPORT'}
            </QuestButton>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center"
              >
                ❌ {L === 'pl' ? 'Wróć i policz ponownie!' : 'Go back and count again!'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 3: BACK-REFERENCE TO Q2 ============ */}
        <QuestTaskShell
          key="t3"
          taskNumber={4}
          totalTasks={TOTAL_TASKS}
          taskType="backref"
          title={ui.t3Title[L]}
          description={ui.t3Desc[L]}
          isActive={task === 3}
          isCompleted={task > 3}
          physicalHint={L === 'pl' ? '📍 WRÓĆ DO STREFY NFC ALPHA (Quest 2)' : '📍 RETURN TO NFC ALPHA ZONE (Quest 2)'}
        >
          <BackRefPrompt
            targetQuest={2}
            targetTask={4}
            hint={
              L === 'pl'
                ? '4 ostatnie cyfry z tabliczki w LEWYM ROGU'
                : 'Last 4 digits from sign in LEFT CORNER'
            }
            physicalLocation={L === 'pl' ? 'STREFA NFC ALPHA — LEWY RÓG' : 'NFC ALPHA ZONE — LEFT CORNER'}
            onNavigate={() => {
              requestBackRef({
                targetQuest: 2,
                targetTask: 4,
                hint: 'Kod z lewego rogu',
                physicalLocation: 'STREFA NFC ALPHA',
              });
            }}
            onSubmitCode={(code) => {
              if (code === '4821') {
                setMemory('q7_q2_backref_code', code, 7);
                nextTask();
              }
            }}
            lang={L}
          />
        </QuestTaskShell>

        {/* ============ TASK 4: MEMORY LOCK FROM Q4 ============ */}
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
            memoryKey="q4_dominant_color"
            expectedValue="YELLOW"
            sourceQuest={4}
            hint={
              L === 'pl'
                ? 'Kolor który pojawiał się najczęściej w puzzle Quest 4'
                : 'Color that appeared most in Quest 4 puzzle'
            }
            onUnlock={() => {
              setMemory('q7_q4_color_verified', 'true', 7);
              nextTask();
            }}
            onFail={onFail}
            lang={L}
          />
        </QuestTaskShell>

        {/* ============ TASK 5: JUMP TO Q11 + CODE REVEAL ============ */}
        <QuestTaskShell
          key="t5"
          taskNumber={6}
          totalTasks={TOTAL_TASKS}
          taskType="jump"
          title={ui.t5Title[L]}
          description={ui.t5Desc[L]}
          isActive={task === 5}
          isCompleted={task > 5}
          physicalHint={L === 'pl' ? '📍 IDŹ DO HUB LOGICZNEGO (Q11)' : '📍 GO TO LOGIC HUB (Q11)'}
        >
          <div className="space-y-6">
            <JumpPrompt
              targetQuest={11}
              reason={
                L === 'pl'
                  ? 'Musisz fizycznie przejść do lokacji Quest 11 i odczytać sekwencję kolorów z tabliczki przy wejściu.'
                  : 'You must physically walk to Quest 11 location and read the color sequence from the entrance sign.'
              }
              hasRequiredMemory={true}
              onJump={() => {
                requestJump({
                  fromQuest: 7,
                  toQuest: 11,
                  reason: 'Color sequence needed',
                  returnAfter: true,
                });
                setMemory('q7_jumped_to_q11', 'true', 7);
              }}
              lang={L}
            />

            {/* Po powrocie z jumpa: Fragment reveal */}
            {hasMemory('q7_jumped_to_q11') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <CodeFragmentReveal
                  fragment={{
                    questId: 7,
                    fragment: CODE_FRAGMENT,
                    type: 'digits',
                    discoveredAt: Date.now(),
                  }}
                  lang={L}
                  onContinue={handleComplete}
                />
              </motion.div>
            )}
          </div>
        </QuestTaskShell>
      </AnimatePresence>
    </QuestFrame>
  );
}