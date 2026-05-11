import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import MemoryLockInput from '../components/quest-ui/MemoryLockInput';
import JumpPrompt from '../components/quest-ui/JumpPrompt';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 6;
const CODE_FRAGMENT_COLOR = 'BLUE';

type ReactionStage = 'waiting' | 'ready' | 'tooEarly' | 'success' | 'tooLate';
type Target = { id: number; x: number; y: number; type: 'good' | 'bad'; spawnTime: number };

export default function Quest6Speed({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest, completeTask, completeQuest,
    addCodeFragment, setMemory,
    addScore, requestJump, hasMemory,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [error, setError] = useState(false);

  // Task 0: Multi-round reaction test
  const [reactionRound, setReactionRound] = useState(1);
  const [reactionStage, setReactionStage] = useState<ReactionStage>('waiting');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const reactionStartRef = useRef(0);
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Task 1: Whack-a-mole (target hunting)
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetScore, setTargetScore] = useState(0);
  const [targetMissed, setTargetMissed] = useState(0);
  const [targetGameActive, setTargetGameActive] = useState(false);
  const [targetTimeLeft, setTargetTimeLeft] = useState(20);

  // Task 2: Sequence speed input
  const [seqRound, setSeqRound] = useState(1);
  const [seqDisplay, setSeqDisplay] = useState<number[]>([]);
  const [seqInput, setSeqInput] = useState<number[]>([]);
  const [seqPhase, setSeqPhase] = useState<'show' | 'input'>('show');
  const [seqTimeLimit, setSeqTimeLimit] = useState(0);
  const [seqStartTime, setSeqStartTime] = useState(0);

  // Task 3: Color matching speed
  const [colorTarget, setColorTarget] = useState<string>('');
  const [colorChoices, setColorChoices] = useState<string[]>([]);
  const [colorRound, setColorRound] = useState(1);
  const [colorScore, setColorScore] = useState(0);
  const [colorTimeLeft, setColorTimeLeft] = useState(2);

  useEffect(() => { initQuest(6, TOTAL_TASKS); }, []);

  // ================ TASK 0: REACTION TEST ================
  useEffect(() => {
    if (task === 0 && reactionStage === 'waiting' && reactionRound <= 3) {
      const delay = 2000 + Math.random() * 4000;

      reactionTimerRef.current = setTimeout(() => {
        setReactionStage('ready');
        reactionStartRef.current = Date.now();

        // Auto-fail after 1.5s
        reactionTimerRef.current = setTimeout(() => {
          setReactionStage('tooLate');

          setTimeout(() => {
            if (reactionRound >= 3) {
              const avg = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
              if (avg < 800) {
                setMemory('q6_avg_reaction', String(Math.round(avg)), 6);
                nextTask();
              } else {
                onFail();
              }
            } else {
              setReactionRound((r) => r + 1);
              setReactionStage('waiting');
            }
          }, 1200);
        }, 1500);
      }, delay);
    }

    return () => {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    };
  }, [task, reactionStage, reactionRound]);

  // ================ TASK 1: WHACK-A-MOLE ================
  useEffect(() => {
    if (task !== 1 || !targetGameActive) return;

    const spawn = setInterval(() => {
      const newTarget: Target = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 15,
        type: Math.random() > 0.25 ? 'good' : 'bad',
        spawnTime: Date.now(),
      };

      setTargets((prev) => [...prev, newTarget]);

      // Auto-remove after 1.2s
      setTimeout(() => {
        setTargets((prev) => {
          const removed = prev.find((t) => t.id === newTarget.id);

          if (removed && removed.type === 'good') {
            setTargetMissed((m) => m + 1);
          }

          return prev.filter((t) => t.id !== newTarget.id);
        });
      }, 1200);
    }, 700);

    const countdown = setInterval(() => {
      setTargetTimeLeft((t) => {
        if (t <= 1) {
          setTargetGameActive(false);
          clearInterval(spawn);
          clearInterval(countdown);

          setTimeout(() => {
            if (targetScore >= 8 && targetMissed <= 4) {
              setMemory('q6_target_score', String(targetScore), 6);
              nextTask();
            } else {
              onFail();
            }
          }, 800);

          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawn);
      clearInterval(countdown);
    };
  }, [task, targetGameActive]);

  // ================ TASK 2: SEQUENCE INPUT ================
  useEffect(() => {
    if (task !== 2) return;
    startSequenceRound(1);
  }, [task]);

  // ================ TASK 3: COLOR MATCH ================
  useEffect(() => {
    if (task !== 3) return;
    startColorRound();
  }, [task]);

  useEffect(() => {
    if (task !== 3 || colorTimeLeft <= 0) return;

    const timer = setTimeout(() => {
      setColorTimeLeft((t) => t - 0.1);
    }, 100);

    return () => clearTimeout(timer);
  }, [task, colorTimeLeft]);

  useEffect(() => {
    if (task !== 3) return;

    if (colorTimeLeft <= 0) {
      onFail();
    }
  }, [colorTimeLeft, task]);

  const nextTask = useCallback(() => {
    completeTask(6, task);
    addScore(25);
    setTask((t) => t + 1);
    setError(false);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(6);
    addCodeFragment({
      questId: 6,
      fragment: CODE_FRAGMENT_COLOR,
      type: 'color',
      discoveredAt: Date.now(),
    });
    setMemory('q6_color', CODE_FRAGMENT_COLOR, 6);
    onComplete();
  }, []);

  const handleReactionClick = () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);

    if (reactionStage === 'waiting') {
      setReactionStage('tooEarly');

      setTimeout(() => {
        if (reactionRound >= 3) {
          onFail();
        } else {
          setReactionRound((r) => r + 1);
          setReactionStage('waiting');
        }
      }, 1200);
      return;
    }

    if (reactionStage === 'ready') {
      const time = Date.now() - reactionStartRef.current;
      setReactionTimes((prev) => [...prev, time]);
      setReactionStage('success');

      setTimeout(() => {
        if (reactionRound >= 3) {
          const avg = [...reactionTimes, time].reduce((a, b) => a + b, 0) / 3;
          if (avg < 800) {
            setMemory('q6_avg_reaction', String(Math.round(avg)), 6);
            nextTask();
          } else {
            onFail();
          }
        } else {
          setReactionRound((r) => r + 1);
          setReactionStage('waiting');
        }
      }, 1000);
    }
  };

  const handleTargetClick = (target: Target) => {
    setTargets((prev) => prev.filter((t) => t.id !== target.id));

    if (target.type === 'good') {
      setTargetScore((s) => s + 1);
    } else {
      setTargetMissed((m) => m + 2);
    }
  };

  const startSequenceRound = (round: number) => {
    const length = 3 + round;
    const seq = Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
    setSeqDisplay(seq);
    setSeqInput([]);
    setSeqPhase('show');
    setSeqRound(round);

    setTimeout(() => {
      setSeqPhase('input');
      setSeqStartTime(Date.now());
      setSeqTimeLimit(length * 1500);
    }, length * 600 + 500);
  };

  const startColorRound = () => {
    const colors = ['🔴', '🟡', '🟢', '🔵', '🟣', '🟠'];
    const target = colors[Math.floor(Math.random() * colors.length)];
    const choices = [...colors].sort(() => Math.random() - 0.5).slice(0, 4);

    if (!choices.includes(target)) choices[0] = target;

    setColorTarget(target);
    setColorChoices(choices.sort(() => Math.random() - 0.5));
    setColorTimeLeft(2);
  };

  const ui = {
    title: { pl: 'REFLEKS REAKTORA', en: 'REACTOR REFLEX' },

    t0Title: { pl: 'TEST REAKCJI 3×', en: 'REACTION TEST 3×' },
    t0Desc: {
      pl: 'Trzy próby reakcji. Średnia musi być < 800ms. Klikaj DOPIERO gdy ekran zmieni kolor!',
      en: 'Three reaction trials. Average must be < 800ms. Click ONLY when screen changes color!',
    },

    t1Title: { pl: 'POLOWANIE NA SYGNAŁY', en: 'SIGNAL HUNT' },
    t1Desc: {
      pl: 'Klikaj na ZIELONE sygnały (🌽), unikaj CZERWONYCH (💣). Cel: 8 trafień. Masz 20 sekund!',
      en: 'Click GREEN signals (🌽), avoid RED ones (💣). Target: 8 hits. You have 20 seconds!',
    },

    t2Title: { pl: 'SEKWENCJA POD CZAS', en: 'TIMED SEQUENCE' },
    t2Desc: {
      pl: 'Zapamiętaj cyfry, wpisz je na czas. 3 rundy, każda dłuższa.',
      en: 'Memorize digits, enter on time. 3 rounds, each longer.',
    },

    t3Title: { pl: 'PRZECHWYTYWANIE KOLORÓW', en: 'COLOR INTERCEPTION' },
    t3Desc: {
      pl: 'Kliknij właściwy kolor zanim upłynie czas! 5 rund. Każda runda = 2 sekundy.',
      en: 'Click correct color before time runs out! 5 rounds. Each round = 2 seconds.',
    },

    t4Title: { pl: 'PRZESKOK DO Q11', en: 'JUMP TO Q11' },
    t4Desc: {
      pl: 'Twoja prędkość uruchomiła ścieżkę do HUB LOGICZNEGO. Idź tam fizycznie i zapisz pierwszy kolor migający na panelu.',
      en: 'Your speed unlocked path to LOGIC HUB. Walk there physically and note the first flashing color on the panel.',
    },
  } as const;

  return (
    <QuestFrame title={`QUEST 6 — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>⚡ Q6</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        {task === 0 && <span>R{reactionRound}/3</span>}
        {task === 1 && <span>🎯 {targetScore} ❌ {targetMissed}</span>}
        {task === 3 && <span>R{colorRound}/5</span>}
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: REACTION TEST ============ */}
        <QuestTaskShell
          key="t0"
          taskNumber={1}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={ui.t0Title[L]}
          description={ui.t0Desc[L]}
          isActive={task === 0}
          isCompleted={task > 0}
          physicalHint={L === 'pl' ? '📍 TUNEL WSCHODNI — STREFA REAKCJI' : '📍 EAST TUNNEL — REACTION ZONE'}
        >
          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReactionClick}
              className={`
                w-full h-48 rounded-2xl border-4 flex flex-col items-center justify-center
                font-orbitron font-bold tracking-widest transition-colors
                ${reactionStage === 'waiting' ? 'border-[#C97A3F] bg-[#5C2E0A]/40 text-[#C97A3F]' : ''}
                ${reactionStage === 'ready' ? 'border-[#5CBD76] bg-[#5CBD76]/40 text-[#5CBD76] animate-pulse' : ''}
                ${reactionStage === 'tooEarly' ? 'border-red-500 bg-red-500/30 text-red-400' : ''}
                ${reactionStage === 'success' ? 'border-[#FFE27A] bg-[#FFE27A]/30 text-[#FFE27A]' : ''}
                ${reactionStage === 'tooLate' ? 'border-red-700 bg-red-700/30 text-red-400' : ''}
              `}
            >
              {reactionStage === 'waiting' && (
                <>
                  <span className="text-xs">{L === 'pl' ? 'CZEKAJ...' : 'WAIT...'}</span>
                  <span className="text-3xl mt-2">⏳</span>
                </>
              )}

              {reactionStage === 'ready' && (
                <>
                  <span className="text-2xl">{L === 'pl' ? 'KLIKNIJ!' : 'CLICK!'}</span>
                  <span className="text-4xl mt-2">⚡</span>
                </>
              )}

              {reactionStage === 'tooEarly' && (
                <>
                  <span className="text-sm">{L === 'pl' ? 'ZA WCZEŚNIE!' : 'TOO EARLY!'}</span>
                  <span className="text-3xl mt-2">❌</span>
                </>
              )}

              {reactionStage === 'success' && (
                <>
                  <span className="text-xl">{reactionTimes[reactionTimes.length - 1]}ms</span>
                  <span className="text-3xl mt-2">✅</span>
                </>
              )}

              {reactionStage === 'tooLate' && (
                <>
                  <span className="text-sm">{L === 'pl' ? 'ZA WOLNO!' : 'TOO SLOW!'}</span>
                  <span className="text-3xl mt-2">⏰</span>
                </>
              )}
            </motion.button>

            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((round) => (
                <div
                  key={round}
                  className={`
                    w-10 h-6 rounded-md border flex items-center justify-center
                    font-mono text-[10px] font-bold
                    ${reactionRound > round
                      ? 'border-[#5CBD76] bg-[#5CBD76]/20 text-[#5CBD76]'
                      : reactionRound === round
                        ? 'border-[#FFE27A] bg-[#FFE27A]/20 text-[#FFE27A] animate-pulse'
                        : 'border-[#8B4513]/30 text-[#8B4513]'
                    }
                  `}
                >
                  {reactionTimes[round - 1] || '—'}
                </div>
              ))}
            </div>

            {reactionTimes.length > 0 && (
              <p className="text-center text-[10px] font-mono text-[#C97A3F]">
                {L === 'pl' ? 'ŚREDNIA' : 'AVG'}:{' '}
                {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
              </p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 1: WHACK-A-MOLE ============ */}
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
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-[#1A0C03]/60 rounded-lg p-2 border border-[#8B4513]/30">
              <span className="font-mono text-xs text-[#5CBD76]">🎯 {targetScore}</span>
              <span className="font-mono text-xs text-red-400">❌ {targetMissed}/4</span>
              <span className="font-mono text-xs text-[#FFE27A] font-bold">⏱ {targetTimeLeft}s</span>
            </div>

            <div className="
              relative h-64 rounded-xl border-2 border-[#8B4513]
              bg-gradient-to-b from-[#1A0C03] to-[#0D0600] overflow-hidden
            ">
              {!targetGameActive && targetTimeLeft === 20 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <QuestButton
                    onClick={() => {
                      setTargetGameActive(true);
                      setTargets([]);
                      setTargetScore(0);
                      setTargetMissed(0);
                    }}
                    variant="green"
                  >
                    🎮 {L === 'pl' ? 'START!' : 'START!'}
                  </QuestButton>
                </div>
              )}

              {targets.map((target) => (
                <motion.button
                  key={target.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handleTargetClick(target)}
                  className="absolute text-3xl"
                  style={{
                    left: `${target.x}%`,
                    top: `${target.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {target.type === 'good' ? '🌽' : '💣'}
                </motion.button>
              ))}
            </div>
          </div>
        </QuestTaskShell>

        {/* ============ TASK 2: TIMED SEQUENCE ============ */}
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
            <div className="text-center font-orbitron text-[10px] text-[#FFE27A]/50 tracking-widest">
              {L === 'pl' ? `RUNDA ${seqRound}/3` : `ROUND ${seqRound}/3`} —{' '}
              {seqPhase === 'show'
                ? (L === 'pl' ? 'PATRZ!' : 'WATCH!')
                : (L === 'pl' ? 'WPISUJ!' : 'TYPE!')
              }
            </div>

            {seqPhase === 'show' && (
              <div className="flex justify-center gap-2 flex-wrap">
                {seqDisplay.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.5 }}
                    className="
                      w-12 h-12 rounded-xl border-2 border-[#FFE27A]
                      bg-[#FFE27A]/20 flex items-center justify-center
                      font-mono text-2xl font-bold text-[#FFE27A]
                    "
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
            )}

            {seqPhase === 'input' && (
              <>
                <div className="flex justify-center gap-1.5 flex-wrap min-h-[40px]">
                  {seqDisplay.map((_, i) => (
                    <div
                      key={i}
                      className={`
                        w-8 h-10 rounded-lg border-2 flex items-center justify-center
                        font-mono text-sm font-bold
                        ${seqInput[i] !== undefined
                          ? 'border-[#FFE27A] bg-[#FFE27A]/10 text-[#FFE27A]'
                          : 'border-dashed border-[#8B4513]/30'
                        }
                      `}
                    >
                      {seqInput[i] ?? '?'}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (seqInput.length >= seqDisplay.length) return;

                        const elapsed = Date.now() - seqStartTime;

                        if (elapsed > seqTimeLimit) {
                          onFail();
                          return;
                        }

                        const newInput = [...seqInput, n];
                        setSeqInput(newInput);

                        if (newInput.length === seqDisplay.length) {
                          const correct = newInput.every((v, i) => v === seqDisplay[i]);

                          if (correct) {
                            if (seqRound >= 3) {
                              setMemory('q6_seq_completed', 'true', 6);
                              nextTask();
                            } else {
                              startSequenceRound(seqRound + 1);
                            }
                          } else {
                            onFail();
                          }
                        }
                      }}
                      className="
                        h-10 rounded-lg border border-[#8B4513]/50 bg-[#1A0C03]
                        font-mono text-sm font-bold text-[#FFE27A] active:bg-[#FFE27A]/20
                      "
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>

                <div className="w-full h-1 bg-[#1A0C03] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: seqTimeLimit / 1000, ease: 'linear' }}
                    className="h-full bg-red-500"
                  />
                </div>
              </>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 3: COLOR MATCH SPEED ============ */}
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
              text-center bg-[#1A0C03] rounded-2xl border-2 border-[#FFE27A]/40 p-6
            ">
              <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest mb-2">
                {L === 'pl' ? 'KLIKNIJ:' : 'CLICK:'}
              </p>
              <div className="text-6xl">{colorTarget}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {colorChoices.map((color, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (color === colorTarget) {
                      const newScore = colorScore + 1;
                      setColorScore(newScore);

                      if (colorRound >= 5) {
                        setMemory('q6_color_score', String(newScore), 6);
                        nextTask();
                      } else {
                        setColorRound((r) => r + 1);
                        startColorRound();
                      }
                    } else {
                      onFail();
                    }
                  }}
                  className="
                    h-20 text-4xl rounded-xl border-2 border-[#8B4513]/40
                    bg-[#1A0C03] active:bg-[#FFE27A]/20 transition-colors
                  "
                >
                  {color}
                </motion.button>
              ))}
            </div>

            <div className="w-full h-2 bg-[#1A0C03] rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(colorTimeLeft / 2) * 100}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
                className={`h-full ${colorTimeLeft < 0.7 ? 'bg-red-500' : 'bg-[#FFE27A]'}`}
              />
            </div>

            <div className="text-center text-[10px] font-mono text-[#C97A3F]">
              {L === 'pl' ? 'WYNIK' : 'SCORE'}: {colorScore}/5
            </div>
          </div>
        </QuestTaskShell>

        {/* ============ TASK 4: JUMP TO Q11 ============ */}
        <QuestTaskShell
          key="t4"
          taskNumber={5}
          totalTasks={TOTAL_TASKS}
          taskType="jump"
          title={ui.t4Title[L]}
          description={ui.t4Desc[L]}
          isActive={task === 4}
          isCompleted={task > 4}
          physicalHint={L === 'pl' ? '📍 IDŹ DO HUB LOGICZNEGO (Q11)' : '📍 GO TO LOGIC HUB (Q11)'}
        >
          <JumpPrompt
            targetQuest={11}
            reason={
              L === 'pl'
                ? 'Po teście prędkości otwarł się tunel do Hub Logicznego. Sprawdź panel kolorów przy wejściu.'
                : 'After speed test, a tunnel to Logic Hub opened. Check the color panel at the entrance.'
            }
            hasRequiredMemory={true}
            onJump={() => {
              requestJump({
                fromQuest: 6,
                toQuest: 11,
                reason: 'Speed unlocked tunnel',
                returnAfter: true,
              });
              setMemory('q6_jumped_to_q11', 'true', 6);
              nextTask();
            }}
            lang={L}
          />
        </QuestTaskShell>

        {/* ============ TASK 5: FRAGMENT REVEAL ============ */}
        <QuestTaskShell
          key="t5"
          taskNumber={6}
          totalTasks={TOTAL_TASKS}
          taskType="code_input"
          title={L === 'pl' ? 'FRAGMENT ODKRYTY' : 'FRAGMENT DISCOVERED'}
          isActive={task === 5}
          isCompleted={task > 5}
        >
          <CodeFragmentReveal
            fragment={{
              questId: 6,
              fragment: CODE_FRAGMENT_COLOR,
              type: 'color',
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