import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import QuestButton from './QuestButton';

type PipeType = 'straight' | 'curve' | 'tee' | 'cross' | 'empty';
type Connection = 'top' | 'right' | 'bottom' | 'left';

interface Pipe {
  type: PipeType;
  rotation: number;
  filled: boolean;
  isStart?: boolean;
  isEnd?: boolean;
}

interface PipeFlowPuzzleProps {
  onSolved: () => void;
  onFail: () => void;
  lang: 'pl' | 'en';
}

const PIPE_CONNECTIONS: Record<PipeType, Connection[]> = {
  straight: ['top', 'bottom'],
  curve: ['top', 'right'],
  tee: ['top', 'right', 'bottom'],
  cross: ['top', 'right', 'bottom', 'left'],
  empty: [],
};

const ROTATE_CONNECTION = (conn: Connection, rotation: number): Connection => {
  const order: Connection[] = ['top', 'right', 'bottom', 'left'];
  const idx = order.indexOf(conn);
  const steps = (rotation / 90) % 4;
  return order[(idx + steps) % 4];
};

const getRotatedConnections = (pipe: Pipe): Connection[] =>
  PIPE_CONNECTIONS[pipe.type].map((c) => ROTATE_CONNECTION(c, pipe.rotation));

export default function PipeFlowPuzzle({ onSolved, onFail, lang }: PipeFlowPuzzleProps) {
  const SIZE = 4;
  const [moves, setMoves] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const initialGrid: Pipe[][] = useMemo(() => {
    const layout: PipeType[][] = [
      ['curve', 'straight', 'curve', 'empty'],
      ['empty', 'empty', 'tee', 'curve'],
      ['curve', 'straight', 'cross', 'empty'],
      ['empty', 'empty', 'curve', 'straight'],
    ];

    return layout.map((row, r) =>
      row.map((type, c) => ({
        type,
        rotation: Math.floor(Math.random() * 4) * 90,
        filled: false,
        isStart: r === 0 && c === 0,
        isEnd: r === SIZE - 1 && c === SIZE - 1,
      }))
    );
  }, []);

  const [grid, setGrid] = useState<Pipe[][]>(initialGrid);

  const rotatePipe = (r: number, c: number) => {
    setGrid((prev) =>
      prev.map((row, ri) =>
        row.map((pipe, ci) => {
          if (ri === r && ci === c && pipe.type !== 'empty') {
            return { ...pipe, rotation: (pipe.rotation + 90) % 360 };
          }
          return pipe;
        })
      )
    );

    setMoves((m) => m + 1);
  };

  // Calculate flow with BFS
  const calculateFlow = (currentGrid: Pipe[][]): { newGrid: Pipe[][]; reached: boolean } => {
    const newGrid = currentGrid.map((row) => row.map((p) => ({ ...p, filled: false })));
    const queue: [number, number][] = [[0, 0]];
    const visited = new Set<string>();
    let reachedEnd = false;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const key = `${r},${c}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const pipe = newGrid[r][c];
      if (pipe.type === 'empty') continue;

      pipe.filled = true;

      if (r === SIZE - 1 && c === SIZE - 1) {
        reachedEnd = true;
      }

      const conns = getRotatedConnections(pipe);

      for (const conn of conns) {
        let nr = r, nc = c;
        let oppositeConn: Connection;

        switch (conn) {
          case 'top':    nr--; oppositeConn = 'bottom'; break;
          case 'bottom': nr++; oppositeConn = 'top'; break;
          case 'left':   nc--; oppositeConn = 'right'; break;
          case 'right':  nc++; oppositeConn = 'left'; break;
        }

        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue;

        const neighbor = newGrid[nr][nc];
        if (neighbor.type === 'empty') continue;

        const neighborConns = getRotatedConnections(neighbor);
        if (neighborConns.includes(oppositeConn)) {
          queue.push([nr, nc]);
        }
      }
    }

    return { newGrid, reached: reachedEnd };
  };

  useEffect(() => {
    const { newGrid, reached } = calculateFlow(grid);

    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      setGrid(newGrid);
    }

    if (reached) {
      setTimeout(onSolved, 800);
    }
  }, [grid.map((r) => r.map((p) => p.rotation).join(',')).join('|')]);

  const renderPipe = (pipe: Pipe) => {
    if (pipe.type === 'empty') return null;

    const color = pipe.filled ? '#5CBD76' : '#C97A3F';
    const stroke = pipe.filled ? 4 : 3;

    return (
      <motion.svg
        animate={{ rotate: pipe.rotation }}
        viewBox="0 0 40 40"
        className="w-full h-full"
      >
        {pipe.type === 'straight' && (
          <line x1="20" y1="0" x2="20" y2="40" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        )}
        {pipe.type === 'curve' && (
          <path
            d="M 20 0 Q 20 20 40 20"
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {pipe.type === 'tee' && (
          <>
            <line x1="20" y1="0" x2="20" y2="40" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
            <line x1="20" y1="20" x2="40" y2="20" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
          </>
        )}
        {pipe.type === 'cross' && (
          <>
            <line x1="20" y1="0" x2="20" y2="40" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
            <line x1="0" y1="20" x2="40" y2="20" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
          </>
        )}
      </motion.svg>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-center font-orbitron text-[10px] text-[#FFE27A]/60 tracking-widest">
        {lang === 'pl' ? 'POŁĄCZ START Z KOŃCEM' : 'CONNECT START TO END'}
      </p>

      <div className="mx-auto w-fit grid grid-cols-4 gap-1 p-3 bg-[#1A0C03] rounded-xl border-2 border-[#8B4513]">
        {grid.map((row, r) =>
          row.map((pipe, c) => {
            const isStart = pipe.isStart;
            const isEnd = pipe.isEnd;

            return (
              <motion.button
                key={`${r}-${c}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => rotatePipe(r, c)}
                disabled={pipe.type === 'empty'}
                className={`
                  w-14 h-14 rounded-md flex items-center justify-center relative
                  ${pipe.filled ? 'bg-[#5CBD76]/10' : 'bg-[#3D1F08]/60'}
                  ${isStart ? 'border-2 border-[#5CBD76]' : ''}
                  ${isEnd ? 'border-2 border-[#FFE27A]' : ''}
                  ${pipe.type === 'empty' ? 'border border-dashed border-[#8B4513]/30' : 'border border-[#8B4513]/50'}
                `}
              >
                {renderPipe(pipe)}

                {isStart && (
                  <span className="absolute -top-2 -left-2 text-[8px] font-orbitron text-[#5CBD76]">
                    🚀
                  </span>
                )}
                {isEnd && (
                  <span className="absolute -bottom-2 -right-2 text-[8px] font-orbitron text-[#FFE27A]">
                    🎯
                  </span>
                )}
              </motion.button>
            );
          })
        )}
      </div>

      <div className="text-center text-[10px] font-mono text-[#C97A3F]">
        {lang === 'pl' ? 'RUCHY' : 'MOVES'}: {moves}
      </div>
    </div>
  );
}