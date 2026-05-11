import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useGameStore } from '../../systems/GameState';
import QuestFrame from '../../components/quest-ui/QuestFrame';
import QuestButton from '../../components/quest-ui/QuestButton';
import QuestTaskShell from '../../components/quest-ui/QuestTaskShell';
import AudioFrequencyTuner from '../../components/quest-ui/AudioFrequencyTuner';
import type { StandardQuestProps } from '../../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 4;

export default function Quest98CornWhisperer({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const { addScore, setMemory, unlockHiddenQuest } = useGameStore();

  const [task, setTask] = useState(0);
  const [cornsRevealed, setCornsRevealed] = useState<number[]>([]);
  const [seasonAnswer, setSeasonAnswer] = useState<string | null>(null);

  const cornGrid = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    isMystic: [3, 7, 11, 15, 19].includes(i), // 5 mystic corns
  }));

  const nextTask = useCallback(() => {
    addScore(75);
    setTask((t) => t + 1);
  }, []);

  const handleComplete = useCallback(() => {
    unlockHiddenQuest(98);
    setMemory('q98_corn_master', 'true', 98);
    onComplete();
  }, []);

  const ui = {
    title: { pl: '🌽 SZEPTACZ KUKURYDZY', en: '🌽 CORN WHISPERER' },

    t0Title: { pl: 'WYBÓR MISTYCZNYCH KOLB', en: 'MYSTIC COB SELECTION' },
    t0Desc: {
      pl: 'Z 25 kolb tylko 5 jest mistycznych. Wybierz wszystkie 5. Tylko intuicja Cię prowadzi.',
      en: 'Of 25 cobs only 5 are mystic. Select all 5. Only intuition guides you.',
    },

    t1Title: { pl: 'PIEŚŃ ŻNIWNA', en: 'HARVEST SONG' },
    t1Desc: {
      pl: 'Znajdź harmoniczną częstotliwość kukurydzianej pieśni. Włącz dźwięk.',
      en: 'Find harmonic frequency of corn song. Enable sound.',
    },

    t2Title: { pl: 'ZAGADKA SEZONÓW', en: 'SEASONS RIDDLE' },
    t2Desc: {
      pl: 'W którym sezonie kukurydza jest gotowa do zbioru?',
      en: 'In which season is corn ready for harvest?',
    },

    t3Title: { pl: 'BŁOGOSŁAWIEŃSTWO', en: 'BLESSING' },
    t3Desc: {
      pl: 'Wyrecytuj słowa wdzięczności wobec ziemi.',
      en: 'Recite words of gratitude to the earth.',
    },
  } as const;

  return (
    <QuestFrame title={`SECRET — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-yellow-400/60 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg border border-yellow-500/20">
        <span>🌽 HIDDEN</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        <span>🌾 SECRET</span>
      </div>

      <AnimatePresence mode="wait">

        {/* TASK 0: MYSTIC CORN GRID */}
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
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-1.5">
                {cornGrid.map((corn) => {
                  const isRevealed = cornsRevealed.includes(corn.id);
                  const showResult = cornsRevealed.length >= 5;

                  return (
                    <motion.button
                      key={corn.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (cornsRevealed.length >= 5 || isRevealed) return;
                        setCornsRevealed((prev) => [...prev, corn.id]);

                        if (cornsRevealed.length === 4) {
                          setTimeout(() => {
                            const correctSelections = [...cornsRevealed, corn.id]
                              .filter((id) => cornGrid[id].isMystic).length;

                            if (correctSelections >= 4) {
                              setMemory('q98_mystic_found', 'true', 98);
                              nextTask();
                            } else {
                              onFail();
                            }
                          }, 1000);
                        }
                      }}
                      className={`
                        h-12 rounded-lg border text-xl flex items-center justify-center
                        transition-colors
                        ${isRevealed
                          ? showResult && corn.isMystic
                            ? 'border-[#5CBD76] bg-[#5CBD76]/30'
                            : showResult
                              ? 'border-red-500 bg-red-500/30'
                              : 'border-yellow-500 bg-yellow-500/20'
                          : 'border-[#8B4513]/40 bg-[#1A0C03]'
                        }
                      `}
                    >
                      {isRevealed ? '🌽' : '?'}
                    </motion.button>
                  );
                })}
              </div>

              <p className="text-center text-xs font-mono text-yellow-400">
                {cornsRevealed.length}/5
              </p>
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 1: HARVEST FREQUENCY */}
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
              targetFrequency={528}
              tolerance={15}
              onTuned={() => {
                setMemory('q98_song_528', 'true', 98);
                nextTask();
              }}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* TASK 2: SEASONS RIDDLE */}
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
                { id: 'spring', emoji: '🌸', label: { pl: 'WIOSNA', en: 'SPRING' } },
                { id: 'summer', emoji: '☀️', label: { pl: 'LATO', en: 'SUMMER' } },
                { id: 'autumn', emoji: '🍂', label: { pl: 'JESIEŃ', en: 'AUTUMN' } },
                { id: 'winter', emoji: '❄️', label: { pl: 'ZIMA', en: 'WINTER' } },
              ].map((season) => (
                <QuestButton
                  key={season.id}
                  onClick={() => {
                    setSeasonAnswer(season.id);
                    if (season.id === 'autumn') {
                      setMemory('q98_season', 'AUTUMN', 98);
                      nextTask();
                    } else {
                      onFail();
                    }
                  }}
                  variant={season.id === 'autumn' ? 'gold' : 'wood'}
                >
                  {season.emoji} {season.label[L]}
                </QuestButton>
              ))}
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 3: BLESSING */}
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
            <div className="space-y-4 text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl"
              >
                🌽✨
              </motion.div>

              <input
                type="text"
                placeholder={L === 'pl' ? 'DZIĘKUJĘ...' : 'THANK YOU...'}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (val === (L === 'pl' ? 'DZIĘKUJĘ' : 'THANK YOU')) {
                    setTimeout(handleComplete, 1500);
                  }
                }}
                className="
                  w-full bg-[#1A0C03] border-2 border-yellow-500
                  rounded-xl p-3 text-center font-mono text-lg font-bold
                  text-yellow-300 tracking-[0.3em]
                  focus:outline-none focus:shadow-[0_0_20px_rgba(255,215,0,0.5)]
                "
              />
            </div>
          </QuestTaskShell>
        )}

      </AnimatePresence>
    </QuestFrame>
  );
}