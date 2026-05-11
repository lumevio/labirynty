import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import QuestButton from './QuestButton';

interface AudioFrequencyTunerProps {
  targetFrequency: number;
  tolerance: number;
  onTuned: () => void;
  lang: 'pl' | 'en';
}

export default function AudioFrequencyTuner({
  targetFrequency,
  tolerance,
  onTuned,
  lang,
}: AudioFrequencyTunerProps) {
  const [frequency, setFrequency] = useState(440);
  const [audioOn, setAudioOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const distance = Math.abs(frequency - targetFrequency);
  const inRange = distance <= tolerance;
  const proximity = Math.max(0, 1 - distance / 200);

  useEffect(() => {
    if (audioOn && !audioCtxRef.current) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.value = 0.1;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscillatorRef.current = osc;
      gainRef.current = gain;
    }

    if (!audioOn && audioCtxRef.current) {
      oscillatorRef.current?.stop();
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      oscillatorRef.current = null;
    }

    return () => {
      if (audioCtxRef.current) {
        oscillatorRef.current?.stop();
        audioCtxRef.current.close();
      }
    };
  }, [audioOn]);

  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = frequency;
    }
  }, [frequency]);

  useEffect(() => {
    if (inRange && audioOn) {
      const timer = setTimeout(() => {
        setAudioOn(false);
        onTuned();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [inRange, audioOn]);

  return (
    <div className="space-y-4">
      <div
        className="
          rounded-2xl border-2 border-[#FFE27A]/40
          bg-[#1A0C03] p-6 text-center
        "
      >
        <motion.div
          animate={{
            scale: inRange ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: inRange ? Infinity : 0 }}
          className="text-5xl mb-3"
        >
          {inRange ? '✅' : audioOn ? '📻' : '📡'}
        </motion.div>

        <p className="font-mono text-3xl font-bold text-[#FFE27A]">
          {frequency} <span className="text-sm text-[#C97A3F]">Hz</span>
        </p>

        {/* Proximity bar */}
        <div className="mt-4 h-3 bg-[#3D1F08] rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${proximity * 100}%` }}
            className={`h-full transition-colors ${
              inRange ? 'bg-[#5CBD76]' : proximity > 0.7 ? 'bg-[#FFE27A]' : 'bg-red-500'
            }`}
          />
        </div>

        <p className="mt-2 font-mono text-[10px] text-[#C97A3F]">
          {inRange
            ? lang === 'pl' ? 'SYGNAŁ ZŁAPANY!' : 'SIGNAL LOCKED!'
            : lang === 'pl' ? `ODLEGŁOŚĆ: ${distance} Hz` : `DISTANCE: ${distance} Hz`}
        </p>
      </div>

      <input
        type="range"
        min={100}
        max={1500}
        value={frequency}
        onChange={(e) => setFrequency(parseInt(e.target.value))}
        className="w-full accent-[#FFE27A]"
      />

      <div className="grid grid-cols-4 gap-1">
        <QuestButton onClick={() => setFrequency((f) => Math.max(100, f - 50))} variant="wood">
          -50
        </QuestButton>
        <QuestButton onClick={() => setFrequency((f) => Math.max(100, f - 5))} variant="wood">
          -5
        </QuestButton>
        <QuestButton onClick={() => setFrequency((f) => Math.min(1500, f + 5))} variant="wood">
          +5
        </QuestButton>
        <QuestButton onClick={() => setFrequency((f) => Math.min(1500, f + 50))} variant="wood">
          +50
        </QuestButton>
      </div>

      <QuestButton
        onClick={() => setAudioOn((a) => !a)}
        variant={audioOn ? 'red' : 'green'}
      >
        {audioOn
          ? lang === 'pl' ? '🔇 WYŁĄCZ DŹWIĘK' : '🔇 MUTE'
          : lang === 'pl' ? '🔊 WŁĄCZ DŹWIĘK' : '🔊 UNMUTE'}
      </QuestButton>

      <div className="bg-[#5C2E0A]/30 rounded-lg p-2 border border-[#C97A3F]/20">
        <p className="text-[9px] text-[#C97A3F] text-center">
          💡 {lang === 'pl'
            ? 'Włącz dźwięk i znajdź harmoniczną częstotliwość'
            : 'Enable sound and find the harmonic frequency'}
        </p>
      </div>
    </div>
  );
}