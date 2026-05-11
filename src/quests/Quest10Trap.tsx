import { useState, useEffect, useCallback } from 'react';
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
const CODE_FRAGMENT = 'TRAP';

interface TrapChoice {
  id: number;
  label: { pl: string; en: string };
  isTrap: boolean;
  trapDesc?: { pl: string; en: string };
}

export default function Quest10Trap({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest, completeTask, completeQuest,
    addCodeFragment, setMemory,
    addScore,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [error, setError] = useState(false);
  const [greedScore, setGreedScore] = useState(0);
  const [wisdomScore, setWisdomScore] = useState(0);
  const [trapMessage, setTrapMessage] = useState<string | null>(null);

  // Task 1: Time pressure with fake urgency
  const [urgencyTime, setUrgencyTime] = useState(10);
  const [urgencyClicks, setUrgencyClicks] = useState(0);

  // Task 2: False door selection
  const [doorSelected, setDoorSelected] = useState<number | null>(null);

  // Task 3: Reverse psychology
  const [reverseChoice, setReverseChoice] = useState<string | null>(null);

  useEffect(() => { initQuest(10, TOTAL_TASKS); }, []);

  // Task 1: Urgency countdown
  useEffect(() => {
    if (task !== 1) return;

    const interval = setInterval(() => {
      setUrgencyTime((t) => {
        if (t <= 1) {
          clearInterval(interval);

          // Reward for waiting (not clicking)
          if (urgencyClicks === 0) {
            setMemory('q10_patience', 'true', 10);
            setWisdomScore((w) => w + 1);
            setTimeout(nextTask, 1000);
          } else {
            setTrapMessage(L === 'pl'
              ? 'Pułapka! Klikanie z paniki to błąd.'
              : 'Trap! Panic clicking was wrong.');
            setGreedScore((g) => g + 1);

            setTimeout(() => {
              if (greedScore >= 2) {
                onFail();
              } else {
                setTrapMessage(null);
                setUrgencyTime(10);
                setUrgencyClicks(0);
              }
            }, 2000);
          }

          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [task]);

  const nextTask = useCallback(() => {
    completeTask(10, task);
    addScore(20);
    setTask((t) => t + 1);
    setError(false);
    setTrapMessage(null);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(10);
    addCodeFragment({
      questId: 10,
      fragment: CODE_FRAGMENT,
      type: 'word',
      discoveredAt: Date.now(),
    });
    setMemory('q10_word', CODE_FRAGMENT, 10);
    setMemory('q10_wisdom', String(wisdomScore), 10);
    onComplete();
  }, [wisdomScore]);

  const trapChoices: TrapChoice[] = [
    { id: 1, label: { pl: '🎁 DARMOWA NAGRODA', en: '🎁 FREE REWARD' }, isTrap: true,
      trapDesc: { pl: 'Nic w życiu nie jest darmowe...', en: 'Nothing in life is free...' } },
    { id: 2, label: { pl: '💎 OTWÓRZ SKRZYNIĘ', en: '💎 OPEN CHEST' }, isTrap: true,
      trapDesc: { pl: 'Ciekawość zabiła kota.', en: 'Curiosity killed the cat.' } },
    { id: 3, label: { pl: '🚪 IDŹ DALEJ', en: '🚪 MOVE ON' }, isTrap: false },
    { id: 4, label: { pl: '⚡ AKTYWUJ POWER-UP', en: '⚡ ACTIVATE POWER-UP' }, isTrap: true,
      trapDesc: { pl: 'Kuszące, ale niebezpieczne.', en: 'Tempting but dangerous.' } },
  ];

  const ui = {
    title: { pl: 'STREFA PUŁAPEK', en: 'TRAP ZONE' },

    t0Title: { pl: 'TEST CHCIWOŚCI', en: 'GREED TEST' },
    t0Desc: {
      pl: 'Przed tobą cztery opcje. Tylko jedna jest bezpieczna. Pozostałe to pułapki dla chciwych.',
      en: 'Four options before you. Only one is safe. The rest are traps for the greedy.',
    },

    t1Title: { pl: 'TEST CIERPLIWOŚCI', en: 'PATIENCE TEST' },
    t1Desc: {
      pl: 'NIE klikaj! Niezależnie od tego, co Ci się wydaje, system testuje Twoją cierpliwość. Poczekaj aż czas się skończy.',
      en: 'DO NOT click! Regardless of what you think, system tests your patience. Wait until time runs out.',
    },

    t2Title: { pl: 'WYBÓR DRZWI', en: 'DOOR CHOICE' },
    t2Desc: {
      pl: 'Trzy drzwi. Każde wygląda inaczej. Wybierz mądrze. (Wskazówka: prostota wygrywa)',
      en: 'Three doors. Each looks different. Choose wisely. (Hint: simplicity wins)',
    },

    t3Title: { pl: 'PSYCHOLOGIA ODWROTNA', en: 'REVERSE PSYCHOLOGY' },
    t3Desc: {
      pl: 'System mówi: "WYBIERZ A, ABY KONTYNUOWAĆ". Czy mu wierzysz?',
      en: 'System says: "CHOOSE A TO CONTINUE". Do you trust it?',
    },

    t4Title: { pl: 'BACK-REF Q5', en: 'BACK-REF Q5' },
    t4Desc: {
      pl: 'Wpisz kod cyfrowy odkryty w Queście 5.',
      en: 'Enter the digit code discovered in Quest 5.',
    },

    t5Title: { pl: 'FINAŁOWA PUŁAPKA', en: 'FINAL TRAP' },
    t5Desc: {
      pl: 'Aby przejść, musisz NIE kliknąć żadnego przycisku przez 5 sekund.',
      en: 'To proceed, you must NOT click any button for 5 seconds.',
    },
  } as const;

  const [finalCountdown, setFinalCountdown] = useState(5);
  const [finalTriggered, setFinalTriggered] = useState(false);

  useEffect(() => {
    if (task !== 5 || finalTriggered) return;

    const interval = setInterval(() => {
      setFinalCountdown((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setMemory('q10_final_passed', 'true', 10);
          setTimeout(nextTask, 800);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [task, finalTriggered]);

  return (
    <QuestFrame title={`QUEST 10 — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>⚠️ Q10</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        <span>🧠 {wisdomScore} 💀 {greedScore}</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: GREED TEST ============ */}
        <QuestTaskShell
          key="t0"
          taskNumber={1}
          totalTasks={TOTAL_TASKS}
          taskType="question"
          title={ui.t0Title[L]}
          description={ui.t0Desc[L]}
          isActive={task === 0}
          isCompleted={task > 0}
          physicalHint={L === 'pl' ? '📍 STREFA PUŁAPEK' : '📍 TRAP ZONE'}
        >
          <div className="space-y-3">
            {trapChoices.map((choice) => (
              <QuestButton
                key={choice.id}
                onClick={() => {
                  if (choice.isTrap) {
                    const newGreed = greedScore + 1;
                    setGreedScore(newGreed);
                    setTrapMessage(choice.trapDesc?.[L] ?? '');

                    if (newGreed >= 3) {
                      setTimeout(onFail, 1500);
                    } else {
                      setTimeout(() => setTrapMessage(null), 1800);
                    }
                  } else {
                    setWisdomScore((w) => w + 1);
                    setMemory('q10_greed_passed', 'true', 10);
                    nextTask();
                  }
                }}
                variant={choice.id === 3 ? 'wood' : 'red'}
              >
                {choice.label[L]}
              </QuestButton>
            ))}

            {trapMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border-2 border-red-500/40 bg-red-500/10 p-3 text-center"
              >
                <p className="text-xs text-red-400 font-mono italic">⚠️ {trapMessage}</p>
                <p className="text-[10px] text-red-300 mt-1">
                  {L === 'pl' ? 'Pułapek' : 'Traps'}: {greedScore}/3
                </p>
              </motion.div>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 1: PATIENCE TEST ============ */}
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
              text-center bg-[#1A0C03] rounded-2xl border-2 border-red-500/40 p-6
            ">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-5xl"
              >
                {urgencyTime > 0 ? '⏳' : '✅'}
              </motion.div>

              <p className="mt-3 font-mono text-4xl font-bold text-red-400">
                {urgencyTime}
              </p>

              <p className="mt-2 font-orbitron text-[10px] text-red-400 animate-pulse tracking-widest">
                {L === 'pl' ? 'NIE KLIKAJ!' : 'DO NOT CLICK!'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <QuestButton
                onClick={() => {
                  setUrgencyClicks((c) => c + 1);
                  setTrapMessage(L === 'pl'
                    ? 'Pułapka! To było złe kliknięcie.'
                    : 'Trap! That was a wrong click.');
                  setGreedScore((g) => g + 1);

                  setTimeout(() => {
                    if (greedScore >= 2) {
                      onFail();
                    } else {
                      setTrapMessage(null);
                      setUrgencyTime(10);
                      setUrgencyClicks(0);
                    }
                  }, 1500);
                }}
                variant="red"
              >
                🚨 {L === 'pl' ? 'AKCJA NATYCHMIASTOWA' : 'IMMEDIATE ACTION'}
              </QuestButton>

              <QuestButton
                onClick={() => {
                  setUrgencyClicks((c) => c + 1);
                  setTrapMessage(L === 'pl'
                    ? 'Też pułapka!'
                    : 'Also a trap!');
                  setGreedScore((g) => g + 1);

                  setTimeout(() => {
                    if (greedScore >= 2) {
                      onFail();
                    } else {
                      setTrapMessage(null);
                      setUrgencyTime(10);
                      setUrgencyClicks(0);
                    }
                  }, 1500);
                }}
                variant="red"
              >
                ⚡ {L === 'pl' ? 'KONIECZNIE KLIKNIJ' : 'MUST CLICK NOW'}
              </QuestButton>
            </div>

            {trapMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-red-400 font-mono"
              >
                ⚠️ {trapMessage}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 2: DOOR CHOICE ============ */}
        <QuestTaskShell
          key="t2"
          taskNumber={3}
          totalTasks={TOTAL_TASKS}
          taskType="question"
          title={ui.t2Title[L]}
          description={ui.t2Desc[L]}
          isActive={task === 2}
          isCompleted={task > 2}
        >
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 1, design: '🚪✨💎', isTrap: true, label: 'A' },
              { id: 2, design: '🚪', isTrap: false, label: 'B' },
              { id: 3, design: '🚪🔥⚡', isTrap: true, label: 'C' },
            ].map((door) => (
              <motion.button
                key={door.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setDoorSelected(door.id);

                  if (!door.isTrap) {
                    setWisdomScore((w) => w + 1);
                    setMemory('q10_door_chosen', door.label, 10);
                    setTimeout(nextTask, 800);
                  } else {
                    setGreedScore((g) => g + 1);
                    setTrapMessage(L === 'pl'
                      ? 'Ozdobne drzwi to pułapka!'
                      : 'Decorated doors are traps!');

                    setTimeout(() => {
                      if (greedScore >= 2) {
                        onFail();
                      } else {
                        setTrapMessage(null);
                        setDoorSelected(null);
                      }
                    }, 1500);
                  }
                }}
                className={`
                  h-32 rounded-xl border-2 flex flex-col items-center justify-center gap-2
                  transition-all
                  ${doorSelected === door.id
                    ? door.isTrap
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-[#5CBD76] bg-[#5CBD76]/20'
                    : 'border-[#8B4513]/40 bg-[#1A0C03] hover:border-[#FFE27A]/40'
                  }
                `}
              >
                <span className="text-2xl">{door.design}</span>
                <span className="font-orbitron text-xs text-[#FFE27A]">{door.label}</span>
              </motion.button>
            ))}
          </div>

          {trapMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-center text-xs text-red-400 font-mono"
            >
              ⚠️ {trapMessage}
            </motion.p>
          )}
        </QuestTaskShell>

        {/* ============ TASK 3: REVERSE PSYCHOLOGY ============ */}
        <QuestTaskShell
          key="t3"
          taskNumber={4}
          totalTasks={TOTAL_TASKS}
          taskType="question"
          title={ui.t3Title[L]}
          description={ui.t3Desc[L]}
          isActive={task === 3}
          isCompleted={task > 3}
        >
          <div className="space-y-3">
            <div className="
              rounded-xl border-2 border-red-500/40
              bg-red-500/10 p-4 text-center
            ">
              <p className="font-orbitron text-sm font-bold text-red-400 tracking-widest animate-pulse">
                {L === 'pl' ? '⚠️ WYBIERZ A ABY KONTYNUOWAĆ' : '⚠️ CHOOSE A TO CONTINUE'}
              </p>
            </div>

            <QuestButton
              onClick={() => {
                setReverseChoice('A');
                setGreedScore((g) => g + 1);
                setTrapMessage(L === 'pl'
                  ? 'Wpadłeś w pułapkę! System kłamał.'
                  : 'You fell for the trap! System lied.');

                setTimeout(() => {
                  if (greedScore >= 2) {
                    onFail();
                  } else {
                    setTrapMessage(null);
                    setReverseChoice(null);
                  }
                }, 1800);
              }}
              variant="red"
            >
              A
            </QuestButton>

            <QuestButton
              onClick={() => {
                setReverseChoice('B');
                setWisdomScore((w) => w + 1);
                setMemory('q10_reverse_passed', 'true', 10);
                setTimeout(nextTask, 800);
              }}
              variant="gold"
            >
              B
            </QuestButton>

            {trapMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-red-400 font-mono"
              >
                ⚠️ {trapMessage}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 4: BACK-REF Q5 ============ */}
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
            memoryKey="q5_code"
            expectedValue="58"
            sourceQuest={5}
            hint={L === 'pl' ? 'Kod 2-cyfrowy z Q5' : '2-digit code from Q5'}
            onUnlock={nextTask}
            onFail={onFail}
            lang={L}
          />
        </QuestTaskShell>

        {/* ============ TASK 5: FINAL PATIENCE ============ */}
        <QuestTaskShell
          key="t5"
          taskNumber={6}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={ui.t5Title[L]}
          description={ui.t5Desc[L]}
          isActive={task === 5}
          isCompleted={task > 5}
        >
          <div className="space-y-4">
            <div className="
              text-center bg-[#1A0C03] rounded-2xl border-2 border-[#FFE27A]/40 p-6
            ">
              <span className="text-5xl">🧘</span>
              <p className="mt-3 font-mono text-5xl font-bold text-[#FFE27A]">
                {finalCountdown}
              </p>
            </div>

            <QuestButton
              onClick={() => {
                setFinalTriggered(true);
                onFail();
              }}
              variant="red"
            >
              🚫 {L === 'pl' ? 'NIE KLIKAJ' : 'DO NOT CLICK'}
            </QuestButton>
          </div>
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
              questId: 10,
              fragment: CODE_FRAGMENT,
              type: 'word',
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