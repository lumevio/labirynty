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
const CODE_FRAGMENT = '🌽';

type Path = 'explorer' | 'helper' | 'rogue';

interface Scenario {
  id: number;
  setup: { pl: string; en: string };
  choices: {
    text: { pl: string; en: string };
    type: Path;
    consequence: { pl: string; en: string };
  }[];
}

export default function Quest9Decision({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest,
    completeTask,
    completeQuest,
    addCodeFragment,
    setMemory,
    addScore,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [error, setError] = useState(false);
  const [path, setPath] = useState<Path[]>([]);
  const [showConsequence, setShowConsequence] = useState<string | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  const scenarios: Scenario[] = [
    {
      id: 1,
      setup: {
        pl: 'Spotykasz innego gracza zagubionego w labiryncie. Wygląda na zmęczonego.',
        en: 'You meet another player lost in the maze. They look exhausted.',
      },
      choices: [
        {
          text: { pl: '🚶 Pomóż mu znaleźć drogę', en: '🚶 Help them find the way' },
          type: 'helper',
          consequence: {
            pl: 'Twoja dobroć została zapamiętana...',
            en: 'Your kindness was remembered...',
          },
        },
        {
          text: { pl: '🧭 Daj mu wskazówkę i idź dalej', en: '🧭 Give a hint and move on' },
          type: 'explorer',
          consequence: {
            pl: 'Praktyczne podejście. Czas to złoto.',
            en: 'Practical approach. Time is gold.',
          },
        },
        {
          text: { pl: '🚪 Zignoruj go', en: '🚪 Ignore them' },
          type: 'rogue',
          consequence: {
            pl: 'Labirynt zapamiętał Twoją obojętność...',
            en: 'The maze noted your indifference...',
          },
        },
      ],
    },
    {
      id: 2,
      setup: {
        pl: 'Znajdujesz tabliczkę z kodem, którą ktoś zostawił. Co robisz?',
        en: 'You find a sign with a code someone left. What do you do?',
      },
      choices: [
        {
          text: { pl: '📋 Przepisz i zostaw na miejscu', en: '📋 Copy and leave it' },
          type: 'helper',
          consequence: {
            pl: 'Inni gracze też skorzystają.',
            en: 'Other players will benefit too.',
          },
        },
        {
          text: { pl: '🔍 Przepisz i przemieszaj literki', en: '🔍 Copy and scramble it' },
          type: 'explorer',
          consequence: {
            pl: 'Sprytne, ale podstępne...',
            en: 'Clever, but sneaky...',
          },
        },
        {
          text: { pl: '🗑️ Zniszcz tabliczkę', en: '🗑️ Destroy the sign' },
          type: 'rogue',
          consequence: {
            pl: 'Sabotaż został odnotowany!',
            en: 'Sabotage was noted!',
          },
        },
      ],
    },
    {
      id: 3,
      setup: {
        pl: 'Odkrywasz tajne przejście, ale prowadzi przez zamknięty teren.',
        en: 'You discover a secret passage, but it leads through restricted area.',
      },
      choices: [
        {
          text: { pl: '🚷 Zawróć i znajdź legalną drogę', en: '🚷 Turn back, find legal way' },
          type: 'helper',
          consequence: {
            pl: 'Cierpliwość się opłaca.',
            en: 'Patience pays off.',
          },
        },
        {
          text: { pl: '👀 Sprawdź czy nikt nie patrzy i przejdź', en: '👀 Check no one watches, go through' },
          type: 'explorer',
          consequence: {
            pl: 'Ryzyko czasem się opłaca...',
            en: 'Risk sometimes pays off...',
          },
        },
        {
          text: { pl: '🏃 Po prostu wbiegnij', en: '🏃 Just run through' },
          type: 'rogue',
          consequence: {
            pl: 'Brak szacunku dla zasad!',
            en: 'Disregard for rules!',
          },
        },
      ],
    },
  ];

  useEffect(() => {
    initQuest(9, TOTAL_TASKS);
  }, []);

  const nextTask = useCallback(() => {
    completeTask(9, task);
    addScore(20);
    setTask((t) => t + 1);
    setError(false);
    setShowConsequence(null);
  }, [task]);

  const handleComplete = useCallback(() => {
    const finalPath = path.reduce(
      (acc, p) => ({ ...acc, [p]: (acc[p] || 0) + 1 }),
      {} as Record<Path, number>
    );

    let alignment: 'good' | 'neutral' | 'evil' = 'neutral';

    if ((finalPath.helper || 0) >= 2) alignment = 'good';
    else if ((finalPath.rogue || 0) >= 2) alignment = 'evil';

    completeQuest(9);

    addCodeFragment({
      questId: 9,
      fragment: CODE_FRAGMENT,
      type: 'symbol',
      discoveredAt: Date.now(),
    });

    setMemory('q9_alignment', alignment, 9);
    setMemory('q9_path', path.join(','), 9);
    onComplete();
  }, [path]);

  const choose = (choiceType: Path) => {
    if (showConsequence) return;

    const scenario = scenarios[scenarioIndex];
    const choice = scenario.choices.find((c) => c.type === choiceType);

    if (!choice) return;

    const newPath = [...path, choiceType];
    setPath(newPath);
    setShowConsequence(choice.consequence[L]);

    const rogueCount = newPath.filter((p) => p === 'rogue').length;

    if (rogueCount >= 3) {
      setTimeout(() => {
        onFail();
      }, 2000);
      return;
    }

    setTimeout(() => {
      if (scenarioIndex >= scenarios.length - 1) {
        nextTask();
      } else {
        setScenarioIndex((i) => i + 1);
        setShowConsequence(null);
      }
    }, 2500);
  };

  const ui = {
    title: { pl: 'ŚCIEŻKA PRZEZNACZENIA', en: 'PATH OF FATE' },

    t0Title: { pl: 'BACK-REF: Q3 + Q6', en: 'BACK-REF: Q3 + Q6' },
    t0Desc: {
      pl: 'Aby aktywować ścieżkę, potrzebne są dane z Quest 3 i Quest 6. Wpisz kombinację: SŁOWO_Q3 + KOLOR_Q6',
      en: 'To activate path, data from Quest 3 and Quest 6 are needed. Enter combination: WORD_Q3 + COLOR_Q6',
    },

    t1Title: { pl: 'WYBÓR PIERWSZY', en: 'FIRST CHOICE' },
    t2Title: { pl: 'WYBÓR DRUGI', en: 'SECOND CHOICE' },
    t3Title: { pl: 'WYBÓR TRZECI', en: 'THIRD CHOICE' },

    t4Title: { pl: 'ANALIZA WYBORÓW', en: 'CHOICE ANALYSIS' },
    t4Desc: {
      pl: 'System analizuje Twoje decyzje. Twoja ścieżka kształtuje finał gry.',
      en: 'System analyzes your decisions. Your path shapes the game ending.',
    },

    t5Title: { pl: 'WERYFIKACJA TOŻSAMOŚCI', en: 'IDENTITY VERIFICATION' },
    t5Desc: {
      pl: 'Wpisz słowo, które najlepiej opisuje Twoje wybory. (HELPER, EXPLORER, ROGUE)',
      en: 'Enter the word that best describes your choices. (HELPER, EXPLORER, ROGUE)',
    },

    t6Title: { pl: 'FRAGMENT ODKRYTY', en: 'FRAGMENT DISCOVERED' },
  } as const;

  const taskTitles = [ui.t1Title[L], ui.t2Title[L], ui.t3Title[L]];

  return (
    <QuestFrame title={`QUEST 9 — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>🧭 Q9</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        <span>📜 {path.join('-') || '...'}</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: BACK-REF MEMORY LOCK ============ */}
        {task === 0 && (
          <QuestTaskShell
            key="t0"
            taskNumber={1}
            totalTasks={TOTAL_TASKS}
            taskType="memory_lock"
            title={ui.t0Title[L]}
            description={ui.t0Desc[L]}
            isActive
            isCompleted={false}
          >
            <MemoryLockInput
              memoryKey="q9_combined"
              expectedValue="CORNBLUE"
              sourceQuest={3}
              hint={
                L === 'pl'
                  ? 'Słowo z Q3 (CORN) + kolor z Q6 (BLUE) bez spacji'
                  : 'Word from Q3 (CORN) + color from Q6 (BLUE) no spaces'
              }
              onUnlock={nextTask}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASKS 1-3: SCENARIOS ============ */}
        {(task === 1 || task === 2 || task === 3) && (
          <QuestTaskShell
            key={`scenario-${task}`}
            taskNumber={task + 1}
            totalTasks={TOTAL_TASKS}
            taskType="question"
            title={taskTitles[task - 1]}
            description={scenarios[scenarioIndex]?.setup[L]}
            isActive
            isCompleted={false}
            physicalHint={L === 'pl' ? '📍 ROZWIDLENIE ZACHODNIE' : '📍 WEST FORK'}
          >
            <div className="space-y-3">
              {!showConsequence && scenarios[scenarioIndex] ? (
                scenarios[scenarioIndex].choices.map((choice) => (
                  <QuestButton
                    key={choice.type}
                    onClick={() => choose(choice.type)}
                    variant={
                      choice.type === 'helper'
                        ? 'green'
                        : choice.type === 'explorer'
                          ? 'gold'
                          : 'red'
                    }
                  >
                    {choice.text[L]}
                  </QuestButton>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    rounded-xl border-2 border-[#FFE27A]/40
                    bg-[#3D2A00]/40 p-4 text-center
                  "
                >
                  <span className="text-3xl">⚖️</span>
                  <p className="mt-2 font-mono text-xs text-[#FFE27A]/80 italic">
                    "{showConsequence}"
                  </p>
                </motion.div>
              )}
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 4: ANALYSIS ============ */}
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
              {(['helper', 'explorer', 'rogue'] as Path[]).map((p) => {
                const count = path.filter((c) => c === p).length;
                const percentage = path.length > 0 ? (count / path.length) * 100 : 0;

                return (
                  <div key={p} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span
                        className={
                          p === 'helper'
                            ? 'text-[#5CBD76]'
                            : p === 'explorer'
                              ? 'text-[#FFE27A]'
                              : 'text-red-400'
                        }
                      >
                        {p.toUpperCase()}
                      </span>
                      <span className="text-[#C97A3F]">{count}/3</span>
                    </div>

                    <div className="h-2 bg-[#1A0C03] rounded-full overflow-hidden border border-[#3D1F08]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full ${
                          p === 'helper'
                            ? 'bg-[#5CBD76]'
                            : p === 'explorer'
                              ? 'bg-[#FFE27A]'
                              : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}

              <QuestButton onClick={nextTask} variant="gold">
                📊 {L === 'pl' ? 'KONTYNUUJ' : 'CONTINUE'}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 5: IDENTITY VERIFICATION ============ */}
        {task === 5 && (
          <QuestTaskShell
            key="t5"
            taskNumber={6}
            totalTasks={TOTAL_TASKS}
            taskType="code_input"
            title={ui.t5Title[L]}
            description={ui.t5Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-3">
              {(['HELPER', 'EXPLORER', 'ROGUE'] as const).map((identity) => {
                const dominantPath = path.reduce(
                  (acc, p) => ({ ...acc, [p]: (acc[p] || 0) + 1 }),
                  {} as Record<string, number>
                );

                const playerIdentity = Object.entries(dominantPath).reduce(
                  (a, b) => (a[1] > b[1] ? a : b),
                  ['neutral', 0]
                )[0].toUpperCase();

                return (
                  <QuestButton
                    key={identity}
                    onClick={() => {
                      if (identity === playerIdentity) {
                        setMemory('q9_identity', identity, 9);
                        nextTask();
                      } else {
                        setError(true);
                        setTimeout(() => setError(false), 1000);
                      }
                    }}
                    variant={
                      identity === 'HELPER'
                        ? 'green'
                        : identity === 'EXPLORER'
                          ? 'gold'
                          : 'red'
                    }
                  >
                    {identity === 'HELPER' && '😇 '}
                    {identity === 'EXPLORER' && '🧭 '}
                    {identity === 'ROGUE' && '😈 '}
                    {identity}
                  </QuestButton>
                );
              })}

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-400 font-mono text-center"
                >
                  ❌ {L === 'pl' ? 'Sprawdź swoje wybory ponownie' : 'Review your choices'}
                </motion.p>
              )}
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 6: FRAGMENT REVEAL ============ */}
        {task === 6 && (
          <QuestTaskShell
            key="t6"
            taskNumber={7}
            totalTasks={TOTAL_TASKS}
            taskType="code_input"
            title={ui.t6Title[L]}
            isActive
            isCompleted={false}
          >
            <CodeFragmentReveal
              fragment={{
                questId: 9,
                fragment: CODE_FRAGMENT,
                type: 'symbol',
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