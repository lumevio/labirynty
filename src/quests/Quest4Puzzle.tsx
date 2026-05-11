import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useGameStore } from '../systems/GameState';
import QuestFrame from '../components/quest-ui/QuestFrame';
import QuestButton from '../components/quest-ui/QuestButton';
import QuestTaskShell from '../components/quest-ui/QuestTaskShell';
import BackRefPrompt from '../components/quest-ui/BackRefPrompt';
import CodeFragmentReveal from '../components/quest-ui/CodeFragmentReveal';
import type { StandardQuestProps } from '../components/quest-ui/StandardQuestProps';

const TOTAL_TASKS = 7;
const CODE_FRAGMENT = '⚡';

type PuzzlePiece = {
  id: number;
  value: number;
  correct: boolean;
};

type MazeCell = {
  row: number;
  col: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  isPath: boolean;
  isPlayer: boolean;
  isExit: boolean;
  hasItem: boolean;
  itemType?: 'key' | 'trap' | 'clue';
};

export default function Quest4Puzzle({ onComplete, onFail }: StandardQuestProps) {
  const { lang } = useTranslation();
  const L = lang === 'pl' ? 'pl' : 'en';

  const {
    initQuest, completeTask, completeQuest,
    addCodeFragment, setMemory, getMemory,
    addScore, requestBackRef,
  } = useGameStore();

  const [task, setTask] = useState(0);
  const [error, setError] = useState(false);

  // Task 0: Physical color count
  const [colorCounts, setColorCounts] = useState({ red: '', yellow: '', green: '' });

  // Task 1: Rotation puzzle (enhanced)
  const [puzzleLevel, setPuzzleLevel] = useState(0);
  const [puzzleOrder, setPuzzleOrder] = useState([3, 1, 5, 2, 4, 6]);
  const [puzzleMoves, setPuzzleMoves] = useState(0);

  // Task 2: Mini maze navigation
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
  const [keysCollected, setKeysCollected] = useState(0);
  const [trapsHit, setTrapsHit] = useState(0);

  // Task 3: Pattern matching
  const [patternInput, setPatternInput] = useState<number[]>([]);

  // Task 5: Wire connection puzzle
  const [connections, setConnections] = useState<Record<string, string>>({});

  const puzzleLevels = useMemo(() => [
    { start: [3, 1, 5, 2, 4, 6], target: [1, 2, 3, 4, 5, 6] },
    { start: [6, 4, 2, 5, 1, 3], target: [1, 2, 3, 4, 5, 6] },
    { start: [2, 5, 4, 6, 3, 1], target: [1, 2, 3, 4, 5, 6] },
  ], []);

  // Mini maze (5x5)
  const maze: MazeCell[][] = useMemo(() => {
    const grid: MazeCell[][] = [];

    for (let r = 0; r < 5; r++) {
      const row: MazeCell[] = [];

      for (let c = 0; c < 5; c++) {
        row.push({
          row: r,
          col: c,
          walls: {
            top: r === 0,
            right: c === 4,
            bottom: r === 4,
            left: c === 0,
          },
          isPath: true,
          isPlayer: r === 0 && c === 0,
          isExit: r === 4 && c === 4,
          hasItem: (r === 1 && c === 2) || (r === 2 && c === 4) || (r === 3 && c === 1),
          itemType:
            r === 1 && c === 2 ? 'key' :
            r === 2 && c === 4 ? 'trap' :
            r === 3 && c === 1 ? 'clue' : undefined,
        });
      }

      grid.push(row);
    }

    // Add internal walls
    grid[0][1].walls.right = true;
    grid[0][2].walls.left = true;
    grid[1][3].walls.bottom = true;
    grid[2][3].walls.top = true;
    grid[2][1].walls.right = true;
    grid[2][2].walls.left = true;
    grid[3][2].walls.bottom = true;
    grid[4][2].walls.top = true;

    return grid;
  }, []);

  useEffect(() => { initQuest(4, TOTAL_TASKS); }, []);

  useEffect(() => {
    if (task === 1) {
      setPuzzleOrder([...puzzleLevels[puzzleLevel].start]);
      setPuzzleMoves(0);
    }
  }, [task, puzzleLevel]);

  const nextTask = useCallback(() => {
    completeTask(4, task);
    addScore(20);
    setTask((t) => t + 1);
    setError(false);
  }, [task]);

  const handleComplete = useCallback(() => {
    completeQuest(4);
    addCodeFragment({
      questId: 4,
      fragment: CODE_FRAGMENT,
      type: 'symbol',
      discoveredAt: Date.now(),
    });
    setMemory('q4_symbol', CODE_FRAGMENT, 4);
    setMemory('q4_dominant_color', 'YELLOW', 4);
    onComplete();
  }, []);

  // Rotation logic (enhanced: 3-element window)
  const rotatePuzzle = (index: number) => {
    if (index + 2 >= puzzleOrder.length) return;

    const newOrder = [...puzzleOrder];
    const a = newOrder[index];
    const b = newOrder[index + 1];
    const c = newOrder[index + 2];
    newOrder[index] = b;
    newOrder[index + 1] = c;
    newOrder[index + 2] = a;
    setPuzzleOrder(newOrder);
    setPuzzleMoves((m) => m + 1);

    const target = puzzleLevels[puzzleLevel].target;
    const solved = newOrder.every((v, i) => v === target[i]);

    if (solved) {
      setTimeout(() => {
        const nextLevel = puzzleLevel + 1;

        if (nextLevel < puzzleLevels.length) {
          setPuzzleLevel(nextLevel);
        } else {
          nextTask();
        }
      }, 600);
    }
  };

  // Maze movement
  const movePlayer = (dir: 'up' | 'down' | 'left' | 'right') => {
    const { row, col } = playerPos;
    const cell = maze[row][col];

    let newRow = row;
    let newCol = col;

    switch (dir) {
      case 'up':
        if (!cell.walls.top && row > 0) newRow--;
        break;
      case 'down':
        if (!cell.walls.bottom && row < 4) newRow++;
        break;
      case 'left':
        if (!cell.walls.left && col > 0) newCol--;
        break;
      case 'right':
        if (!cell.walls.right && col < 4) newCol++;
        break;
    }

    if (newRow === row && newCol === col) return;

    const targetCell = maze[newRow][newCol];
    setPlayerPos({ row: newRow, col: newCol });

    if (targetCell.hasItem) {
      switch (targetCell.itemType) {
        case 'key':
          setKeysCollected((k) => k + 1);
          break;
        case 'trap':
          setTrapsHit((t) => t + 1);
          if (trapsHit >= 2) onFail();
          break;
      }
    }

    if (targetCell.isExit && keysCollected >= 1) {
      setMemory('q4_maze_completed', 'true', 4);
      nextTask();
    }
  };

  const ui = {
    title: { pl: 'LABIRYNT SYGNAŁÓW', en: 'SIGNAL MAZE' },

    t0Title: { pl: 'INWENTARYZACJA KOLORÓW', en: 'COLOR INVENTORY' },
    t0Desc: {
      pl: 'Policz kolorowe znaczniki w ALEI KUKURYDZIANEJ. Ile jest CZERWONYCH, ŻÓŁTYCH i ZIELONYCH? Dominujący kolor będzie potrzebny później!',
      en: 'Count colored markers in the CORN ALLEY. How many RED, YELLOW and GREEN ones are there? The dominant color will be needed later!',
    },

    t1Title: { pl: 'STABILIZACJA PRZEPŁYWU', en: 'FLOW STABILIZATION' },
    t1Desc: {
      pl: 'Ułóż bloki transmisji danych w kolejności rosnącej przez rotację 3-elementowych okien. Level {level}/3.',
      en: 'Arrange data blocks in ascending order by rotating 3-element windows. Level {level}/3.',
    },

    t2Title: { pl: 'MINI-LABIRYNT', en: 'MINI MAZE' },
    t2Desc: {
      pl: 'Nawiguj przez cyfrowy labirynt 5×5. Zbierz klucze (🔑) i unikaj pułapek (💣). Dotarcie do wyjścia (🚪) wymaga minimum 1 klucza.',
      en: 'Navigate through a 5×5 digital maze. Collect keys (🔑) and avoid traps (💣). Reaching exit (🚪) requires at least 1 key.',
    },

    t3Title: { pl: 'WZORZEC FIBONACCI', en: 'FIBONACCI PATTERN' },
    t3Desc: {
      pl: 'Dokończ ciąg: 1, 1, 2, 3, 5, 8, 13, ?, ?, ?',
      en: 'Complete the sequence: 1, 1, 2, 3, 5, 8, 13, ?, ?, ?',
    },

    t4Title: { pl: 'POWRÓT DO QUESTA 2', en: 'RETURN TO QUEST 2' },
    t4Desc: {
      pl: 'Aby kontynuować potrzebujesz informacji z QUEST 2. Wróć do STREFY NFC ALPHA i odczytaj kolor z panelu kompasu.',
      en: 'To continue you need info from QUEST 2. Return to NFC ALPHA ZONE and read the color from the compass panel.',
    },

    t5Title: { pl: 'ŁĄCZENIE PRZEWODÓW', en: 'WIRE CONNECTION' },
    t5Desc: {
      pl: 'Połącz wejścia z wyjściami. Każdy kolor musi trafić do odpowiadającego mu portu.',
      en: 'Connect inputs to outputs. Each color must reach its matching port.',
    },

    t6Title: { pl: 'FRAGMENT ODKRYTY', en: 'FRAGMENT DISCOVERED' },
  } as const;

  return (
    <QuestFrame title={`QUEST 4 — ${ui.title[L]}`}>
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/50 mb-4 bg-[#1A0C03]/40 p-2 rounded-lg">
        <span>🧩 Q4</span>
        <span>📍 {task + 1}/{TOTAL_TASKS}</span>
        {task === 1 && <span>LVL {puzzleLevel + 1}/3</span>}
        {task === 2 && <span>🔑 {keysCollected} 💣 {trapsHit}</span>}
      </div>

      <AnimatePresence mode="wait">

        {/* ============ TASK 0: PHYSICAL COLOR COUNT ============ */}
        <QuestTaskShell
          key="t0"
          taskNumber={1}
          totalTasks={TOTAL_TASKS}
          taskType="observation"
          title={ui.t0Title[L]}
          description={ui.t0Desc[L]}
          isActive={task === 0}
          isCompleted={task > 0}
          physicalHint={L === 'pl' ? '📍 ALEJA KUKURYDZIANA — POLICZ ZNACZNIKI' : '📍 CORN ALLEY — COUNT MARKERS'}
        >
          <div className="space-y-3">
            {[
              { key: 'red' as const, emoji: '🔴', label: { pl: 'CZERWONE', en: 'RED' }, answer: '4' },
              { key: 'yellow' as const, emoji: '🟡', label: { pl: 'ŻÓŁTE', en: 'YELLOW' }, answer: '7' },
              { key: 'green' as const, emoji: '🟢', label: { pl: 'ZIELONE', en: 'GREEN' }, answer: '3' },
            ].map(({ key, emoji, label, answer }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xl">{emoji}</span>
                <span className="font-orbitron text-[10px] text-[#FFE27A] w-20">{label[L]}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={colorCounts[key]}
                  onChange={(e) => setColorCounts((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="
                    flex-1 bg-[#1A0C03] border border-[#8B4513]
                    rounded-lg p-2 text-center font-mono text-sm
                    text-[#FFE27A] focus:outline-none focus:border-[#FFE27A]
                  "
                />
              </div>
            ))}

            <QuestButton
              onClick={() => {
                if (
                  colorCounts.red === '4' &&
                  colorCounts.yellow === '7' &&
                  colorCounts.green === '3'
                ) {
                  setMemory('q4_red_count', '4', 4);
                  setMemory('q4_yellow_count', '7', 4);
                  setMemory('q4_green_count', '3', 4);
                  setMemory('q4_dominant_color', 'YELLOW', 4);
                  nextTask();
                } else {
                  setError(true);
                  setTimeout(() => setError(false), 1000);
                }
              }}
              variant="gold"
              disabled={!colorCounts.red || !colorCounts.yellow || !colorCounts.green}
            >
              📊 {L === 'pl' ? 'RAPORTUJ WYNIKI' : 'REPORT RESULTS'}
            </QuestButton>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Policz ponownie! Sprawdź obie strony alei.' : 'Count again! Check both sides of the alley.'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 1: ROTATION PUZZLE (3 levels) ============ */}
        <QuestTaskShell
          key={`t1-${puzzleLevel}`}
          taskNumber={2}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={ui.t1Title[L].replace('{level}', String(puzzleLevel + 1))}
          description={ui.t1Desc[L].replace('{level}', String(puzzleLevel + 1))}
          isActive={task === 1}
          isCompleted={task > 1}
        >
          <div className="space-y-4">
            <div className="flex justify-center gap-1.5 flex-wrap">
              {puzzleOrder.map((n, i) => {
                const target = puzzleLevels[puzzleLevel].target;
                const correct = n === target[i];

                return (
                  <motion.button
                    key={`${puzzleLevel}-${i}`}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => rotatePuzzle(i)}
                    className={`
                      w-12 h-14 rounded-xl font-orbitron font-bold text-sm
                      flex flex-col items-center justify-center border-2 transition-all
                      ${correct
                        ? 'border-[#5CBD76] text-[#5CBD76] bg-[#5CBD76]/10'
                        : 'border-[#FFE27A]/30 text-[#FFE27A] bg-[#1A0C03]'
                      }
                    `}
                  >
                    <span className="text-[8px] text-[#C97A3F]">SIG</span>
                    <span>{n}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="text-center text-[10px] font-mono text-[#C97A3F]">
              {L === 'pl' ? 'RUCHY' : 'MOVES'}: {puzzleMoves} | LEVEL {puzzleLevel + 1}/3
            </div>
          </div>
        </QuestTaskShell>

        {/* ============ TASK 2: MINI MAZE 5x5 ============ */}
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
            {/* Maze grid */}
            <div className="mx-auto" style={{ width: 'fit-content' }}>
              {maze.map((row, r) => (
                <div key={r} className="flex">
                  {row.map((cell, c) => {
                    const isPlayer = playerPos.row === r && playerPos.col === c;

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`
                          w-12 h-12 flex items-center justify-center text-sm
                          ${cell.walls.top ? 'border-t-2' : 'border-t'}
                          ${cell.walls.right ? 'border-r-2' : 'border-r'}
                          ${cell.walls.bottom ? 'border-b-2' : 'border-b'}
                          ${cell.walls.left ? 'border-l-2' : 'border-l'}
                          ${isPlayer
                            ? 'bg-[#FFE27A]/20 border-[#FFE27A]'
                            : cell.isExit
                              ? 'bg-[#5CBD76]/10 border-[#8B4513]/50'
                              : 'bg-[#1A0C03]/50 border-[#8B4513]/30'
                          }
                        `}
                      >
                        {isPlayer && '🌽'}
                        {!isPlayer && cell.isExit && '🚪'}
                        {!isPlayer && cell.hasItem && cell.itemType === 'key' && '🔑'}
                        {!isPlayer && cell.hasItem && cell.itemType === 'trap' && '💣'}
                        {!isPlayer && cell.hasItem && cell.itemType === 'clue' && '💡'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* D-pad */}
            <div className="mx-auto w-fit grid grid-cols-3 gap-1">
              <div />
              <QuestButton onClick={() => movePlayer('up')} variant="wood">▲</QuestButton>
              <div />
              <QuestButton onClick={() => movePlayer('left')} variant="wood">◀</QuestButton>
              <div className="w-12 h-12" />
              <QuestButton onClick={() => movePlayer('right')} variant="wood">▶</QuestButton>
              <div />
              <QuestButton onClick={() => movePlayer('down')} variant="wood">▼</QuestButton>
              <div />
            </div>

            <div className="flex justify-center gap-4 text-[10px] font-mono text-[#C97A3F]">
              <span>🔑 {keysCollected}</span>
              <span>💣 {trapsHit}/3</span>
            </div>
          </div>
        </QuestTaskShell>

        {/* ============ TASK 3: FIBONACCI PATTERN ============ */}
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
            <div className="flex flex-wrap justify-center gap-2">
              {[1, 1, 2, 3, 5, 8, 13].map((n, i) => (
                <div
                  key={i}
                  className="
                    w-10 h-10 rounded-lg border border-[#5CBD76]/30
                    bg-[#5CBD76]/10 flex items-center justify-center
                    font-mono text-sm text-[#5CBD76] font-bold
                  "
                >
                  {n}
                </div>
              ))}

              {[0, 1, 2].map((slot) => (
                <div
                  key={`slot-${slot}`}
                  className={`
                    w-10 h-10 rounded-lg border-2 border-dashed
                    flex items-center justify-center font-mono text-sm font-bold
                    ${patternInput[slot] !== undefined
                      ? 'border-[#FFE27A] bg-[#FFE27A]/10 text-[#FFE27A]'
                      : 'border-[#8B4513]/30 text-[#8B4513]'
                    }
                  `}
                >
                  {patternInput[slot] ?? '?'}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[13, 21, 34, 55, 8, 42, 29, 15, 89, 44].map((n) => (
                <QuestButton
                  key={n}
                  onClick={() => {
                    if (patternInput.length >= 3) return;

                    const newInput = [...patternInput, n];
                    setPatternInput(newInput);

                    if (newInput.length === 3) {
                      if (newInput[0] === 21 && newInput[1] === 34 && newInput[2] === 55) {
                        setMemory('q4_fibonacci', '21,34,55', 4);
                        setTimeout(nextTask, 800);
                      } else {
                        setPatternInput([]);
                        setError(true);
                        setTimeout(() => setError(false), 1000);
                      }
                    }
                  }}
                  variant="wood"
                >
                  {n}
                </QuestButton>
              ))}
            </div>

            {patternInput.length > 0 && (
              <QuestButton
                onClick={() => setPatternInput([])}
                variant="red"
              >
                ↩ {L === 'pl' ? 'WYCZYŚĆ' : 'CLEAR'}
              </QuestButton>
            )}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Błędna sekwencja! Każda liczba = suma dwóch poprzednich.' : 'Wrong sequence! Each number = sum of two previous.'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 4: BACK-REFERENCE TO Q2 ============ */}
        <QuestTaskShell
          key="t4"
          taskNumber={5}
          totalTasks={TOTAL_TASKS}
          taskType="backref"
          title={ui.t4Title[L]}
          description={ui.t4Desc[L]}
          isActive={task === 4}
          isCompleted={task > 4}
          physicalHint={L === 'pl' ? '📍 WRÓĆ DO STREFY NFC ALPHA' : '📍 RETURN TO NFC ALPHA ZONE'}
        >
          <BackRefPrompt
            targetQuest={2}
            targetTask={3}
            hint={L === 'pl' ? 'Kolor panelu kompasu z Questa 2' : 'Compass panel color from Quest 2'}
            physicalLocation={L === 'pl' ? 'STREFA NFC ALPHA — PANEL KOMPASU' : 'NFC ALPHA ZONE — COMPASS PANEL'}
            onNavigate={() => {
              requestBackRef({
                targetQuest: 2,
                targetTask: 3,
                hint: 'Kolor kompasu',
              });
            }}
            onSubmitCode={(code) => {
              if (code.toUpperCase() === 'RED' || code.toUpperCase() === 'CZERWONY') {
                setMemory('q4_q2_color_verified', 'true', 4);
                nextTask();
              }
            }}
            lang={L}
          />
        </QuestTaskShell>

        {/* ============ TASK 5: WIRE CONNECTION PUZZLE ============ */}
        <QuestTaskShell
          key="t5"
          taskNumber={6}
          totalTasks={TOTAL_TASKS}
          taskType="puzzle"
          title={ui.t5Title[L]}
          description={ui.t5Desc[L]}
          isActive={task === 5}
          isCompleted={task > 5}
        >
          <div className="space-y-4">
            {[
              { input: '🔴', output: 'PORT-R', correct: 'R' },
              { input: '🟡', output: 'PORT-Y', correct: 'Y' },
              { input: '🟢', output: 'PORT-G', correct: 'G' },
              { input: '🔵', output: 'PORT-B', correct: 'B' },
            ].map(({ input, output, correct }) => (
              <div key={correct} className="flex items-center gap-2">
                <span className="text-xl w-8 text-center">{input}</span>
                <span className="text-[#C97A3F] text-xs">→</span>

                <div className="flex-1 grid grid-cols-4 gap-1">
                  {['R', 'Y', 'G', 'B'].map((port) => (
                    <motion.button
                      key={port}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setConnections((prev) => ({ ...prev, [correct]: port }));
                      }}
                      className={`
                        py-1.5 rounded-lg border text-[10px] font-mono font-bold
                        transition-all
                        ${connections[correct] === port
                          ? connections[correct] === correct
                            ? 'border-[#5CBD76] bg-[#5CBD76]/20 text-[#5CBD76]'
                            : 'border-red-500 bg-red-500/20 text-red-400'
                          : 'border-[#8B4513]/30 bg-[#1A0C03] text-[#FFE27A]/50'
                        }
                      `}
                    >
                      {port}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}

            <QuestButton
              onClick={() => {
                const allCorrect =
                  connections['R'] === 'R' &&
                  connections['Y'] === 'Y' &&
                  connections['G'] === 'G' &&
                  connections['B'] === 'B';

                if (allCorrect) {
                  setMemory('q4_wires_connected', 'true', 4);
                  nextTask();
                } else {
                  setError(true);
                  setTimeout(() => setError(false), 1000);
                }
              }}
              variant="gold"
              disabled={Object.keys(connections).length < 4}
            >
              ⚡ {L === 'pl' ? 'AKTYWUJ POŁĄCZENIA' : 'ACTIVATE CONNECTIONS'}
            </QuestButton>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-mono text-center">
                ❌ {L === 'pl' ? 'Błędne połączenia! Każdy kolor → odpowiedni port.' : 'Wrong connections! Each color → matching port.'}
              </motion.p>
            )}
          </div>
        </QuestTaskShell>

        {/* ============ TASK 6: FRAGMENT REVEAL ============ */}
        <QuestTaskShell
          key="t6"
          taskNumber={7}
          totalTasks={TOTAL_TASKS}
          taskType="code_input"
          title={ui.t6Title[L]}
          isActive={task === 6}
          isCompleted={task > 6}
        >
          <CodeFragmentReveal
            fragment={{
              questId: 4,
              fragment: CODE_FRAGMENT,
              type: 'symbol',
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