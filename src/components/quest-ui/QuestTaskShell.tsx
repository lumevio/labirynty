import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

export type TaskType =
  | 'question'
  | 'observation'
  | 'backref'
  | 'memory_lock'
  | 'jump'
  | 'code_input'
  | 'physical'
  | 'puzzle';

interface TaskShellProps {
  taskNumber: number;
  totalTasks: number;
  taskType: TaskType;
  title: string;
  description?: string;
  children: ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  physicalHint?: string;
}

const typeIcons: Record<TaskType, string> = {
  question: '❓',
  observation: '👁️',
  backref: '🔁',
  memory_lock: '🧠',
  jump: '🔀',
  code_input: '🔐',
  physical: '🚶',
  puzzle: '🧩',
};

const typeLabels: Record<TaskType, string> = {
  question: 'PYTANIE',
  observation: 'OBSERWACJA',
  backref: 'POWRÓT',
  memory_lock: 'PAMIĘĆ',
  jump: 'PRZESKOK',
  code_input: 'KOD',
  physical: 'RUCH',
  puzzle: 'ZAGADKA',
};

export default function QuestTaskShell({
  taskNumber,
  totalTasks,
  taskType,
  title,
  description,
  children,
  isActive,
  isCompleted,
  physicalHint,
}: TaskShellProps) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={`task-${taskNumber}`}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-4"
        >
          {/* TASK HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Numer i typ */}
              <div className="
                flex h-10 w-10 items-center justify-center
                rounded-full border-2 border-[#3D1F08]
                bg-[radial-gradient(circle_at_30%_30%,#FFE27A,#A8743C_60%,#5C2E0A)]
                font-orbitron text-sm font-bold text-[#3D1F08]
                shadow-[inset_0_2px_3px_rgba(255,255,255,0.4)]
              ">
                {taskNumber}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{typeIcons[taskType]}</span>
                  <span className="font-orbitron text-[9px] tracking-[0.3em] text-[#FFE27A]/60 uppercase">
                    {typeLabels[taskType]}
                  </span>
                </div>

                <p className="font-orbitron text-xs font-bold tracking-wider text-[#FFE27A]">
                  {title}
                </p>
              </div>
            </div>

            {/* Progress */}
            <span className="font-mono text-[10px] text-[#FFE27A]/40">
              {taskNumber}/{totalTasks}
            </span>
          </div>

          {/* PROGRESS DOTS */}
          <div className="flex items-center gap-1 justify-center">
            {Array.from({ length: totalTasks }, (_, i) => (
              <div
                key={i}
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${
                    i < taskNumber - 1
                      ? 'w-6 bg-[#5CBD76]'
                      : i === taskNumber - 1
                        ? 'w-8 bg-[#FFE27A] animate-pulse'
                        : 'w-3 bg-[#3D1F08]'
                  }
                `}
              />
            ))}
          </div>

          {/* DESCRIPTION */}
          {description && (
            <div className="bg-[#1A0C03]/60 rounded-xl border border-[#8B4513]/30 p-3">
              <p className="text-xs leading-relaxed text-[#FFE27A]/70">
                {description}
              </p>
            </div>
          )}

          {/* PHYSICAL HINT */}
          {physicalHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                flex items-center gap-2 rounded-xl
                border border-[#C97A3F]/30
                bg-[#C97A3F]/10 p-3
              "
            >
              <span className="text-lg">📍</span>
              <div>
                <span className="block font-orbitron text-[9px] tracking-widest text-[#C97A3F]">
                  LOKALIZACJA FIZYCZNA
                </span>
                <span className="text-xs text-[#FFE27A]/80">{physicalHint}</span>
              </div>
            </motion.div>
          )}

          {/* TASK CONTENT */}
          <div className="mt-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}