import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import BackRefPrompt from '../components/quest-ui/BackRefPrompt';
import MemoryLockInput from '../components/quest-ui/MemoryLockInput';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 6;
const CODE_FRAGMENT = 'CORN';

interface QuizQuestion {
  q: { pl: string; en: string };
  answers: { pl: string[]; en: string[] };
  correct: number;
  type: 'basic' | 'observation' | 'memory' | 'logic';
  physicalHint?: { pl: string; en: string };
}

export default function Quest3Quiz({ onComplete, onFail }: StandardQuestProps) {
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
    requestBackRef,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [locked, setLocked] = useState(false);
  const [showFragment, setShowFragment] = useState(false);

  useEffect(() => { initQuest(3, TOTAL_TASKS); }, []);

  const nextTask = useCallback(() => {
    completeTask(3, task);
    addScore(15);
    setTask((t) => t + 1);
    setSelectedAnswer(null);
    setAnswerState('idle');
    setLocked(false);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(3);
    addCodeFragment({
      questId: 3,
      fragment: CODE_FRAGMENT,
      type: 'word',
      discoveredAt: Date.now(),
    });
    setMemory('q3_quiz_word', CODE_FRAGMENT, 3);
    onComplete();
  }, []);

  /* ---- PYTANIA ---- */
  const questions: QuizQuestion[] = useMemo(() => [
    {
      q: {
        pl: 'W którym kraju znajduje się Zator?',
        en: 'In which country is Zator located?',
      },
      answers: {
        pl: ['Niemcy', 'Polska', 'Czechy', 'Słowacja'],
        en: ['Germany', 'Poland', 'Czechia', 'Slovakia'],
      },
      correct: 1,
      type: 'basic',
    },
    {
      q: {
        pl: 'Ile rzędów ziaren ma typowa kolba kukurydzy?',
        en: 'How many rows of kernels does a typical corn cob have?',
      },
      answers: {
        pl: ['8–10', '14–20', '24–30', '32+'],
        en: ['8–10', '14–20', '24–30', '32+'],
      },
      correct: 1,
      type: 'logic',
    },
    {
      q: {
        pl: 'Jaki kolor ma NAJWIĘKSZA tabliczka przy wejściu do labiryntu?',
        en: 'What color is the LARGEST sign at the maze entrance?',
      },
      answers: {
        pl: ['Czerwona', 'Żółta', 'Zielona', 'Niebieska'],
        en: ['Red', 'Yellow', 'Green', 'Blue'],
      },
      correct: 1,
      type: 'observation',
      physicalHint: {
        pl: '📍 Obejrzyj tabliczki przy WEJŚCIU GŁÓWNYM',
        en: '📍 Check signs at the MAIN ENTRANCE',
      },
    },
  ], []);

  const handleAnswer = (answerIndex: number) => {
    if (locked) return;

    setLocked(true);
    setSelectedAnswer(answerIndex);

    const isCorrect = answerIndex === questions[task].correct;

    setAnswerState(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      if (isCorrect) {
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        nextTask();
      } else {
        setStreak(0);

        if (score <= 0 && task >= 2) {
          onFail();
        } else {
          setLocked(false);
          setSelectedAnswer(null);
          setAnswerState('idle');
        }
      }
    }, 800);
  };

  /* ---- TŁUMACZENIA UI ---- */
  const ui = {
    title: { pl: 'QUIZ LABIRYNTOWY', en: 'MAZE QUIZ' },
    backrefTitle: { pl: 'WERYFIKACJA KRZYŻOWA', en: 'CROSS VERIFICATION' },
    backrefDesc: {
      pl: 'Aby kontynuować, musisz wrócić do Questa 1 i odczytać 2-cyfrowy kod startowy z tabliczki.',
      en: 'To continue, return to Quest 1 and read the 2-digit start code from the sign.',
    },
    memoryTitle: { pl: 'BLOKADA PAMIĘCI', en: 'MEMORY LOCK' },
    memoryDesc: {
      pl: 'Wpisz liczbę żółtych tabliczek, którą zapamiętałeś z Questa 1.',
      en: 'Enter the number of yellow signs you memorized from Quest 1.',
    },
  } as const;

  return (
    <QuestFrame title={`QUEST 3 — ${ui.title[L]}`}>
      {/* HUD */}
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>📝 {task + 1}/{TOTAL_TASKS}</span>
        <span>🎯 {score}</span>
        <span>⚡ ×{streak}</span>
      </div>

      <AnimatePresence mode="wait">
        {/* ============ TASKS 0-2: QUIZ QUESTIONS ============ */}
        {task < 3 && (
          <QuestTaskShell
            key={`quiz-${task}`}
            taskNumber={task + 1}
            totalTasks={TOTAL_TASKS}
            taskType={questions[task].type === 'observation' ? 'observation' : 'question'}
            title={questions[task].q[L]}
            isActive
            isCompleted={false}
            physicalHint={questions[task].physicalHint?.[L]}
          >
            <div className="space-y-2">
              {questions[task].answers[L].map((answer, i) => (
                <QuestButton
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={locked}
                  variant={
                    selectedAnswer === i
                      ? answerState === 'correct'
                        ? 'green'
                        : 'red'
                      : 'wood'
                  }
                >
                  {answer}
                </QuestButton>
              ))}
            </div>
          </QuestTaskShell>
        )}

        {/* ============ TASK 3: BACK-REFERENCE TO Q1 ============ */}
        {task === 3 && (
          <QuestTaskShell
            key="backref"
            taskNumber={4}
            totalTasks={TOTAL_TASKS}
            taskType="backref"
            title={ui.backrefTitle[L]}
            description={ui.backrefDesc[L]}
            isActive
            isCompleted={false}
            physicalHint={L === 'pl' ? 'WRÓĆ DO WEJŚCIA GŁÓWNEGO' : 'RETURN TO MAIN ENTRANCE'}
          >
            <BackRefPrompt
              targetQuest={1}
              targetTask={2}
              hint={L === 'pl' ? 'Kod 2-cyfrowy z odwrotu tabliczki NFC' : '2-digit code from NFC sign back'}
              physicalLocation={L === 'pl' ? 'WEJŚCIE GŁÓWNE — SŁUPEK ⚡' : 'MAIN ENTRANCE — POST ⚡'}
              onNavigate={() => {
                requestBackRef({
                  targetQuest: 1,
                  targetTask: 2,
                  hint: 'Kod startowy',
                });
              }}
              onSubmitCode={(code) => {
                if (code === '37') {
                  setMemory('q3_verified_q1_code', code, 3);
                  nextTask();
                }
              }}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 4: MEMORY LOCK (from Q1) ============ */}
        {task === 4 && (
          <QuestTaskShell
            key="memlock"
            taskNumber={5}
            totalTasks={TOTAL_TASKS}
            taskType="memory_lock"
            title={ui.memoryTitle[L]}
            description={ui.memoryDesc[L]}
            isActive
            isCompleted={false}
          >
            <MemoryLockInput
              memoryKey="q1_yellow_signs"
              expectedValue="3"
              sourceQuest={1}
              hint={L === 'pl' ? 'Ile żółtych tabliczek widziałeś przy wejściu?' : 'How many yellow signs did you see at the entrance?'}
              onUnlock={nextTask}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* ============ TASK 5: CODE FRAGMENT REVEAL ============ */}
        {task === 5 && (
          <QuestTaskShell
            key="fragment"
            taskNumber={6}
            totalTasks={TOTAL_TASKS}
            taskType="code_input"
            title={L === 'pl' ? 'FRAGMENT ODKRYTY' : 'FRAGMENT DISCOVERED'}
            isActive
            isCompleted={false}
          >
            <CodeFragmentReveal
              fragment={{
                questId: 3,
                fragment: CODE_FRAGMENT,
                type: 'word',
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