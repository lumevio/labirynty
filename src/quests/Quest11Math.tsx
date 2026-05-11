import { useState, useEffect, useCallback, useMemo } from 'react';
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

const TOTAL_TASKS = 8;
const CODE_FRAGMENT_DIGITS = '99';
const CODE_FRAGMENT_COLOR = 'GREEN';

export default function Quest11Math({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest, completeTask, completeQuest,
    addCodeFragment, setMemory, getMemory,
    addScore, requestBackRef, requestJump,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [error, setError] = useState(false);

  // Task 0: Math chain (3 problems in sequence)
  const [mathStep, setMathStep] = useState(0);
  const [mathInput, setMathInput] = useState('');
  const [mathHistory, setMathHistory] = useState<number[]>([]);

  // Task 1: Logic gates puzzle
  const [logicInputs, setLogicInputs] = useState({ A: false, B: false, C: false });

  // Task 2: Boolean equation
  const [booleanInput, setBooleanInput] = useState('');

  // Task 3: Number sorting
  const [sortNumbers, setSortNumbers] = useState<number[]>([7, 2, 9, 4, 1, 8, 5]);
  const [sortSelected, setSortSelected] = useState<number | null>(null);

  // Task 4: Equation builder
  const [equationParts, setEquationParts] = useState<string[]>([]);
  const equationTarget = 42;

  const mathProblems = [
    { question: '7 × 8 + 12 − 4', answer: 64 },
    { question: '(15 + 9) ÷ 3 × 2', answer: 16 },
    { question: '√144 + 2³ − 5', answer: 15 },
  ];

  useEffect(() => { initQuest(11, TOTAL_TASKS); }, []);

  const nextTask = useCallback(() => {
    completeTask(11, task);
    addScore(30);
    setTask((t) => t + 1);
    setError(false);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(11);

    addCodeFragment({
      questId: 11,
      fragment: CODE_FRAGMENT_DIGITS,
      type: 'digits',
      discoveredAt: Date.now(),
    });

    addCodeFragment({
      questId: 11,
      fragment: CODE_FRAGMENT_COLOR,
      type: 'color',
      discoveredAt: Date.now(),
    });

    setMemory('q11_digits', CODE_FRAGMENT_DIGITS, 11);
    setMemory('q11_color', CODE_FRAGMENT_COLOR, 11);

    onComplete();
  }, []);

  const ui = {
    title: { pl: 'HUB LOGICZNY', en: 'LOGIC HUB' },

    t0Title: { pl: 'ŁAŃCUCH OBLICZEŃ', en: 'CALCULATION CHAIN' },
    t0Desc: {
      pl: 'Trzy problemy matematyczne. Każdy musisz rozwiązać poprawnie.',
      en: 'Three math problems. Each must be solved correctly.',
    },

    t1Title: { pl: 'BRAMKI LOGICZNE', en: 'LOGIC GATES' },
    t1Desc: {
      pl: 'Ustaw wejścia A, B, C aby wynik (A AND B) OR C = TRUE.',
      en: 'Set inputs A, B, C so result (A AND B) OR C = TRUE.',
    },

    t2Title: { pl: 'WYRAŻENIE BOOLOWSKIE', en: 'BOOLEAN EXPRESSION' },
    t2Desc: {
      pl: 'Ile będzie wyników TRUE w tabeli prawdy dla: NOT(A) AND (B OR C)?',
      en: 'How many TRUE results in truth table for: NOT(A) AND (B OR C)?',
    },

    t3Title: { pl: 'SORTOWANIE BLISKICH', en: 'NEAREST SORT' },
    t3Desc: {
      pl: 'Klikaj liczby w kolejności RObsnąco. Tylko sąsiednie zamiany dozwolone.',
      en: 'Click numbers in DESCENDING order. Only adjacent swaps allowed.',
    },

    t4Title: { pl: 'BUDOWANIE RÓWNANIA', en: 'EQUATION BUILDER' },
    t4Desc: {
      pl: `Zbuduj równanie używając cyfr i operatorów, aby wynik = ${equationTarget}.`,
      en: `Build an equation using digits and operators so result = ${equationTarget}.`,
    },

    t5Title: { pl: 'BACK-REF Q6 + Q7', en: 'BACK-REF Q6 + Q7' },
    t5Desc: {
      pl: 'Wpisz: czas reakcji z Q6 + liczba znaczników z Q7 (oddzielone myślnikiem).',
      en: 'Enter: reaction time from Q6 + marker count from Q7 (separated by dash).',
    },

    t6Title: { pl: 'PRZESKOK DO Q13', en: 'JUMP TO Q13' },
    t6Desc: {
      pl: 'Wszystkie obliczenia wykonane. Otwarł się dostęp do KORYTARZA FINALNEGO.',
      en: 'All calculations done. Access to FINAL CORRIDOR opened.',
    },

    t7Title: { pl: 'FRAGMENTY ODKRYTE', en: 'FRAGMENTS DISCOVERED' },
  } as const;

  return (
    <QuestFrame title={`QUEST 11 — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>🧮 Q11</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        {task === 0 && <span>STEP {mathStep + 1}/3</span>}
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: MATH CHAIN ============ */}
        <QuestTaskShell
          key="t0"
          taskNumber={1}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={ui.t0Title[L]}
          description={ui.t0Desc[L]}
          isActive={task === 0}
          isCompleted={task > 0}
          physicalHint={L === 'pl' ? '📍 HUB LOGICZNY — TERMINAL CENTRALNY' : '📍 LOGIC HUB — CENTRAL TERMINAL'}
        >
          <div className="space-y-4">
            <div className="
              bg-[#1A0C03] rounded-2xl border-2 border-[#FFE27A]/40 p-4 text-center
            ">
              <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest mb-2">
                {L === 'pl' ? `PROBLEM ${mathStep + 1}/3` : `PROBLEM ${mathStep + 1}/3`}
              </p>
              <p className="font-mono text-2xl font-bold text-[#FFE27A] tracking-wider">
                {mathProblems[mathStep].question} = ?
              </p>
            </div>

            <input
              type="number"
              inputMode="numeric"
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
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
                if (parseInt(mathInput) === mathProblems[mathStep].answer) {
                  setMathHistory((prev) => [...prev, parseInt(mathInput)]);
                  setMathInput('');

                  if (mathStep >= 2) {
                    setMemory('q11_math_completed', 'true', 11);
                    nextTask();
                  } else {
                    setMathStep((s) => s + 1);
                  }
                } else {
                  setError(true);
                  setTimeout(() => setError(false), 1000);
                }
              }}
              variant="gold"
              disabled={!mathInput}
            >
              ✅ {L === 'pl' ? 'OBLICZ' : 'COMPUTE'}
            </QuestButton>

            {mathHistory.length > 0 && (
              <div className="bg-[#1A0C03]/60 rounded-lg p-2 border border-[#8B4513]/30">
                <p className="text-[9px] font-mono text-[#5CBD76] text-center">
                  ✅ {L === 'pl' ? 'Historia' : 'History'}: {mathHistory.join(' → ')}
                </p>
              </div>
            )}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Nieprawidłowy wynik!' : 'Wrong answer!'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 1: LOGIC GATES ============ */}
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
              bg-[#1A0C03] rounded-xl border-2 border-[#FFE27A]/40 p-4 text-center
            ">
              <p className="font-mono text-sm text-[#FFE27A] tracking-wider">
                (A AND B) OR C = ?
              </p>

              <p className="mt-3 font-mono text-3xl font-bold">
                {(() => {
                  const result = (logicInputs.A && logicInputs.B) || logicInputs.C;
                  return (
                    <span className={result ? 'text-[#5CBD76]' : 'text-red-400'}>
                      {result ? 'TRUE' : 'FALSE'}
                    </span>
                  );
                })()}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(['A', 'B', 'C'] as const).map((key) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setLogicInputs((prev) => ({ ...prev, [key]: !prev[key] }));
                  }}
                  className={`
                    h-20 rounded-xl border-2 flex flex-col items-center justify-center
                    transition-all
                    ${logicInputs[key]
                      ? 'border-[#5CBD76] bg-[#5CBD76]/20'
                      : 'border-red-500 bg-red-500/10'
                    }
                  `}
                >
                  <span className="font-orbitron text-2xl font-bold text-[#FFE27A]">
                    {key}
                  </span>
                  <span className={`font-mono text-xs mt-1 ${
                    logicInputs[key] ? 'text-[#5CBD76]' : 'text-red-400'
                  }`}>
                    {logicInputs[key] ? 'TRUE' : 'FALSE'}
                  </span>
                </motion.button>
              ))}
            </div>

            <QuestButton
              onClick={() => {
                const result = (logicInputs.A && logicInputs.B) || logicInputs.C;
                if (result) {
                  setMemory('q11_logic_solved', 'true', 11);
                  nextTask();
                } else {
                  setError(true);
                  setTimeout(() => setError(false), 1000);
                }
              }}
              variant="gold"
            >
              🔌 {L === 'pl' ? 'AKTYWUJ OBWÓD' : 'ACTIVATE CIRCUIT'}
            </QuestButton>
          </div>
        </QuestTaskShell>

        {/* ============ TASK 2: BOOLEAN COUNT ============ */}
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
              bg-[#1A0C03] rounded-xl border-2 border-[#FFE27A]/40 p-3
            ">
              <p className="text-center font-mono text-sm text-[#FFE27A] mb-3">
                NOT(A) AND (B OR C)
              </p>

              <table className="w-full font-mono text-[10px]">
                <thead>
                  <tr className="text-[#C97A3F] border-b border-[#8B4513]/30">
                    <th className="py-1">A</th><th>B</th><th>C</th><th>RESULT</th>
                  </tr>
                </thead>
                <tbody>
                  {[0,1,2,3,4,5,6,7].map((n) => {
                    const A = (n & 4) > 0;
                    const B = (n & 2) > 0;
                    const C = (n & 1) > 0;
                    const result = !A && (B || C);

                    return (
                      <tr key={n} className="text-[#FFE27A]/60">
                        <td className="text-center">{A ? 'T' : 'F'}</td>
                        <td className="text-center">{B ? 'T' : 'F'}</td>
                        <td className="text-center">{C ? 'T' : 'F'}</td>
                        <td className={`text-center font-bold ${
                          result ? 'text-[#5CBD76]' : 'text-red-400'
                        }`}>
                          {result ? 'T' : 'F'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <input
              type="number"
              value={booleanInput}
              onChange={(e) => setBooleanInput(e.target.value)}
              placeholder="?"
              className="
                w-full bg-[#1A0C03] border-2 border-[#8B4513]
                rounded-xl p-3 text-center font-mono text-2xl
                font-bold text-[#FFE27A]
                focus:outline-none focus:border-[#FFE27A]
              "
            />

            <QuestButton
              onClick={() => {
                if (booleanInput === '3') {
                  setMemory('q11_boolean', '3', 11);
                  nextTask();
                } else {
                  setError(true);
                  setTimeout(() => setError(false), 1000);
                }
              }}
              variant="gold"
              disabled={!booleanInput}
            >
              ✅ {L === 'pl' ? 'POLICZ' : 'COUNT'}
            </QuestButton>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Sprawdź tabelę ponownie' : 'Check table again'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 3: SORTING ============ */}
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
            <div className="flex justify-center gap-1.5 flex-wrap">
              {sortNumbers.map((n, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (sortSelected === null) {
                      setSortSelected(i);
                    } else {
                      // Only adjacent swap
                      if (Math.abs(sortSelected - i) === 1) {
                        const newArr = [...sortNumbers];
                        [newArr[sortSelected], newArr[i]] = [newArr[i], newArr[sortSelected]];
                        setSortNumbers(newArr);

                        // Check sorted descending
                        const sorted = newArr.every((v, idx) =>
                          idx === 0 || newArr[idx - 1] >= v
                        );

                        if (sorted) {
                          setMemory('q11_sorted', 'true', 11);
                          setTimeout(nextTask, 600);
                        }
                      }
                      setSortSelected(null);
                    }
                  }}
                  className={`
                    w-10 h-12 rounded-lg border-2 font-mono text-lg font-bold
                    transition-all
                    ${sortSelected === i
                      ? 'border-[#FFE27A] bg-[#FFE27A]/30 text-[#FFE27A]'
                      : 'border-[#8B4513]/40 bg-[#1A0C03] text-[#FFE27A]/70'
                    }
                  `}
                >
                  {n}
                </motion.button>
              ))}
            </div>

            <p className="text-center text-[10px] font-mono text-[#C97A3F]">
              {L === 'pl'
                ? '💡 Cel: 9 8 7 5 4 2 1 (malejąco)'
                : '💡 Goal: 9 8 7 5 4 2 1 (descending)'}
            </p>
          </div>
        </QuestTaskShell>

        {/* ============ TASK 4: EQUATION BUILDER ============ */}
        <QuestTaskShell
          key="t4"
          taskNumber={5}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={ui.t4Title[L]}
          description={ui.t4Desc[L]}
          isActive={task === 4}
          isCompleted={task > 4}
        >
          <div className="space-y-4">
            <div className="
              bg-[#1A0C03] rounded-xl border-2 border-[#FFE27A]/40 p-4 text-center min-h-[60px]
            ">
              <p className="font-mono text-2xl font-bold text-[#FFE27A] tracking-wider">
                {equationParts.join(' ') || '?'}
                {' = ?'}
              </p>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {['1','2','3','4','5','6','7','8','9','0','+','-','×','÷','('].map((char) => (
                <motion.button
                  key={char}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEquationParts((prev) => [...prev, char])}
                  className="
                    h-10 rounded-lg border border-[#8B4513]/50 bg-[#1A0C03]
                    font-mono text-sm font-bold text-[#FFE27A] active:bg-[#FFE27A]/20
                  "
                >
                  {char}
                </motion.button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <QuestButton
                onClick={() => setEquationParts([])}
                variant="red"
              >
                ↩ {L === 'pl' ? 'WYCZYŚĆ' : 'CLEAR'}
              </QuestButton>

              <QuestButton
                onClick={() => {
                  try {
                    const expr = equationParts
                      .join('')
                      .replace(/×/g, '*')
                      .replace(/÷/g, '/');
                    const result = Function(`return (${expr})`)();

                    if (result === equationTarget) {
                      setMemory('q11_equation', expr, 11);
                      nextTask();
                    } else {
                      setError(true);
                      setTimeout(() => setError(false), 1000);
                    }
                  } catch {
                    setError(true);
                    setTimeout(() => setError(false), 1000);
                  }
                }}
                variant="gold"
                disabled={equationParts.length < 3}
              >
                ⚡ {L === 'pl' ? 'OBLICZ' : 'CALCULATE'}
              </QuestButton>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? `Wynik ≠ ${equationTarget}` : `Result ≠ ${equationTarget}`}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 5: BACK-REF Q6 + Q7 ============ */}
        <QuestTaskShell
          key="t5"
          taskNumber={6}
          totalTasks={TOTAL_TASKS}
          taskType="backref"
          title={ui.t5Title[L]}
          description={ui.t5Desc[L]}
          isActive={task === 5}
          isCompleted={task > 5}
        >
          <BackRefPrompt
            targetQuest={6}
            targetTask={1}
            hint={L === 'pl'
              ? 'Format: <czas_reakcji>-<liczba_znaczników> (np. 450-5)'
              : 'Format: <reaction_time>-<marker_count> (e.g. 450-5)'}
            physicalLocation={L === 'pl' ? 'WSPOMNIJ Q6 + Q7' : 'RECALL Q6 + Q7'}
            onNavigate={() => {
              requestBackRef({
                targetQuest: 6,
                targetTask: 1,
                hint: 'Combined data',
              });
            }}
            onSubmitCode={(code) => {
              const reaction = getMemory('q6_avg_reaction');
              const markers = getMemory('q7_red_markers');
              const expected = `${reaction}-${markers}`;

              if (code === expected) {
                setMemory('q11_combined_verified', 'true', 11);
                nextTask();
              }
            }}
            lang={L}
          />
        </QuestTaskShell>

        {/* ============ TASK 6: JUMP TO Q13 ============ */}
        <QuestTaskShell
          key="t6"
          taskNumber={7}
          totalTasks={TOTAL_TASKS}
          taskType="jump"
          title={ui.t6Title[L]}
          description={ui.t6Desc[L]}
          isActive={task === 6}
          isCompleted={task > 6}
          physicalHint={L === 'pl' ? '📍 IDŹ DO KORYTARZA FINALNEGO (Q13)' : '📍 GO TO FINAL CORRIDOR (Q13)'}
        >
          <JumpPrompt
            targetQuest={13}
            reason={L === 'pl'
              ? 'Hub logiczny obliczył ścieżkę. Korytarz finałowy jest teraz dostępny.'
              : 'Logic hub computed path. Final corridor is now accessible.'}
            hasRequiredMemory={true}
            onJump={() => {
              requestJump({
                fromQuest: 11,
                toQuest: 13,
                reason: 'Logic computed path',
                returnAfter: false,
              });
              nextTask();
            }}
            lang={L}
          />
        </QuestTaskShell>

        {/* ============ TASK 7: FRAGMENTS REVEAL (2x) ============ */}
        <QuestTaskShell
          key="t7"
          taskNumber={8}
          totalTasks={TOTAL_TASKS}
          taskType="code_input"
          title={ui.t7Title[L]}
          isActive={task === 7}
          isCompleted={task > 7}
        >
          <div className="space-y-4">
            <CodeFragmentReveal
              fragment={{
                questId: 11,
                fragment: CODE_FRAGMENT_DIGITS,
                type: 'digits',
                discoveredAt: Date.now(),
              }}
              lang={L}
              onContinue={() => {}}
            />

            <CodeFragmentReveal
              fragment={{
                questId: 11,
                fragment: CODE_FRAGMENT_COLOR,
                type: 'color',
                discoveredAt: Date.now(),
              }}
              lang={L}
              onContinue={handleComplete}
            />
          </div>
        </QuestTaskShell>
      </AnimatePresence>
    </QuestFrame>
  );
}