import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../hooks/useTranslation';

import CyberButton from '../components/CyberButton';
import HudOverlay from '../components/HudOverlay';
import { CompleteBadgeSvg } from '../components/CornGraphics';
import { ASSETS } from '../constants/assets';
import { QUEST_REGISTRY } from '../quests/questRegistry';

interface Props {
  questId: number;
  onNavigate: (route: string) => void;
}

type QuestState = 'intro' | 'playing' | 'success' | 'fail';

export default function QuestScreen({ questId, onNavigate }: Props) {
  const { t } = useTranslation();

  const quest = useGameStore(s =>
    s.quests.find(q => q.id === questId)
  );

  const completeQuest = useGameStore(s => s.completeQuest);
  const forceCompleteQuest = useGameStore(s => s.forceCompleteQuest);
  const demoMode = useGameStore(s => s.demoMode);

  const isAlreadyCompleted = useGameStore(s =>
    s.isQuestCompleted(questId)
  );

  const [state, setState] = useState<QuestState>('intro');

  const QuestComponent = QUEST_REGISTRY[questId];

  /* RESET STATE ON QUEST CHANGE */
  useEffect(() => {
    setState('intro');
  }, [questId]);

  const handleComplete = () => {
    setState('success');

    if (!isAlreadyCompleted) {
      if (demoMode) {
        forceCompleteQuest(questId);
      } else {
        completeQuest(questId);
      }
    }
  };

  const handleFail = () => {
    setState('fail');
  };

  const renderQuest = () => {
    if (!QuestComponent) {
      return (
        <div className="text-center text-red-500">
          QUEST NOT FOUND: {questId}
        </div>
      );
    }

    return (
      <QuestComponent
        onComplete={handleComplete}
        onFail={handleFail}
      />
    );
  };

  const questIcons = [
    '🚩','📡','🧠','🧩','🎴','⚡','🔐','🔍','📖','⚠️',
    '🔢','🔮','⏱️','🚪','🏁'
  ];

  return (
    <div className="min-h-dvh bg-black pt-16 pb-8 px-4 relative">
      <HudOverlay />

      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <img
          src={ASSETS.backgroundMain}
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
      </div>

      <div className="max-w-lg mx-auto relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 pt-4"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">
              {isAlreadyCompleted ? '✅' : questIcons[questId - 1]}
            </span>

            <span className="font-orbitron text-xs text-white/30">
              CHECKPOINT #{questId}
            </span>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
              {quest?.difficulty || 'unknown'}
            </span>
          </div>

          <h2 className="font-orbitron text-lg font-bold text-yellow-400">
            {quest?.title || `Quest ${questId}`}
          </h2>

          <p className="text-white/30 text-xs mt-1">
            {quest?.points || 0} pkt
          </p>
        </motion.div>

        {/* FLOW */}
        <AnimatePresence mode="wait">

          {/* INTRO */}
          {state === 'intro' && !isAlreadyCompleted && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-corn rounded-2xl p-6"
            >
              <p className="text-white/60 text-sm text-center mb-6">
                {quest?.type || 'Brak typu questa'}
              </p>

              <CyberButton
                onClick={() => setState('playing')}
                className="w-full"
                size="lg"
                icon="▶"
              >
                START
              </CyberButton>
            </motion.div>
          )}

          {/* PLAYING / COMPLETED */}
          {(state === 'playing' || (state === 'intro' && isAlreadyCompleted)) && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-corn rounded-2xl p-6"
            >
              {isAlreadyCompleted ? (
                <div className="text-center space-y-4">
                  <CompleteBadgeSvg size={80} />

                  <p className="text-green-400 font-orbitron">
                    COMPLETED
                  </p>

                  <p className="text-white/40 text-xs">
                    Możesz powtórzyć lub przejść dalej
                  </p>

                  <div className="flex flex-col gap-3">

                    <CyberButton
                      onClick={() => {
                        const next = questId + 1;

                        if (next <= 15) {
                          onNavigate(`quest/${next}`);
                        } else {
                          onNavigate('meta');
                        }
                      }}
                      className="w-full"
                      icon="▶"
                    >
                      GRAJ DALEJ
                    </CyberButton>

                    <CyberButton
                      onClick={() => setState('playing')}
                      variant="secondary"
                      className="w-full"
                    >
                      POWTÓRZ
                    </CyberButton>

                    <CyberButton
                      onClick={() => onNavigate('game')}
                      variant="secondary"
                      className="w-full"
                    >
                      MAPA
                    </CyberButton>

                  </div>
                </div>
              ) : (
                renderQuest()
              )}
            </motion.div>
          )}

          {/* SUCCESS */}
          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="glass-corn rounded-2xl p-8 text-center"
            >
              <CompleteBadgeSvg size={100} />

              <h3 className="text-green-400 font-orbitron mt-4">
                QUEST COMPLETE
              </h3>

              <p className="text-yellow-400">
                +{quest?.points || 0} pkt
              </p>

              <div className="flex gap-3 mt-4">
                {questId < 15 ? (
                  <CyberButton
                    onClick={() => onNavigate(`quest/${questId + 1}`)}
                    className="flex-1"
                  >
                    NEXT
                  </CyberButton>
                ) : (
                  <CyberButton
                    onClick={() => onNavigate('meta')}
                    className="flex-1"
                  >
                    META
                  </CyberButton>
                )}

                <CyberButton
                  onClick={() => onNavigate('game')}
                  variant="secondary"
                  className="flex-1"
                >
                  MAP
                </CyberButton>
              </div>
            </motion.div>
          )}

          {/* FAIL */}
          {state === 'fail' && (
            <motion.div
              key="fail"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="glass-corn rounded-2xl p-8 text-center"
            >
              <div className="text-5xl mb-4">❌</div>

              <h3 className="text-red-500 font-orbitron">
                FAILED
              </h3>

              <CyberButton
                onClick={() => setState('playing')}
                className="w-full mt-4"
              >
                TRY AGAIN
              </CyberButton>
            </motion.div>
          )}

        </AnimatePresence>

        {/* BACK */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('game')}
            className="text-xs text-white/30 hover:text-yellow-400"
          >
            ← MAPA
          </button>
        </div>

      </div>
    </div>
  );
}