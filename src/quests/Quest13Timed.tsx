import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import CompassNavigationTask from '../components/quest-ui/CompassNavigationTask';
import AudioFrequencyTuner from '../components/quest-ui/AudioFrequencyTuner';
import CircuitMatchPuzzle from '../components/quest-ui/CircuitMatchPuzzle';
import MathExpressionBuilder from '../components/quest-ui/MathExpressionBuilder';
import MemoryLockInput from '../components/quest-ui/MemoryLockInput';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 8;
const TIME_LIMIT = 600; // 10 minut na cały quest
const CODE_FRAGMENT = '7531';

export default function Quest13Timed({ onComplete, onFail }: StandardQuestProps) {
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
  const [globalTime, setGlobalTime] = useState(TIME_LIMIT);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initQuest(13, TOTAL_TASKS);
  }, []);

  // Global countdown
  useEffect(() => {
    if (paused || task >= TOTAL_TASKS - 1) return;

    timerRef.current = setInterval(() => {
      setGlobalTime((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onFail();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, task]);

  const nextTask = useCallback(() => {
    completeTask(13, task);
    addScore(40);
    setTask((t) => t + 1);
  }, [task]);

  const handleComplete = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    completeQuest(13);
    addCodeFragment({
      questId: 13,
      fragment: CODE_FRAGMENT,
      type: 'digits',
      discoveredAt: Date.now(),
    });
    setMemory('q13_code', CODE_FRAGMENT, 13);
    setMemory('q13_time_left', String(globalTime), 13);
    onComplete();
  }, [globalTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const ui = {
    title: { pl: 'KORYTARZ FINAŁOWY', en: 'FINAL CORRIDOR' },

    t0Title: { pl: 'NAMIERZANIE WYJŚCIA', en: 'EXIT TARGETING' },
    t0Desc: {
      pl: 'Użyj kompasu telefonu, aby skierować się dokładnie na ZACHÓD (270°). System cię prowadzi.',
      en: 'Use phone compass to face exactly WEST (270°). System guides you.',
    },

    t1Title: { pl: 'STROJENIE NADAJNIKA', en: 'TRANSMITTER TUNING' },
    t1Desc: {
      pl: 'Znajdź docelową częstotliwość 783 Hz. Włącz dźwięk i słuchaj harmonicznej.',
      en: 'Find target frequency 783 Hz. Enable sound and listen for harmonic.',
    },

    t2Title: { pl: 'OBWODY ENERGETYCZNE', en: 'POWER CIRCUITS' },
    t2Desc: {
      pl: 'Połącz piny zasilania w kolejności kolorystycznej: czerwony→czerwony, niebieski→niebieski, etc.',
      en: 'Connect power pins by color: red→red, blue→blue, etc.',
    },

    t3Title: { pl: 'OBLICZENIA KRYTYCZNE', en: 'CRITICAL COMPUTATION' },
    t3Desc: {
      pl: 'Zbuduj wyrażenie matematyczne, którego wynik = 256 (potęga 2). Tylko cyfry 2, 4, 8 i operatory.',
      en: 'Build math expression with result = 256 (power of 2). Only digits 2, 4, 8 and operators.',
    },

    t4Title: { pl: 'BACK-REF Q8', en: 'BACK-REF Q8' },
    t4Desc: {
      pl: 'Wpisz klucz odkryty w Queście 8 (5 liter, OMEGA).',
      en: 'Enter key from Quest 8 (5 letters, OMEGA).',
    },

    t5Title: { pl: 'BACK-REF Q11', en: 'BACK-REF Q11' },
    t5Desc: {
      pl: 'Wpisz cyfry odkryte w Queście 11.',
      en: 'Enter digits discovered in Quest 11.',
    },

    t6Title: { pl: 'POTWIERDZENIE FINAŁU', en: 'FINAL CONFIRMATION' },
    t6Desc: {
      pl: 'Potwierdź gotowość do bramy finałowej.',
      en: 'Confirm readiness for final gate.',
    },

    t7Title: { pl: 'FRAGMENT ODKRYTY', en: 'FRAGMENT DISCOVERED' },
  } as const;

  return (
    <QuestFrame title={`QUEST 13 — ${ui.title[L]}`}>
      {/* GLOBAL TIMER (sticky top) */}
      <motion.div
        animate={{
          backgroundColor: globalTime < 60 ? '#7F1D1D' : '#1A0C03',
        }}
        className="
          flex justify-between items-center mb-4 p-3 rounded-lg
          border-2 border-[#FFE27A]/30
        "
      >
        <span className="font-orbitron text-[10px] text-[#C97A3F] tracking-widest">
          ⏱ {L === 'pl' ? 'CZAS GLOBALNY' : 'GLOBAL TIME'}
        </span>
        <span className={`font-mono text-2xl font-bold ${globalTime < 60 ? 'text-red-400 animate-pulse' : 'text-[#FFE27A]'}`}>
          {formatTime(globalTime)}
        </span>
        <span className="font-mono text-[10px] text-[#FFE27A]/50">
          📍 {task + 1}/{TOTAL_TASKS}
        </span>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: COMPASS NAV ============ */}
        {task === 0 && (
          <QuestTaskShell
            key="t0"
            taskNumber={1}
            totalTasks={TOTAL_TASKS}
            taskType="physical"
            title={ui.t0Title[L]}
            description={ui.t0Desc[L]}
            isActive
            isCompleted={false}
            physicalHint={L === 'pl' ? '📍 ZWRÓĆ TELEFON NA ZACHÓD' : '📍 TURN PHONE WEST'}
          >
            <CompassNavigationTask
              targetBearing={270}
              tolerance={15}
              onAligned={() => {
                setMemory('q13_compass_aligned', 'true', 13);
                nextTask();
              }}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 1: AUDIO TUNER ============ */}
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
            <AudioFrequencyTuner
              targetFrequency={783}
              tolerance={10}
              onTuned={() => {
                setMemory('q13_frequency', '783', 13);
                nextTask();
              }}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 2: CIRCUIT MATCH ============ */}
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
            <CircuitMatchPuzzle
              pins={{
                left: [
                  { id: 'L1', side: 'left', index: 0, color: '#EF4444', label: 'PWR-R' },
                  { id: 'L2', side: 'left', index: 1, color: '#3B82F6', label: 'PWR-B' },
                  { id: 'L3', side: 'left', index: 2, color: '#10B981', label: 'PWR-G' },
                  { id: 'L4', side: 'left', index: 3, color: '#FFE27A', label: 'PWR-Y' },
                ],
                right: [
                  { id: 'R1', side: 'right', index: 0, color: '#10B981', label: 'OUT-G' },
                  { id: 'R2', side: 'right', index: 1, color: '#FFE27A', label: 'OUT-Y' },
                  { id: 'R3', side: 'right', index: 2, color: '#EF4444', label: 'OUT-R' },
                  { id: 'R4', side: 'right', index: 3, color: '#3B82F6', label: 'OUT-B' },
                ],
              }}
              correctConnections={{
                L1: 'R3', // R → R
                L2: 'R4', // B → B
                L3: 'R1', // G → G
                L4: 'R2', // Y → Y
              }}
              onSolved={() => {
                setMemory('q13_circuit', 'connected', 13);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 3: MATH EXPR BUILDER ============ */}
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
            <MathExpressionBuilder
              availableBlocks={['2', '4', '8', '+', '-', '×', '÷', '(', ')']}
              targetResult={256}
              onSolved={() => {
                setMemory('q13_math', '256', 13);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 4: BACK-REF Q8 ============ */}
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
            <MemoryLockInput
              memoryKey="q8_key"
              expectedValue="OMEGA"
              sourceQuest={8}
              hint={L === 'pl' ? '5 liter z dekodera' : '5 letters from decoder'}
              onUnlock={nextTask}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 5: BACK-REF Q11 ============ */}
        {task === 5 && (
          <QuestTaskShell
            key="t5"
            taskNumber={6}
            totalTasks={TOTAL_TASKS}
            taskType="memory_lock"
            title={ui.t5Title[L]}
            description={ui.t5Desc[L]}
            isActive
            isCompleted={false}
          >
            <MemoryLockInput
              memoryKey="q11_digits"
              expectedValue="99"
              sourceQuest={11}
              hint={L === 'pl' ? '2 cyfry z huba logicznego' : '2 digits from logic hub'}
              onUnlock={nextTask}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 6: CONFIRMATION ============ */}
        {task === 6 && (
          <QuestTaskShell
            key="t6"
            taskNumber={7}
            totalTasks={TOTAL_TASKS}
            taskType="question"
            title={ui.t6Title[L]}
            description={ui.t6Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-4 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl"
              >
                🚪
              </motion.div>

              <p className="text-sm text-[#FFE27A]/70">
                {L === 'pl'
                  ? `Zostało ci ${formatTime(globalTime)}. Brama finałowa jest blisko.`
                  : `${formatTime(globalTime)} remaining. Final gate is near.`}
              </p>

              <QuestButton onClick={nextTask} variant="green">
                ⚡ {L === 'pl' ? 'KONTYNUUJ' : 'CONTINUE'}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 7: FRAGMENT ============ */}
        {task === 7 && (
          <QuestTaskShell
            key="t7"
            taskNumber={8}
            totalTasks={TOTAL_TASKS}
            taskType="code_input"
            title={ui.t7Title[L]}
            isActive
            isCompleted={false}
          >
            <CodeFragmentReveal
              fragment={{
                questId: 13,
                fragment: CODE_FRAGMENT,
                type: 'digits',
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