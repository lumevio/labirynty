import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore, FINAL_CODE_STRUCTURE } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import MemoryLockInput from '../components/quest-ui/MemoryLockInput';
import SwipePatternLock from '../components/quest-ui/SwipePatternLock';
import MorseCodePuzzle from '../components/quest-ui/MorseCodePuzzle';
import RotaryCipherDial from '../components/quest-ui/RotaryCipherDial';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 12;

type Ending = 'good' | 'neutral' | 'evil' | 'secret';

export default function Quest15Meta({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest,
    completeTask,
    completeQuest,
    addScore,
    codeFragments,
    getMemory,
    setMemory,
    isFinalCodeComplete,
    getFinalCode,
    totalScore,
    gameStartedAt,
    quests,
    hiddenQuestsUnlocked,
    unlockHiddenQuest,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [error, setError] = useState(false);
  const [ending, setEnding] = useState<Ending>('neutral');

  // Boss fight state
  const [bossHP, setBossHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [bossPhase, setBossPhase] = useState<'idle' | 'attacking' | 'defeated'>('idle');
  const [bossSequence, setBossSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [bossRound, setBossRound] = useState(1);
  const [bossPhaseStage, setBossPhaseStage] = useState<'show' | 'input'>('show');

  // Final code state
  const [finalInput, setFinalInput] = useState('');

  // Konami secret
  const [konamiInput, setKonamiInput] = useState<string[]>([]);
  const KONAMI_END = ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT', 'B', 'A'];

  // Victory animation
  const [victoryPhase, setVictoryPhase] = useState(0);

  useEffect(() => {
    initQuest(15, TOTAL_TASKS);
  }, []);

  // Determine ending alignment
  useEffect(() => {
    const alignment = getMemory('q9_alignment');
    const wisdom = parseInt(getMemory('q10_wisdom') || '0');
    const hiddenSecrets = hiddenQuestsUnlocked.length;

    if (hiddenSecrets >= 3) setEnding('secret');
    else if (alignment === 'good' && wisdom >= 3) setEnding('good');
    else if (alignment === 'evil') setEnding('evil');
    else setEnding('neutral');
  }, [task]);

  const nextTask = useCallback(() => {
    completeTask(15, task);
    addScore(50);
    setTask((t) => t + 1);
    setError(false);
  }, [task]);

  const handleVictory = useCallback(() => {
    completeQuest(15);
    setVictoryPhase(1);
    setTimeout(() => setVictoryPhase(2), 2000);
    setTimeout(() => setVictoryPhase(3), 4000);
    setTimeout(() => onComplete(), 6000);
  }, []);

  // Boss battle logic
  const startBossRound = (round: number) => {
    setBossRound(round);
    setBossPhase('attacking');
    setBossPhaseStage('show');
    setPlayerSequence([]);

    const moves = ['ATTACK', 'DEFEND', 'COUNTER', 'DODGE'];
    const seq = Array.from(
      { length: 3 + round },
      () => moves[Math.floor(Math.random() * moves.length)]
    );
    setBossSequence(seq);

    setTimeout(() => setBossPhaseStage('input'), seq.length * 800 + 500);
  };

  const handleBossInput = (move: string) => {
    if (bossPhaseStage !== 'input') return;

    const newSeq = [...playerSequence, move];
    setPlayerSequence(newSeq);

    const idx = newSeq.length - 1;

    if (newSeq[idx] !== bossSequence[idx]) {
      setPlayerHP((hp) => Math.max(0, hp - 25));
      setPlayerSequence([]);

      if (playerHP <= 25) {
        setTimeout(() => onFail(), 1500);
        return;
      }

      setTimeout(() => startBossRound(bossRound), 1500);
      return;
    }

    if (newSeq.length === bossSequence.length) {
      const damage = 25 + bossRound * 10;
      const newBossHP = Math.max(0, bossHP - damage);
      setBossHP(newBossHP);

      if (newBossHP <= 0) {
        setBossPhase('defeated');
        setTimeout(nextTask, 2000);
      } else {
        setTimeout(() => startBossRound(bossRound + 1), 1500);
      }
    }
  };

  // Konami code handler
  const handleKonami = (input: string) => {
    const newInput = [...konamiInput, input];

    if (newInput.length > KONAMI_END.length) {
      newInput.shift();
    }

    setKonamiInput(newInput);

    const matches =
      newInput.length === KONAMI_END.length &&
      newInput.every((d, i) => d === KONAMI_END[i]);

    if (matches) {
      setEnding('secret');
      unlockHiddenQuest(99);
      setMemory('q15_konami_unlocked', 'true', 15);
      setTimeout(nextTask, 1000);
    }
  };

  const elapsedMinutes = gameStartedAt
    ? Math.floor((Date.now() - gameStartedAt) / 60000)
    : 0;

  const completedQuests = Object.values(quests).filter((q) => q.status === 'completed').length;
  const expectedFinalCode = getFinalCode();

  const ui = {
    title: { pl: 'META BOSS — CENTRUM LABIRYNTU', en: 'META BOSS — MAZE CENTER' },

    t0Title: { pl: 'WERYFIKACJA FRAGMENTÓW', en: 'FRAGMENT VERIFICATION' },
    t0Desc: {
      pl: 'System sprawdza, czy zebrałeś wszystkie 5 fragmentów kodu globalnego.',
      en: 'System verifies you collected all 5 global code fragments.',
    },

    t1Title: { pl: 'AKTYWACJA RDZENIA', en: 'CORE ACTIVATION' },
    t1Desc: {
      pl: 'Wpisz finałowy kod złożony z fragmentów: format Q1-Q7-Q12-Q5-Q15',
      en: 'Enter final code from fragments: format Q1-Q7-Q12-Q5-Q15',
    },

    t2Title: { pl: 'OBUDZENIE STRAŻNIKA', en: 'GUARDIAN AWAKENING' },
    t2Desc: {
      pl: 'Strażnik labiryntu się przebudził. Aby przetrwać, musisz zapamiętać i odtworzyć jego sekwencję ataków.',
      en: 'Maze guardian has awakened. To survive, memorize and reproduce its attack sequences.',
    },

    t3Title: { pl: 'SZYFR FINAŁOWY', en: 'FINAL CIPHER' },
    t3Desc: {
      pl: 'Strażnik wysyła ostatnią wiadomość w Morse\'ie. Odszyfruj ją.',
      en: 'Guardian sends final message in Morse. Decode it.',
    },

    t4Title: { pl: 'TARCZA STARCIA', en: 'COLLISION DIAL' },
    t4Desc: {
      pl: 'Ostatni szyfr Cezara. Klucz: Twoja tożsamość z Q9.',
      en: 'Last Caesar cipher. Key: your identity from Q9.',
    },

    t5Title: { pl: 'WZÓR ZAMKNIĘCIA', en: 'SEALING PATTERN' },
    t5Desc: {
      pl: 'Narysuj symbol zamknięcia portalu — pełna gwiazda 9-punktowa.',
      en: 'Draw portal sealing symbol — complete 9-point star.',
    },

    t6Title: { pl: 'BACK-REF: WSZYSTKIE QUESTY', en: 'BACK-REF: ALL QUESTS' },
    t6Desc: {
      pl: 'Połącz pierwsze litery kodów Q3 + Q10 + Q14 dla finałowego klucza.',
      en: 'Combine first letters of Q3 + Q10 + Q14 codes for final key.',
    },

    t7Title: { pl: 'KOD KONAMI?', en: 'KONAMI CODE?' },
    t7Desc: {
      pl: 'Czy znasz prawdziwy kod ukrytego zakończenia? Spróbuj... ↑↑↓↓←→←→BA',
      en: 'Do you know the true secret ending code? Try... ↑↑↓↓←→←→BA',
    },

    t8Title: { pl: 'OSTATECZNA DECYZJA', en: 'FINAL DECISION' },
    t8Desc: {
      pl: 'Wybierz swoje zakończenie. Każda ścieżka prowadzi do innego finału.',
      en: 'Choose your ending. Each path leads to a different finale.',
    },

    t9Title: { pl: 'ANIMACJA PRZEJŚCIA', en: 'TRANSITION ANIMATION' },
    t10Title: { pl: 'EKRAN STATYSTYK', en: 'STATS SCREEN' },
    t11Title: { pl: 'ZAKOŃCZENIE', en: 'ENDING' },
  } as const;

  return (
    <QuestFrame title={`QUEST 15 — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>👑 Q15</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        <span>🌽 BOSS</span>
      </div>

      <AnimatePresence mode="wait">

        {/* TASK 0: FRAGMENT VERIFICATION */}
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
            physicalHint={L === 'pl' ? '📍 CENTRUM LABIRYNTU' : '📍 MAZE CENTER'}
          >
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-[#FFE27A]/40 bg-[#1A0C03] p-4">
                <p className="font-orbitron text-[10px] text-[#C97A3F] tracking-widest mb-3 text-center">
                  {L === 'pl' ? 'STATUS FRAGMENTÓW' : 'FRAGMENT STATUS'}
                </p>

                <div className="space-y-2">
                  {FINAL_CODE_STRUCTURE.positions.map((pos) => {
                    const found = codeFragments.find(
                      (f) => f.questId === pos.questId && f.type === pos.type
                    );

                    return (
                      <div
                        key={`${pos.questId}-${pos.type}`}
                        className={`flex justify-between items-center rounded-lg border px-3 py-2 ${
                          found ? 'border-[#5CBD76] bg-[#5CBD76]/10' : 'border-red-500/40 bg-red-500/10'
                        }`}
                      >
                        <span className="font-orbitron text-[10px] text-[#FFE27A]">
                          Q{pos.questId} — {pos.type.toUpperCase()}
                        </span>
                        <span className={`font-mono text-sm font-bold ${
                          found ? 'text-[#5CBD76]' : 'text-red-400'
                        }`}>
                          {found ? `✅ ${found.fragment}` : '❌ MISSING'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <QuestButton
                onClick={() => {
                  if (isFinalCodeComplete()) {
                    nextTask();
                  } else {
                    setError(true);
                    setTimeout(() => setError(false), 1500);
                  }
                }}
                variant={isFinalCodeComplete() ? 'green' : 'red'}
                disabled={!isFinalCodeComplete()}
              >
                {isFinalCodeComplete()
                  ? L === 'pl' ? '✅ KONTYNUUJ' : '✅ CONTINUE'
                  : L === 'pl' ? '❌ ZA MAŁO FRAGMENTÓW' : '❌ FRAGMENTS MISSING'}
              </QuestButton>

              {error && (
                <p className="text-center text-xs text-red-400 font-mono">
                  ❌ {L === 'pl' ? 'Wróć i ukończ brakujące questy!' : 'Return and complete missing quests!'}
                </p>
              )}
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 1: FINAL CODE INPUT */}
        {task === 1 && (
          <QuestTaskShell
            key="t1"
            taskNumber={2}
            totalTasks={TOTAL_TASKS}
            taskType="code_input"
            title={ui.t1Title[L]}
            description={ui.t1Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-[#FFE27A]/40 bg-[#0D0600] p-4 text-center">
                <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest mb-3">
                  {L === 'pl' ? 'OCZEKIWANY KOD' : 'EXPECTED CODE'}
                </p>
                <p className="font-mono text-2xl font-bold text-[#FFE27A] tracking-[0.4em]">
                  {expectedFinalCode}
                </p>
              </div>

              <input
                type="text"
                value={finalInput}
                onChange={(e) => setFinalInput(e.target.value.toUpperCase())}
                placeholder={L === 'pl' ? 'WPISZ KOD...' : 'ENTER CODE...'}
                className={`w-full bg-[#1A0C03] border-2 rounded-xl p-4 text-center font-mono text-xl font-bold tracking-[0.3em] focus:outline-none transition-colors ${
                  error
                    ? 'border-red-500 text-red-400'
                    : 'border-[#FFE27A] text-[#FFE27A]'
                }`}
              />

              <QuestButton
                onClick={() => {
                  const cleaned = finalInput.replace(/[\s-]/g, '');
                  const expected = expectedFinalCode.replace(/[\s-]/g, '');

                  if (cleaned === expected) {
                    setMemory('q15_final_code_entered', 'true', 15);
                    nextTask();
                  } else {
                    setError(true);
                    setTimeout(() => setError(false), 1500);
                  }
                }}
                variant="gold"
              >
                🔐 {L === 'pl' ? 'AKTYWUJ RDZENIA' : 'ACTIVATE CORE'}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 2: BOSS BATTLE */}
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
            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-red-400">👑 STRAŻNIK</span>
                    <span className="text-red-400">{bossHP}/100</span>
                  </div>
                  <div className="h-3 bg-[#1A0C03] rounded-full overflow-hidden border border-red-500/30">
                    <motion.div
                      animate={{ width: `${bossHP}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-red-700 to-red-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-[#5CBD76]">🌽 GRACZ</span>
                    <span className="text-[#5CBD76]">{playerHP}/100</span>
                  </div>
                  <div className="h-3 bg-[#1A0C03] rounded-full overflow-hidden border border-[#5CBD76]/30">
                    <motion.div
                      animate={{ width: `${playerHP}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-[#5CBD76] to-[#A6E88B]"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-b from-[#5C1A1A] to-[#1A0C03] p-6 text-center">
                <div className="text-7xl mb-3">
                  {bossPhase === 'defeated' ? '💀' : '👹'}
                </div>

                {bossPhase === 'idle' && (
                  <QuestButton onClick={() => startBossRound(1)} variant="red">
                    ⚔ {L === 'pl' ? 'ROZPOCZNIJ WALKĘ' : 'START BATTLE'}
                  </QuestButton>
                )}

                {bossPhase === 'attacking' && (
                  <>
                    <p className="font-orbitron text-[10px] text-red-400 tracking-widest mb-2">
                      {L === 'pl' ? `RUNDA ${bossRound}` : `ROUND ${bossRound}`} —{' '}
                      {bossPhaseStage === 'show'
                        ? L === 'pl' ? 'OBSERWUJ' : 'WATCH'
                        : L === 'pl' ? 'KONTRATAKUJ' : 'COUNTER'}
                    </p>

                    {bossPhaseStage === 'show' && (
                      <div className="flex justify-center gap-2 flex-wrap">
                        {bossSequence.map((move, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.7 }}
                            className="h-12 w-12 rounded-lg border-2 border-red-400 bg-red-500/20 flex items-center justify-center text-2xl"
                          >
                            {move === 'ATTACK' && '⚔'}
                            {move === 'DEFEND' && '🛡'}
                            {move === 'COUNTER' && '⚡'}
                            {move === 'DODGE' && '💨'}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {bossPhase === 'defeated' && (
                  <p className="font-orbitron text-lg font-bold text-[#5CBD76] tracking-widest">
                    🏆 {L === 'pl' ? 'POKONANY!' : 'DEFEATED!'}
                  </p>
                )}
              </div>

              {bossPhase === 'attacking' && bossPhaseStage === 'input' && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ATTACK', icon: '⚔', label: { pl: 'ATAK', en: 'ATTACK' } },
                    { id: 'DEFEND', icon: '🛡', label: { pl: 'BLOK', en: 'DEFEND' } },
                    { id: 'COUNTER', icon: '⚡', label: { pl: 'KONTRA', en: 'COUNTER' } },
                    { id: 'DODGE', icon: '💨', label: { pl: 'UNIK', en: 'DODGE' } },
                  ].map((move) => (
                    <motion.button
                      key={move.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleBossInput(move.id)}
                      className="h-16 rounded-xl border-2 border-[#8B4513]/50 bg-[#1A0C03] flex flex-col items-center justify-center active:bg-[#FFE27A]/20"
                    >
                      <span className="text-2xl">{move.icon}</span>
                      <span className="font-orbitron text-[9px] text-[#FFE27A] tracking-widest mt-1">
                        {move.label[L]}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 3: MORSE FINAL */}
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
            <MorseCodePuzzle
              encodedWord="HOPE"
              expectedAnswer="HOPE"
              hint={L === 'pl' ? '4 litery — uczucie strażnika' : '4 letters — guardian feeling'}
              onSolved={() => {
                setMemory('q15_morse_decoded', 'HOPE', 15);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* TASK 4: CIPHER FINAL */}
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
            <RotaryCipherDial
              encryptedText="ZHHK"
              expectedShift={19}
              expectedAnswer="GOOD"
              onSolved={() => {
                setMemory('q15_cipher_decoded', 'GOOD', 15);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* TASK 5: SEALING PATTERN */}
        {task === 5 && (
          <QuestTaskShell
            key="t5"
            taskNumber={6}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={ui.t5Title[L]}
            description={ui.t5Desc[L]}
            isActive
            isCompleted={false}
          >
            <SwipePatternLock
              expectedPattern={[0, 1, 2, 5, 8, 7, 6, 3, 0]}
              onUnlock={() => {
                setMemory('q15_pattern_sealed', 'true', 15);
                nextTask();
              }}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* TASK 6: TRIPLE BACK-REF */}
        {task === 6 && (
          <QuestTaskShell
            key="t6"
            taskNumber={7}
            totalTasks={TOTAL_TASKS}
            taskType="memory_lock"
            title={ui.t6Title[L]}
            description={ui.t6Desc[L]}
            isActive
            isCompleted={false}
          >
            <MemoryLockInput
              memoryKey="q15_triple_combo"
              expectedValue="CTG"
              sourceQuest={3}
              hint={L === 'pl'
                ? 'C (Q3 CORN) + T (Q10 TRAP) + G (Q14 GATE)'
                : 'C (Q3 CORN) + T (Q10 TRAP) + G (Q14 GATE)'}
              onUnlock={nextTask}
              onFail={onFail}
              lang={L}
            />
          </QuestTaskShell>
        )}

        {/* TASK 7: KONAMI SECRET */}
        {task === 7 && (
          <QuestTaskShell
            key="t7"
            taskNumber={8}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={ui.t7Title[L]}
            description={ui.t7Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-4">
              <div className="bg-[#1A0C03] rounded-xl border border-[#8B4513]/30 p-3">
                <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest mb-2 text-center">
                  {L === 'pl' ? 'TWOJA SEKWENCJA' : 'YOUR SEQUENCE'}
                </p>
                <p className="text-center font-mono text-xl text-[#FFE27A] tracking-widest min-h-[36px]">
                  {konamiInput.map((d) => {
                    switch (d) {
                      case 'UP': return '↑';
                      case 'DOWN': return '↓';
                      case 'LEFT': return '←';
                      case 'RIGHT': return '→';
                      case 'A': return 'A';
                      case 'B': return 'B';
                      default: return '';
                    }
                  }).join(' ')}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                <div />
                <QuestButton onClick={() => handleKonami('UP')} variant="wood">↑</QuestButton>
                <div />
                <QuestButton onClick={() => handleKonami('LEFT')} variant="wood">←</QuestButton>
                <QuestButton onClick={() => setKonamiInput([])} variant="red">✕</QuestButton>
                <QuestButton onClick={() => handleKonami('RIGHT')} variant="wood">→</QuestButton>
                <div />
                <QuestButton onClick={() => handleKonami('DOWN')} variant="wood">↓</QuestButton>
                <div />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <QuestButton onClick={() => handleKonami('B')} variant="gold">B</QuestButton>
                <QuestButton onClick={() => handleKonami('A')} variant="gold">A</QuestButton>
              </div>

              <QuestButton onClick={nextTask} variant="wood">
                ⏭ {L === 'pl' ? 'POMIŃ (BRAK SEKRETU)' : 'SKIP (NO SECRET)'}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 8: ENDING CHOICE */}
        {task === 8 && (
          <QuestTaskShell
            key="t8"
            taskNumber={9}
            totalTasks={TOTAL_TASKS}
            taskType="question"
            title={ui.t8Title[L]}
            description={ui.t8Desc[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-[#FFE27A]/40 bg-[#1A0C03] p-4 text-center">
                <p className="font-orbitron text-[10px] text-[#C97A3F] tracking-widest mb-2">
                  {L === 'pl' ? 'PROPONOWANE ZAKOŃCZENIE' : 'SUGGESTED ENDING'}
                </p>
                <p className={`font-orbitron text-xl font-bold tracking-widest ${
                  ending === 'good' ? 'text-[#5CBD76]' :
                  ending === 'evil' ? 'text-red-400' :
                  ending === 'secret' ? 'text-purple-400' :
                  'text-[#FFE27A]'
                }`}>
                  {ending === 'good' && (L === 'pl' ? '😇 DOBRE' : '😇 GOOD')}
                  {ending === 'evil' && (L === 'pl' ? '😈 ZŁE' : '😈 EVIL')}
                  {ending === 'neutral' && (L === 'pl' ? '🧭 NEUTRALNE' : '🧭 NEUTRAL')}
                  {ending === 'secret' && (L === 'pl' ? '🌟 SEKRETNE' : '🌟 SECRET')}
                </p>
              </div>

              <QuestButton
                onClick={() => {
                  setMemory('q15_chosen_ending', ending, 15);
                  nextTask();
                }}
                variant="gold"
              >
                ⚡ {L === 'pl' ? 'ZAAKCEPTUJ ZAKOŃCZENIE' : 'ACCEPT ENDING'}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 9: TRANSITION */}
        {task === 9 && (
          <QuestTaskShell
            key="t9"
            taskNumber={10}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={ui.t9Title[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-6 text-center">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="text-8xl"
              >
                🌀
              </motion.div>

              <p className="font-orbitron text-lg font-bold tracking-widest text-[#FFE27A]">
                {L === 'pl' ? 'PORTAL OTWIERA SIĘ...' : 'PORTAL OPENING...'}
              </p>

              <QuestButton onClick={nextTask} variant="green">
                ⚡ {L === 'pl' ? 'WEJDŹ' : 'ENTER'}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 10: STATS SCREEN */}
        {task === 10 && (
          <QuestTaskShell
            key="t10"
            taskNumber={11}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={ui.t10Title[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-[#FFE27A]/40 bg-[#1A0C03] p-4">
                <p className="font-orbitron text-xs text-[#FFE27A] tracking-widest mb-3 text-center">
                  📊 {L === 'pl' ? 'STATYSTYKI ROZGRYWKI' : 'GAMEPLAY STATS'}
                </p>

                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between border-b border-[#8B4513]/30 pb-1">
                    <span className="text-[#C97A3F]">{L === 'pl' ? 'Czas gry' : 'Play time'}:</span>
                    <span className="text-[#FFE27A] font-bold">{elapsedMinutes} min</span>
                  </div>
                  <div className="flex justify-between border-b border-[#8B4513]/30 pb-1">
                    <span className="text-[#C97A3F]">{L === 'pl' ? 'Punkty' : 'Score'}:</span>
                    <span className="text-[#FFE27A] font-bold">{totalScore}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#8B4513]/30 pb-1">
                    <span className="text-[#C97A3F]">{L === 'pl' ? 'Ukończone questy' : 'Completed quests'}:</span>
                    <span className="text-[#FFE27A] font-bold">{completedQuests}/15</span>
                  </div>
                  <div className="flex justify-between border-b border-[#8B4513]/30 pb-1">
                    <span className="text-[#C97A3F]">{L === 'pl' ? 'Zebrane fragmenty' : 'Collected fragments'}:</span>
                    <span className="text-[#FFE27A] font-bold">{codeFragments.length}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#8B4513]/30 pb-1">
                    <span className="text-[#C97A3F]">{L === 'pl' ? 'Sekrety' : 'Secrets'}:</span>
                    <span className="text-purple-400 font-bold">{hiddenQuestsUnlocked.length}/3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#C97A3F]">{L === 'pl' ? 'Tożsamość' : 'Identity'}:</span>
                    <span className={`font-bold ${
                      ending === 'good' ? 'text-[#5CBD76]' :
                      ending === 'evil' ? 'text-red-400' :
                      ending === 'secret' ? 'text-purple-400' :
                      'text-[#FFE27A]'
                    }`}>
                      {ending.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <QuestButton onClick={nextTask} variant="green">
                ⚡ {L === 'pl' ? 'ZOBACZ ZAKOŃCZENIE' : 'SEE ENDING'}
              </QuestButton>
            </div>
          </QuestTaskShell>
        )}

        {/* TASK 11: FINAL ENDING */}
        {task === 11 && (
          <QuestTaskShell
            key="t11"
            taskNumber={12}
            totalTasks={TOTAL_TASKS}
            taskType="puzzle"
            title={ui.t11Title[L]}
            isActive
            isCompleted={false}
          >
            <div className="space-y-6 text-center">
              <motion.div
                animate={{
                  rotate: ending === 'secret' ? [0, 360] : [0, 10, -10, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: ending === 'secret' ? 8 : 3,
                  repeat: Infinity,
                  ease: ending === 'secret' ? 'linear' : 'easeInOut',
                }}
                className="text-8xl"
              >
                {ending === 'good' && '🌟'}
                {ending === 'evil' && '🌑'}
                {ending === 'neutral' && '🏆'}
                {ending === 'secret' && '✨'}
              </motion.div>

              <h2 className={`font-orbitron text-2xl font-black tracking-[0.2em] ${
                ending === 'good' ? 'text-[#5CBD76]' :
                ending === 'evil' ? 'text-red-400' :
                ending === 'secret' ? 'text-purple-400' :
                'text-[#FFE27A]'
              }`}>
                {ending === 'good' && (L === 'pl' ? 'BOHATER LABIRYNTU' : 'MAZE HERO')}
                {ending === 'evil' && (L === 'pl' ? 'MROCZNY WŁADCA' : 'DARK LORD')}
                {ending === 'neutral' && (L === 'pl' ? 'MISTRZ KUKURYDZY' : 'CORN MASTER')}
                {ending === 'secret' && (L === 'pl' ? 'PRAWDZIWY ODKRYWCA' : 'TRUE EXPLORER')}
              </h2>

              <div className="rounded-xl border-2 border-[#FFE27A]/40 bg-[#1A0C03] p-4 text-left">
                <p className="font-mono text-xs text-[#FFE27A]/80 leading-relaxed italic">
                  "{(() => {
                    if (ending === 'good') {
                      return L === 'pl'
                        ? 'Twoja dobroć i mądrość zostały wynagrodzone. Labirynt pamięta każdy Twój gest pomocy.'
                        : 'Your kindness and wisdom were rewarded. The maze remembers every gesture of help.';
                    }
                    if (ending === 'evil') {
                      return L === 'pl'
                        ? 'Wybrałeś ścieżkę chaosu. Labirynt zapamiętał każdą zdradę.'
                        : 'You chose the path of chaos. The maze noted every betrayal.';
                    }
                    if (ending === 'secret') {
                      return L === 'pl'
                        ? 'Odkryłeś coś, czego nikt wcześniej nie znalazł. Jesteś jednym z nielicznych.'
                        : 'You discovered something no one found before. You are one of the few.';
                    }
                    return L === 'pl'
                      ? 'Przeszedłeś labirynt z honorem. Twoja przygoda dobiegła końca.'
                      : 'You passed the maze with honor. Your adventure has ended.';
                  })()}"
                </p>
              </div>

              <div className="rounded-2xl border-2 border-[#FFE27A] bg-[#0D0600] p-4">
                <p className="font-orbitron text-[9px] tracking-widest text-[#C97A3F] mb-2">
                  {L === 'pl' ? 'KOD FINALNY' : 'FINAL CODE'}
                </p>
                <p className="font-mono text-xl font-bold text-[#FFE27A] tracking-[0.4em]">
                  {expectedFinalCode}
                </p>
              </div>

              <QuestButton onClick={handleVictory} variant="gold">
                🏁 {L === 'pl' ? 'ZAKOŃCZ GRĘ' : 'END GAME'}
              </QuestButton>
            </div>

            {victoryPhase > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="text-9xl"
                  >
                    🌽
                  </motion.div>

                  {victoryPhase >= 2 && (
                    <h1 className="font-orbitron text-4xl font-black tracking-[0.3em] text-[#FFE27A]">
                      {L === 'pl' ? 'ZWYCIĘSTWO!' : 'VICTORY!'}
                    </h1>
                  )}

                  {victoryPhase >= 3 && (
                    <p className="font-mono text-sm text-[#FFE27A]/70">
                      LABIRYNTZATOR ZATOR 🌽
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </QuestTaskShell>
        )}

      </AnimatePresence>
    </QuestFrame>
  );
}