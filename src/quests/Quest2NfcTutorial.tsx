import { useState, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 8;
const CODE_FRAGMENT_COLOR = 'RED';
const HIDDEN_PANEL_CODE = '4821';

type ScanPoint = {
  id: string;
  name: { pl: string; en: string };
  location: { pl: string; en: string };
  symbol: string;
  scanned: boolean;
};

export default function Quest2NfcTutorial({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest, completeTask, completeQuest,
    addCodeFragment, setMemory, addScore,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [scanPoints, setScanPoints] = useState<ScanPoint[]>([
    {
      id: 'alpha',
      name: { pl: 'PUNKT ALPHA', en: 'POINT ALPHA' },
      location: { pl: 'Słupek przy wejściu', en: 'Post near entrance' },
      symbol: '⚡',
      scanned: false,
    },
    {
      id: 'beta',
      name: { pl: 'PUNKT BETA', en: 'POINT BETA' },
      location: { pl: 'Drzewo z czerwoną wstążką', en: 'Tree with red ribbon' },
      symbol: '🔴',
      scanned: false,
    },
    {
      id: 'gamma',
      name: { pl: 'PUNKT GAMMA', en: 'POINT GAMMA' },
      location: { pl: 'Skrzynka przy ławce', en: 'Box near the bench' },
      symbol: '📦',
      scanned: false,
    },
  ]);
  const [colorSequence, setColorSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [sequencePhase, setSequencePhase] = useState<'show' | 'input' | 'done'>('show');
  const [signalStrength, setSignalStrength] = useState(0);
  const [calibrationTarget, setCalibrationTarget] = useState(75);
  const [calibrationValue, setCalibrationValue] = useState(50);
  const [panelCode, setPanelCode] = useState('');
  const [hiddenPanelFound, setHiddenPanelFound] = useState(false);
  const [compassDirection, setCompassDirection] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => { initQuest(2, TOTAL_TASKS); }, []);

  // Color sequence generation
  useEffect(() => {
    if (task === 3) {
      const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
      const seq = Array.from({ length: 5 }, () =>
        colors[Math.floor(Math.random() * colors.length)]
      );
      setColorSequence(seq);
      setSequencePhase('show');

      // Auto-hide after 4 seconds
      setTimeout(() => setSequencePhase('input'), 4000);
    }
  }, [task]);

  // Signal strength simulator
  useEffect(() => {
    if (task !== 5) return;

    const interval = setInterval(() => {
      setSignalStrength((prev) => {
        const drift = (Math.random() - 0.5) * 15;
        return Math.max(0, Math.min(100, prev + drift));
      });
    }, 200);

    return () => clearInterval(interval);
  }, [task]);

  const nextTask = useCallback(() => {
    completeTask(2, task);
    addScore(15);
    setTask((t) => t + 1);
    setError(false);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(2);
    addCodeFragment({
      questId: 2,
      fragment: CODE_FRAGMENT_COLOR,
      type: 'color',
      discoveredAt: Date.now(),
    });
    setMemory('q2_color', CODE_FRAGMENT_COLOR, 2);
    setMemory('q2_panel_code', HIDDEN_PANEL_CODE, 2);
    onComplete();
  }, []);

  const t = {
    title: { pl: 'TRENING NFC', en: 'NFC TRAINING' },

    t0Title: { pl: 'ORIENTACJA W TERENIE', en: 'FIELD ORIENTATION' },
    t0Desc: {
      pl: 'Stoisz w STREFIE NFC ALPHA. Rozejrzyj się i określ, w którym kierunku świata widzisz CZERWONĄ flagę na szczycie masztu.',
      en: 'You are in NFC ALPHA ZONE. Look around and determine in which cardinal direction you see a RED flag on top of the mast.',
    },

    t1Title: { pl: 'SKANOWANIE WIELOPUNKTOWE', en: 'MULTI-POINT SCANNING' },
    t1Desc: {
      pl: 'Znajdź i zeskanuj 3 punkty NFC w tej strefie. Każdy jest oznaczony innym symbolem. Musisz je znaleźć fizycznie!',
      en: 'Find and scan 3 NFC points in this zone. Each is marked with a different symbol. You must find them physically!',
    },

    t2Title: { pl: 'ANALIZA SYGNAŁÓW', en: 'SIGNAL ANALYSIS' },
    t2Desc: {
      pl: 'Które z poniższych zdań o systemie NFC jest FAŁSZYWE? Odpowiedź znajduje się na tabliczce informacyjnej obok punktu BETA.',
      en: 'Which of the following statements about NFC is FALSE? The answer is on the info board next to point BETA.',
    },

    t3Title: { pl: 'SEKWENCJA KOLORÓW', en: 'COLOR SEQUENCE' },
    t3Desc: {
      pl: 'Zapamiętaj sekwencję kolorów migających na ekranie, a następnie odtwórz ją z pamięci. Ta sekwencja będzie potrzebna w późniejszych questach!',
      en: 'Memorize the color sequence flashing on screen, then reproduce it from memory. This sequence will be needed in later quests!',
    },

    t4Title: { pl: 'KALIBRACJA SENSORA', en: 'SENSOR CALIBRATION' },
    t4Desc: {
      pl: 'Ustaw siłę sygnału dokładnie na wartość docelową. Przytrzymaj przycisk, aby zwiększyć moc. Puść, gdy osiągniesz cel.',
      en: 'Set signal strength exactly to the target value. Hold button to increase power. Release when you reach the target.',
    },

    t5Title: { pl: 'ZAKŁÓCENIA SYGNAŁU', en: 'SIGNAL INTERFERENCE' },
    t5Desc: {
      pl: 'Sygnał jest niestabilny! Kliknij DOKŁADNIE w momencie, gdy wskaźnik osiągnie zieloną strefę (70-80%). Masz 3 próby.',
      en: 'Signal is unstable! Click EXACTLY when the indicator reaches the green zone (70-80%). You have 3 attempts.',
    },

    t6Title: { pl: 'UKRYTY PANEL', en: 'HIDDEN PANEL' },
    t6Desc: {
      pl: 'W LEWYM ROGU tej strefy znajduje się ukryta tabliczka z 4-cyfrowym kodem. Musisz ją fizycznie znaleźć i odczytać kod. UWAGA: Ten kod będzie wymagany w Queście 7!',
      en: 'In the LEFT CORNER of this zone there is a hidden sign with a 4-digit code. You must physically find it and read the code. NOTE: This code will be required in Quest 7!',
    },

    t7Title: { pl: 'FRAGMENT ODKRYTY', en: 'FRAGMENT DISCOVERED' },
  } as const;

  const colorMap: Record<string, string> = {
    RED: 'bg-red-500',
    BLUE: 'bg-blue-500',
    GREEN: 'bg-green-500',
    YELLOW: 'bg-yellow-500',
  };

  return (
    <QuestFrame title={`QUEST 2 — ${t.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>📡 Q2</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        <span>📶 NFC TRAINING</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: COMPASS ORIENTATION ============ */}
        <QuestTaskShell
          key="t0"
          taskNumber={1}
          totalTasks={TOTAL_TASKS}
          taskType="observation"
          title={t.t0Title[L]}
          description={t.t0Desc[L]}
          isActive={task === 0}
          isCompleted={task > 0}
          physicalHint={L === 'pl' ? '📍 STREFA NFC ALPHA — OBRÓĆ SIĘ O 360°' : '📍 NFC ALPHA ZONE — TURN 360°'}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { dir: 'N', label: { pl: 'PÓŁNOC', en: 'NORTH' } },
                { dir: 'E', label: { pl: 'WSCHÓD', en: 'EAST' } },
                { dir: 'S', label: { pl: 'POŁUDNIE', en: 'SOUTH' } },
                { dir: 'W', label: { pl: 'ZACHÓD', en: 'WEST' } },
              ].map(({ dir, label }) => (
                <QuestButton
                  key={dir}
                  onClick={() => {
                    setCompassDirection(dir);
                    if (dir === 'E') {
                      setMemory('q2_compass', dir, 2);
                      setTimeout(nextTask, 500);
                    } else {
                      setError(true);
                      setTimeout(() => setError(false), 800);
                    }
                  }}
                  variant={compassDirection === dir ? 'gold' : 'wood'}
                >
                  <span className="block text-lg">🧭</span>
                  <span className="block text-[9px] mt-1">{dir}</span>
                </QuestButton>
              ))}
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Obróć się i szukaj CZERWONEJ flagi' : 'Turn around and look for the RED flag'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 1: MULTI-POINT NFC SCAN ============ */}
        <QuestTaskShell
          key="t1"
          taskNumber={2}
          totalTasks={TOTAL_TASKS}
          taskType="physical"
          title={t.t1Title[L]}
          description={t.t1Desc[L]}
          isActive={task === 1}
          isCompleted={task > 1}
          physicalHint={L === 'pl' ? '📍 EKSPLORUJ CAŁĄ STREFĘ ALPHA' : '📍 EXPLORE ENTIRE ALPHA ZONE'}
        >
          <div className="space-y-3">
            {scanPoints.map((point, idx) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={`
                  rounded-xl border-2 p-3 flex items-center justify-between
                  ${point.scanned
                    ? 'border-[#5CBD76] bg-[#1F3D1C]/50'
                    : 'border-[#8B4513]/50 bg-[#1A0C03]/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{point.symbol}</span>
                  <div>
                    <p className="font-orbitron text-[10px] text-[#FFE27A] tracking-wider">
                      {point.name[L]}
                    </p>
                    <p className="text-[9px] text-[#C97A3F]">{point.location[L]}</p>
                  </div>
                </div>

                {point.scanned ? (
                  <span className="text-[#5CBD76] font-orbitron text-[10px]">✅</span>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setScanPoints((prev) =>
                        prev.map((p) =>
                          p.id === point.id ? { ...p, scanned: true } : p
                        )
                      );
                    }}
                    className="
                      px-3 py-1.5 rounded-lg border border-[#FFE27A]/30
                      bg-[#FFE27A]/10 font-orbitron text-[9px]
                      text-[#FFE27A] tracking-wider
                    "
                  >
                    SCAN
                  </motion.button>
                )}
              </motion.div>
            ))}

            {scanPoints.every((p) => p.scanned) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <QuestButton onClick={nextTask} variant="green">
                  ✅ {L === 'pl' ? 'WSZYSTKIE PUNKTY ZESKANOWANE' : 'ALL POINTS SCANNED'}
                </QuestButton>
              </motion.div>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 2: NFC KNOWLEDGE QUIZ ============ */}
        <QuestTaskShell
          key="t2"
          taskNumber={3}
          totalTasks={TOTAL_TASKS}
          taskType="question"
          title={t.t2Title[L]}
          description={t.t2Desc[L]}
          isActive={task === 2}
          isCompleted={task > 2}
          physicalHint={L === 'pl' ? '📍 TABLICZKA INFORMACYJNA OBOK PUNKTU BETA' : '📍 INFO BOARD NEXT TO POINT BETA'}
        >
          <div className="space-y-2">
            {[
              { pl: 'NFC działa na krótki dystans (do 10cm)', en: 'NFC works at short range (up to 10cm)' },
              { pl: 'NFC wymaga baterii w tagu', en: 'NFC requires battery in the tag' },
              { pl: 'NFC może przesyłać małe ilości danych', en: 'NFC can transfer small amounts of data' },
              { pl: 'NFC jest używane w kartach płatniczych', en: 'NFC is used in payment cards' },
            ].map((answer, i) => (
              <QuestButton
                key={i}
                onClick={() => {
                  if (i === 1) {
                    setMemory('q2_nfc_knowledge', 'verified', 2);
                    nextTask();
                  } else {
                    setError(true);
                    setTimeout(() => setError(false), 800);
                  }
                }}
                variant="wood"
              >
                {answer[L]}
              </QuestButton>
            ))}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Sprawdź tabliczkę przy BETA!' : 'Check the board near BETA!'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 3: COLOR SEQUENCE MEMORY ============ */}
        <QuestTaskShell
          key="t3"
          taskNumber={4}
          totalTasks={TOTAL_TASKS}
          taskType="memory_lock"
          title={t.t3Title[L]}
          description={t.t3Desc[L]}
          isActive={task === 3}
          isCompleted={task > 3}
        >
          <div className="space-y-4">
            {sequencePhase === 'show' && (
              <div className="space-y-3 text-center">
                <p className="font-orbitron text-[10px] text-[#FFE27A]/60 animate-pulse tracking-widest">
                  {L === 'pl' ? 'ZAPAMIĘTAJ SEKWENCJĘ...' : 'MEMORIZE SEQUENCE...'}
                </p>

                <div className="flex justify-center gap-2">
                  {colorSequence.map((color, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.6 }}
                      className={`h-12 w-12 rounded-xl border-2 border-white/20 ${colorMap[color]}`}
                    />
                  ))}
                </div>

                <div className="w-full h-1 bg-[#1A0C03] rounded-full overflow-hidden mt-3">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 4, ease: 'linear' }}
                    className="h-full bg-[#FFE27A]"
                  />
                </div>
              </div>
            )}

            {sequencePhase === 'input' && (
              <div className="space-y-3">
                <p className="text-center font-orbitron text-[10px] text-[#FFE27A]/60 tracking-widest">
                  {L === 'pl' ? 'ODTWÓRZ SEKWENCJĘ' : 'REPRODUCE SEQUENCE'}
                </p>

                {/* Selected colors */}
                <div className="flex justify-center gap-2 min-h-[48px]">
                  {playerSequence.map((color, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`h-10 w-10 rounded-lg border border-white/20 ${colorMap[color]}`}
                    />
                  ))}
                  {Array.from({ length: colorSequence.length - playerSequence.length }).map((_, i) => (
                    <div key={`empty-${i}`}
                      className="h-10 w-10 rounded-lg border-2 border-dashed border-[#8B4513]/30"
                    />
                  ))}
                </div>

                {/* Color buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {['RED', 'BLUE', 'GREEN', 'YELLOW'].map((color) => (
                    <motion.button
                      key={color}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        const newSeq = [...playerSequence, color];
                        setPlayerSequence(newSeq);

                        if (newSeq.length === colorSequence.length) {
                          const correct = newSeq.every((c, i) => c === colorSequence[i]);

                          if (correct) {
                            setMemory('q2_color_sequence', colorSequence.join(','), 2);
                            setSequencePhase('done');
                            setTimeout(nextTask, 800);
                          } else {
                            setPlayerSequence([]);
                            setError(true);
                            setTimeout(() => setError(false), 1000);
                          }
                        }
                      }}
                      className={`h-14 rounded-xl border-2 border-white/20 ${colorMap[color]} 
                        active:brightness-150 transition-all`}
                    />
                  ))}
                </div>

                {/* Undo button */}
                {playerSequence.length > 0 && (
                  <QuestButton
                    onClick={() => setPlayerSequence((prev) => prev.slice(0, -1))}
                    variant="red"
                  >
                    ↩ {L === 'pl' ? 'COFNIJ' : 'UNDO'}
                  </QuestButton>
                )}

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs text-red-400 font-mono text-center">
                    ❌ {L === 'pl' ? 'Błędna sekwencja! Spróbuj ponownie.' : 'Wrong sequence! Try again.'}
                  </motion.p>
                )}
              </div>
            )}

            {sequencePhase === 'done' && (
              <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="text-center text-[#5CBD76] font-orbitron text-sm">
                ✅ {L === 'pl' ? 'SEKWENCJA POPRAWNA!' : 'SEQUENCE CORRECT!'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 4: SIGNAL CALIBRATION (hold button) ============ */}
        <QuestTaskShell
          key="t4"
          taskNumber={5}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={t.t4Title[L]}
          description={t.t4Desc[L]}
          isActive={task === 4}
          isCompleted={task > 4}
        >
          <div className="space-y-4">
            <div className="text-center">
              <span className="font-orbitron text-[10px] text-[#C97A3F] tracking-widest">
                {L === 'pl' ? 'CEL' : 'TARGET'}: {calibrationTarget}%
              </span>
            </div>

            {/* Gauge */}
            <div className="relative h-8 bg-[#1A0C03] rounded-full border border-[#3D1F08] overflow-hidden">
              {/* Target zone */}
              <div
                className="absolute top-0 bottom-0 bg-[#5CBD76]/20 border-x border-[#5CBD76]/50"
                style={{
                  left: `${calibrationTarget - 5}%`,
                  width: '10%',
                }}
              />

              {/* Current value */}
              <motion.div
                className="absolute top-0 bottom-0 w-1 bg-[#FFE27A]"
                animate={{ left: `${calibrationValue}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="text-center font-mono text-lg text-[#FFE27A] font-bold">
              {calibrationValue}%
            </div>

            {/* Control buttons */}
            <div className="grid grid-cols-3 gap-2">
              <QuestButton
                onClick={() => setCalibrationValue((v) => Math.max(0, v - 5))}
                variant="wood"
              >
                ◀ -5
              </QuestButton>

              <QuestButton
                onClick={() => {
                  if (Math.abs(calibrationValue - calibrationTarget) <= 5) {
                    setMemory('q2_calibration', String(calibrationValue), 2);
                    nextTask();
                  } else {
                    setError(true);
                    setTimeout(() => setError(false), 800);
                  }
                }}
                variant="gold"
              >
                ✅ LOCK
              </QuestButton>

              <QuestButton
                onClick={() => setCalibrationValue((v) => Math.min(100, v + 5))}
                variant="wood"
              >
                +5 ▶
              </QuestButton>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Poza zakresem! Dokładniej!' : 'Out of range! Be more precise!'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 5: SIGNAL TIMING (catch the wave) ============ */}
        <QuestTaskShell
          key="t5"
          taskNumber={6}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={t.t5Title[L]}
          description={t.t5Desc[L]}
          isActive={task === 5}
          isCompleted={task > 5}
        >
          {(() => {
            const inZone = signalStrength >= 70 && signalStrength <= 80;
            const [attempts, setAttempts] = [
              useState(0)[0],
              useState(0)[1],
            ];

            return (
              <div className="space-y-4">
                {/* Signal bar */}
                <div className="relative h-10 bg-[#1A0C03] rounded-full border border-[#3D1F08] overflow-hidden">
                  {/* Green zone */}
                  <div className="absolute top-0 bottom-0 bg-[#5CBD76]/20 border-x border-[#5CBD76]/40"
                    style={{ left: '70%', width: '10%' }}
                  />

                  {/* Signal indicator */}
                  <motion.div
                    className={`absolute top-1 bottom-1 w-3 rounded-full ${inZone ? 'bg-[#5CBD76]' : 'bg-[#FFE27A]'}`}
                    style={{ left: `${signalStrength}%` }}
                  />
                </div>

                <div className="flex justify-between text-[9px] font-mono text-[#C97A3F]">
                  <span>0%</span>
                  <span className={`font-bold ${inZone ? 'text-[#5CBD76]' : 'text-[#FFE27A]'}`}>
                    {Math.round(signalStrength)}%
                  </span>
                  <span>100%</span>
                </div>

                <QuestButton
                  onClick={() => {
                    if (inZone) {
                      setMemory('q2_signal_locked', String(Math.round(signalStrength)), 2);
                      nextTask();
                    } else {
                      setError(true);
                      setTimeout(() => setError(false), 600);
                    }
                  }}
                  variant={inZone ? 'green' : 'wood'}
                >
                  ⚡ {L === 'pl' ? 'ZABLOKUJ SYGNAŁ!' : 'LOCK SIGNAL!'}
                </QuestButton>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs text-red-400 font-mono text-center">
                    ❌ {L === 'pl' ? 'Poza strefą! Poczekaj na zielony zakres.' : 'Out of zone! Wait for green range.'}
                  </motion.p>
                )}
              </div>
            );
          })()}
        </QuestTaskShell>

        {/* ============ TASK 6: HIDDEN PANEL DISCOVERY ============ */}
        <QuestTaskShell
          key="t6"
          taskNumber={7}
          totalTasks={TOTAL_TASKS}
          taskType="physical"
          title={t.t6Title[L]}
          description={t.t6Desc[L]}
          isActive={task === 6}
          isCompleted={task > 6}
          physicalHint={L === 'pl' ? '📍 LEWY RÓG STREFY ALPHA — SZUKAJ UKRYTEJ TABLICZKI' : '📍 LEFT CORNER OF ALPHA ZONE — FIND HIDDEN SIGN'}
        >
          <div className="space-y-4">
            <div className="
              rounded-xl border-2 border-dashed border-[#C97A3F]/40
              bg-[#C97A3F]/5 p-4 text-center
            ">
              <span className="text-3xl">🔍</span>
              <p className="mt-2 text-xs text-[#FFE27A]/60">
                {L === 'pl'
                  ? 'Tabliczka jest ukryta. Szukaj na wysokości kolan, w pobliżu ogrodzenia.'
                  : 'The sign is hidden. Look at knee height, near the fence.'}
              </p>
            </div>

            <div className="
              bg-[#1A0C03] rounded-xl border-2 border-[#C97A3F]/30 p-4
            ">
              <p className="font-orbitron text-[9px] text-[#C97A3F] tracking-widest text-center mb-3">
                {L === 'pl' ? 'WPISZ ZNALEZIONY KOD' : 'ENTER FOUND CODE'}
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={panelCode}
                onChange={(e) => setPanelCode(e.target.value.replace(/\D/g, ''))}
                placeholder="_ _ _ _"
                className="
                  w-full bg-[#0D0600] border-2 border-[#8B4513]
                  rounded-xl p-3 text-center font-mono text-2xl
                  font-bold text-[#FFE27A] tracking-[0.5em]
                  focus:outline-none focus:border-[#FFE27A]
                "
              />
            </div>

            <QuestButton
              onClick={() => {
                if (panelCode === HIDDEN_PANEL_CODE) {
                  setHiddenPanelFound(true);
                  setMemory('q2_hidden_panel_code', HIDDEN_PANEL_CODE, 2);
                  nextTask();
                } else {
                  setError(true);
                  setTimeout(() => setError(false), 1000);
                }
              }}
              variant="gold"
              disabled={panelCode.length < 4}
            >
              🔐 {L === 'pl' ? 'WERYFIKUJ KOD' : 'VERIFY CODE'}
            </QuestButton>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Kod nieprawidłowy. Szukaj dalej!' : 'Code incorrect. Keep looking!'}
              </motion.p>
            )}

            <div className="bg-[#5C2E0A]/30 rounded-lg p-2 border border-[#C97A3F]/20">
              <p className="text-[9px] text-[#FFE27A]/50 text-center">
                ⚠️ {L === 'pl'
                  ? 'ZAPAMIĘTAJ TEN KOD! Będzie potrzebny w Quest 7.'
                  : 'REMEMBER THIS CODE! It will be needed in Quest 7.'}
              </p>
            </div>
          </div>
        </QuestTaskShell>

        {/* ============ TASK 7: FRAGMENT REVEAL ============ */}
        <QuestTaskShell
          key="t7"
          taskNumber={8}
          totalTasks={TOTAL_TASKS}
          taskType="code_input"
          title={t.t7Title[L]}
          isActive={task === 7}
          isCompleted={task > 7}
        >
          <CodeFragmentReveal
            fragment={{
              questId: 2,
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