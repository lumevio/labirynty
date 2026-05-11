import { motion } from 'framer-motion';
import type { CodeFragment } from '../../systems/GameState';

interface CodeFragmentRevealProps {
  fragment: CodeFragment;
  lang: 'pl' | 'en';
  onContinue: () => void;
}

export default function CodeFragmentReveal({
  fragment,
  lang,
  onContinue,
}: CodeFragmentRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'backOut' }}
      className="text-center space-y-4"
    >
      {/* Glow effect */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 20px rgba(255,226,122,0.2)',
            '0 0 60px rgba(255,226,122,0.5)',
            '0 0 20px rgba(255,226,122,0.2)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="
          mx-auto w-48 rounded-2xl border-2 border-[#FFE27A]
          bg-gradient-to-b from-[#3D2A00] to-[#1A0C03]
          p-6
        "
      >
        <div className="text-4xl mb-3">🔐</div>

        <p className="font-orbitron text-[9px] tracking-[0.4em] text-[#FFE27A]/50">
          {lang === 'pl' ? 'FRAGMENT ODKRYTY' : 'FRAGMENT DISCOVERED'}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="
            mt-3 bg-[#0D0600] rounded-xl border border-[#FFE27A]/30
            p-3 font-mono text-2xl font-bold text-[#FFE27A]
            tracking-[0.5em]
          "
        >
          {fragment.fragment}
        </motion.div>

        <p className="mt-2 font-mono text-[9px] text-[#C97A3F]">
          Q{fragment.questId} / {fragment.type.toUpperCase()}
        </p>
      </motion.div>

      <p className="text-xs text-[#FFE27A]/50">
        {lang === 'pl'
          ? 'Zapamiętaj ten fragment — będzie potrzebny później!'
          : 'Remember this fragment — you will need it later!'}
      </p>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="
          mx-auto block rounded-xl border border-[#8B4513]
          bg-[#3D1F08] px-6 py-2 font-orbitron text-[10px]
          tracking-widest text-[#FFE27A] transition-colors
          hover:bg-[#5C2E0A]
        "
      >
        {lang === 'pl' ? 'KONTYNUUJ →' : 'CONTINUE →'}
      </motion.button>
    </motion.div>
  );
}