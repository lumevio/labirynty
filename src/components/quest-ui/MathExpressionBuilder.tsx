import { useState } from 'react';
import { motion } from 'framer-motion';
import QuestButton from './QuestButton';

interface MathExpressionBuilderProps {
  availableBlocks: string[];
  targetResult: number;
  onSolved: () => void;
  onFail: () => void;
  lang: 'pl' | 'en';
}

export default function MathExpressionBuilder({
  availableBlocks,
  targetResult,
  onSolved,
  onFail,
  lang,
}: MathExpressionBuilderProps) {
  const [expression, setExpression] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const addBlock = (block: string) => {
    setExpression((prev) => [...prev, block]);
  };

  const removeLastBlock = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const calculate = () => {
    try {
      const expr = expression
        .join('')
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      const result = Function(`"use strict"; return (${expr})`)();

      setCurrentResult(typeof result === 'number' ? result : null);

      if (result === targetResult) {
        setTimeout(onSolved, 800);
      } else {
        setError(true);
        setAttempts((a) => a + 1);
        setTimeout(() => setError(false), 1000);
        if (attempts >= 4) onFail();
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  const isOperator = (block: string) => ['+', '-', '×', '÷', '(', ')'].includes(block);
  const isNumber = (block: string) => /^\d+$/.test(block);

  return (
    <div className="space-y-4">
      <div
        className="
          rounded-2xl border-2 border-[#FFE27A]/40
          bg-[#1A0C03] p-4 text-center
        "
      >
        <p className="font-orbitron text-[10px] text-[#C97A3F] tracking-widest mb-2">
          {lang === 'pl' ? 'CEL' : 'TARGET'}: <span className="text-[#FFE27A] text-base">{targetResult}</span>
        </p>

        <div className="min-h-[60px] bg-[#0D0600] rounded-lg p-3 border border-[#8B4513]/30 flex items-center justify-center flex-wrap gap-1">
          {expression.length === 0 ? (
            <span className="font-mono text-sm text-[#8B4513]/50">
              {lang === 'pl' ? 'Buduj wyrażenie...' : 'Build expression...'}
            </span>
          ) : (
            expression.map((block, i) => (
              <span
                key={i}
                className={`
                  px-2 py-1 rounded font-mono text-sm font-bold
                  ${isOperator(block) ? 'text-[#C97A3F]' : 'text-[#FFE27A]'}
                `}
              >
                {block}
              </span>
            ))
          )}
        </div>

        {currentResult !== null && (
          <p
            className={`mt-2 font-mono text-sm font-bold ${
              currentResult === targetResult ? 'text-[#5CBD76]' : 'text-red-400'
            }`}
          >
            = {currentResult}
          </p>
        )}
      </div>

      <div>
        <p className="text-[9px] font-orbitron text-[#C97A3F] tracking-widest mb-2">
          {lang === 'pl' ? 'DOSTĘPNE BLOKI' : 'AVAILABLE BLOCKS'}
        </p>

        <div className="grid grid-cols-5 gap-1.5">
          {availableBlocks.map((block, i) => (
            <motion.button
              key={`${block}-${i}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => addBlock(block)}
              className={`
                h-10 rounded-lg border font-mono text-sm font-bold
                ${isOperator(block)
                  ? 'border-[#C97A3F]/40 bg-[#5C2E0A]/40 text-[#C97A3F]'
                  : 'border-[#8B4513]/50 bg-[#1A0C03] text-[#FFE27A]'
                }
              `}
            >
              {block}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <QuestButton onClick={() => setExpression([])} variant="red">
          ↩ {lang === 'pl' ? 'CZYŚĆ' : 'CLEAR'}
        </QuestButton>
        <QuestButton onClick={removeLastBlock} variant="wood">
          ← {lang === 'pl' ? 'COFNIJ' : 'UNDO'}
        </QuestButton>
        <QuestButton onClick={calculate} variant="gold" disabled={expression.length < 3}>
          ⚡ {lang === 'pl' ? 'OBLICZ' : 'CALC'}
        </QuestButton>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-red-400 font-mono"
        >
          ❌ {lang === 'pl' ? 'Wynik nie pasuje!' : 'Result does not match!'}
        </motion.p>
      )}
    </div>
  );
}