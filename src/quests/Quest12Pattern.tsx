import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import MorseCodePuzzle from '../components/quest-ui/MorseCodePuzzle';
import RotaryCipherDial from '../components/quest-ui/RotaryCipherDial';
import PipeFlowPuzzle from '../components/quest-ui/PipeFlowPuzzle';
import SwipePatternLock from '../components/quest-ui/SwipePatternLock';
import MemoryLockInput from '../components/quest-ui/MemoryLockInput';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 7;
const CODE_FRAGMENT = '🔮';

export default function Quest12Pattern({ onComplete, onFail }: StandardQuestProps) {
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

  useEffect(() => {
    initQuest(12, TOTAL_TASKS);
  }, []);

  const nextTask = useCallback(() => {
    completeTask(12, task);
    addScore(35);
    setTask((t) => t + 1);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(12);
    addCodeFragment({
      questId: 12,
      fragment: CODE_FRAGMENT,
      type: 'symbol',
      discoveredAt: Date.now(),
    });
    setMemory('q12_symbol', CODE_FRAGMENT, 12);
    onComplete();
  }, []);

  const ui = {
    title: { pl: 'WIEŻA WZORCÓW', en: 'PATTERN TOWER' },

    t0Title: { pl: 'SZYFR MORSE\'A', en: 'MORSE CIPHER' },
    t0Desc: {
      pl: 'Odbierz transmisję z radia operatora. Naciśnij PLAY aby usłyszeć kod (telefon zawibruje rytmicznie).',
      en: 'Receive transmission from operator radio. Press PLAY to hear the code (phone will vibrate rhythmically).',
    },

    t1Title: { pl: 'TARCZA CEZARA', en: 'CAESAR DIAL' },
    t1Desc: {
      pl: 'Obróć tarczę szyfru, aby odkryć ukryte słowo. Wskazówka: każda litera jest przesunięta o 7.',
      en: 'Rotate the cipher dial to reveal hidden word. Hint: each letter shifted by 7.',
    },

    t2Title: { pl: 'PRZEPŁYW SYGNAŁU', en: 'SIGNAL FLOW' },
    t2Desc: {
      pl: 'Połącz rury, aby sygnał dotarł od 🚀 START do 🎯 KOŃCA. Dotykaj rur aby je obracać.',
      en: 'Connect pipes so signal flows from 🚀 START to 🎯 END. Tap pipes to rotate them.',
    },

    t3Title: { pl: 'WZÓR ODBLOKOWUJĄCY', en: 'UNLOCK PATTERN' },
    t3Desc: {
      pl: 'Narysuj wzór odblokowujący widziany na tabliczce w fizycznej lokacji.',
      en: 'Draw the unlock pattern seen on physical sign at the location.',
    },

    t4Title: { pl: 'POWRÓT DO Q8', en: 'BACK TO Q8' },
    t4Desc: {
      pl: 'Wpisz klucz odkryty w Queście 8.',
      en: 'Enter the key discovered in Quest 8.',
    },

    t5Title: { pl: 'POWRÓT DO Q11', en: 'BACK TO Q11' },
    t5Desc: {
      pl: 'Wpisz kolor z huba logicznego (Quest 11).',
      en: 'Enter the color from logic hub (Quest 11).',
    },

    t6Title: { pl: 'FRAGMENT ODKRYTY', en: 'FRAGMENT DISCOVERED' },
  } as const;

  return (
    <QuestFrame title={`QUEST 12 — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>🔮 Q12</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        <span>WIEŻA OBSERWACYJNA</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: MORSE ============ */}
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
            <MorseCodePuzzle
              encodedWord="MAZE"
              expectedAnswer="MAZE"
              hint={L === 'pl' ? 'Słowo z 4 liter związane z grą' : 'Game-related word with 4 letters'}
              onSolved={() => {
                setMemory('q12_morse', 'MAZE', 12);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 1: CIPHER DIAL ============ */}
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
            <RotaryCipherDial
              encryptedText="UVTLY"
              expectedShift={7}
              expectedAnswer="NOTER"
              onSolved={() => {
                setMemory('q12_cipher', 'NOTER', 12);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 2: PIPE FLOW ============ */}
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
            <PipeFlowPuzzle
              onSolved={() => {
                setMemory('q12_pipes', 'connected', 12);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 3: SWIPE PATTERN ============ */}
        {task === 3 && (
          <QuestTaskShell
            key="t3"
            taskNumber={4}
            totalTasks={TOTAL_TASKS}
            taskType="physical"
            title={ui.t3Title[L]}
            description={ui.t3Desc[L]}
            isActive
            isCompleted={false}
            physicalHint={L === 'pl' ? '📍 TABLICZKA Z WZOREM W WIEŻY' : '📍 PATTERN SIGN IN TOWER'}
          >
            <SwipePatternLock
              expectedPattern={[0, 1, 2, 5, 8]}
              onUnlock={() => {
                setMemory('q12_pattern', 'L-shape', 12);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 4: BACK TO Q8 ============ */}
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
              hint={L === 'pl' ? 'Klucz dekodera Cezara' : 'Caesar decoder key'}
              onUnlock={nextTask}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 5: BACK TO Q11 ============ */}
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
              memoryKey="q11_color"
              expectedValue="GREEN"
              sourceQuest={11}
              hint={L === 'pl' ? 'Kolor zwycięstwa z huba' : 'Victory color from hub'}
              onUnlock={nextTask}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 6: FRAGMENT ============ */}
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
                questId: 12,
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