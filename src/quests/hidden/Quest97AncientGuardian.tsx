import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useGameStore } from '../../systems/GameState';
import QuestFrame from '../../components/quest-ui/QuestFrame';
import QuestButton from '../../components/quest-ui/QuestButton';
import QuestTaskShell from '../../components/quest-ui/QuestTaskShell';
import RotaryCipherDial from '../../components/quest-ui/RotaryCipherDial';
import SwipePatternLock from '../../components/quest-ui/SwipePatternLock';
import type { StandardQuestProps } from '../../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 5;

export default function Quest97AncientGuardian({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const { addScore, setMemory, unlockHiddenQuest } = useGameStore();

  const [task, setTask] = useState(0);
  const [riddle1, setRiddle1] = useState<string | null>(null);
  const [riddle2, setRiddle2] = useState<string | null>(null);
  const [riddle3, setRiddle3] = useState<string | null>(null);

  const nextTask = useCallback(() => {
    addScore(150);
    setTask((t) => t + 1);
  }, []);

  const handleComplete = useCallback(() => {
    unlockHiddenQuest(97);
    setMemory('q97_guardian_passed', 'true', 97);
    onComplete();
  }, []);

  const ui = {
    title: { pl: '🛡 STAROŻYTNY STRAŻNIK', en: '🛡 ANCIENT GUARDIAN' },

    t0Title: { pl: 'PIERWSZA ZAGADKA', en: 'FIRST RIDDLE' },
    t0Desc: {
      pl: 'Im więcej mnie zabierasz, tym większy się staję. Co ja jestem?',
      en: 'The more you take, the bigger I become. What am I?',
    },

    t1Title: { pl: 'DRUGA ZAGADKA', en: 'SECOND RIDDLE' },
    t1Desc: {
      pl: 'Mam usta, ale nie mówię. Mam koryto, ale nie jem. Co ja jestem?',
      en: 'I have a mouth but do not speak. I have a bed but do not sleep. What am I?',
    },

    t2Title: { pl: 'TRZECIA ZAGADKA', en: 'THIRD RIDDLE' },
    t2Desc: {
      pl: 'Im szybciej biegniesz, tym trudniej mnie złapać. Co ja jestem?',
      en: 'The faster you run, the harder I am to catch. What am I?',
    },

    t3Title: { pl: 'STAROŻYTNY SZYFR', en: 'ANCIENT CIPHER' },
    t3Desc: {
      pl: 'Strażnik testuje Twoją wiedzę o pradawnych szyfrach.',
      en: 'Guardian tests your knowledge of ancient ciphers.',
    },

    t4Title: { pl: 'PIECZĘĆ STRAŻNIKA', en: 'GUARDIAN SEAL' },
    t4Desc: {
      pl: 'Narysuj świętą pieczęć — koło z ośmioma promieniami.',
      en: 'Draw the sacred seal — circle with eight rays.',
    },
  } as const;

  return (
    <QuestFrame title={`SECRET — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-blue-400/60 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg border border-blue-500/20">
        <span>🛡 ANCIENT</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        <span>⚜️ HIDDEN</span>
      </div>

      <AnimatePresence mode="wait">

        {/* TASK 0: RIDDLE 1 */}
        {task === 0 && (
          <QuestTaskShell
            key="t0"
            taskNumber={1}
            totalTasks={TOTAL_TASKS}
            taskType="question"
            title={ui.t0Title[L]}
            description={ui.t0Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-2">
              {[
                { en: 'A KNIFE', pl: 'NÓŻ', correct: false },
                { en: 'A HOLE', pl: 'DZIURA', correct: true },
                { en: 'TIME', pl: 'CZAS', correct: false },
                { en: 'A MOUNTAIN', pl: 'GÓRA', correct: false },
              ].map((opt, i) => (
                <QuestButton
                  key={i}
                  onClick={() => {
                    if (opt.correct) {
                      setRiddle1(opt[L]);
                      setMemory('q97_riddle1', opt[L], 97);
                      nextTask();
                    } else {
                      onFail();
                    }
                  }}
                  variant="wood"
                >
                  {opt[L]}
                </QuestButton>
              ))}
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 1: RIDDLE 2 */}
        {task === 1 && (
          <QuestTaskShell
            key="t1"
            taskNumber={2}
            totalTasks={TOTAL_TASKS}
            taskType="question"
            title={ui.t1Title[L]}
            description={ui.t1Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-2">
              {[
                { en: 'A CAVE', pl: 'JASKINIA', correct: false },
                { en: 'A RIVER', pl: 'RZEKA', correct: true },
                { en: 'A PALACE', pl: 'PAŁAC', correct: false },
                { en: 'A LION', pl: 'LEW', correct: false },
              ].map((opt, i) => (
                <QuestButton
                  key={i}
                  onClick={() => {
                    if (opt.correct) {
                      setRiddle2(opt[L]);
                      setMemory('q97_riddle2', opt[L], 97);
                      nextTask();
                    } else {
                      onFail();
                    }
                  }}
                  variant="wood"
                >
                  {opt[L]}
                </QuestButton>
              ))}
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 2: RIDDLE 3 */}
        {task === 2 && (
          <QuestTaskShell
            key="t2"
            taskNumber={3}
            totalTasks={TOTAL_TASKS}
            taskType="question"
            title={ui.t2Title[L]}
            description={ui.t2Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-2">
              {[
                { en: 'YOUR SHADOW', pl: 'TWÓJ CIEŃ', correct: false },
                { en: 'YOUR BREATH', pl: 'TWÓJ ODDECH', correct: true },
                { en: 'A BIRD', pl: 'PTAK', correct: false },
                { en: 'THE WIND', pl: 'WIATR', correct: false },
              ].map((opt, i) => (
                <QuestButton
                  key={i}
                  onClick={() => {
                    if (opt.correct) {
                      setRiddle3(opt[L]);
                      setMemory('q97_riddle3', opt[L], 97);
                      nextTask();
                    } else {
                      onFail();
                    }
                  }}
                  variant="wood"
                >
                  {opt[L]}
                </QuestButton>
              ))}
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 3: ANCIENT CIPHER */}
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
            <RotaryCipherDial
              encryptedText="JLKD"
              expectedShift={5}
              expectedAnswer="EGFY"
              onSolved={() => {
                setMemory('q97_cipher', 'solved', 97);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* TASK 4: SACRED SEAL */}
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
            <SwipePatternLock
              expectedPattern={[4, 0, 4, 1, 4, 2, 4, 5, 4, 8, 4, 7, 4, 6, 4, 3]}
              onUnlock={handleComplete}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

      </AnimatePresence>
    </QuestFrame>
  );
}