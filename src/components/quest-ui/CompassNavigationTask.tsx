import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuestButton from './QuestButton';

interface CompassNavigationTaskProps {
  targetBearing: number;
  tolerance: number;
  onAligned: () => void;
  lang: 'pl' | 'en';
}

export default function CompassNavigationTask({
  targetBearing,
  tolerance,
  onAligned,
  lang,
}: CompassNavigationTaskProps) {
  const [heading, setHeading] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [manualMode, setManualMode] = useState(false);

  const distance = Math.min(
    Math.abs(heading - targetBearing),
    360 - Math.abs(heading - targetBearing)
  );
  const aligned = distance <= tolerance;

  useEffect(() => {
    if (!('DeviceOrientationEvent' in window)) {
      setSupported(false);
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const alpha = e.alpha || 0;
      setHeading(360 - alpha);
    };

    if (permissionGranted) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any);
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted]);

  useEffect(() => {
    if (aligned) {
      const timer = setTimeout(onAligned, 1000);
      return () => clearTimeout(timer);
    }
  }, [aligned]);

  const requestPermission = async () => {
    const DeviceOrientationEventAny = DeviceOrientationEvent as any;

    if (typeof DeviceOrientationEventAny.requestPermission === 'function') {
      try {
        const result = await DeviceOrientationEventAny.requestPermission();
        if (result === 'granted') setPermissionGranted(true);
      } catch {
        setSupported(false);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  const cardinalDirection = () => {
    if (heading >= 337.5 || heading < 22.5) return 'N';
    if (heading >= 22.5 && heading < 67.5) return 'NE';
    if (heading >= 67.5 && heading < 112.5) return 'E';
    if (heading >= 112.5 && heading < 157.5) return 'SE';
    if (heading >= 157.5 && heading < 202.5) return 'S';
    if (heading >= 202.5 && heading < 247.5) return 'SW';
    if (heading >= 247.5 && heading < 292.5) return 'W';
    if (heading >= 292.5 && heading < 337.5) return 'NW';
    return 'N';
  };

  if (!supported || (!permissionGranted && !manualMode)) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-5xl">🧭</div>
        <p className="text-sm text-[#FFE27A]/70">
          {lang === 'pl'
            ? 'Włącz dostęp do kompasu telefonu'
            : 'Enable access to phone compass'}
        </p>
        <QuestButton onClick={requestPermission} variant="gold">
          🔓 {lang === 'pl' ? 'WŁĄCZ KOMPAS' : 'ENABLE COMPASS'}
        </QuestButton>
        <QuestButton onClick={() => setManualMode(true)} variant="wood">
          ⌨ {lang === 'pl' ? 'TRYB RĘCZNY' : 'MANUAL MODE'}
        </QuestButton>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="
          relative mx-auto
          rounded-full border-4 border-[#C97A3F]
          bg-[radial-gradient(circle,rgba(255,226,122,0.1),rgba(26,12,3,0.95))]
          shadow-[0_0_40px_rgba(255,226,122,0.2)]
        "
        style={{ width: 240, height: 240 }}
      >
        {/* Cardinal directions */}
        {['N', 'E', 'S', 'W'].map((dir, i) => {
          const angle = i * 90;
          return (
            <div
              key={dir}
              className="absolute left-1/2 top-1/2 origin-center"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-90px)`,
              }}
            >
              <span
                className="font-orbitron text-sm font-bold text-[#FFE27A]"
                style={{ transform: `rotate(${-angle}deg)` }}
              >
                {dir}
              </span>
            </div>
          );
        })}

        {/* Target arrow (red) */}
        <motion.div
          animate={{ rotate: targetBearing - heading }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-1 bg-red-500 origin-bottom"
            style={{ height: 80, transform: 'translateY(-40px)' }}
          />
        </motion.div>

        {/* Center compass needle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className={`
            h-6 w-6 rounded-full border-2
            ${aligned ? 'bg-[#5CBD76] border-[#5CBD76]' : 'bg-[#FFE27A] border-[#FFE27A]'}
            shadow-[0_0_20px_currentColor]
          `} />
        </div>

        {/* Heading text */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <div className="bg-[#1A0C03] rounded-lg px-3 py-1 border border-[#8B4513]/50">
            <span className="font-mono text-sm font-bold text-[#FFE27A]">
              {Math.round(heading)}° {cardinalDirection()}
            </span>
          </div>
        </div>
      </div>

      {manualMode && (
        <input
          type="range"
          min={0}
          max={359}
          value={heading}
          onChange={(e) => setHeading(parseInt(e.target.value))}
          className="w-full accent-[#FFE27A] mt-8"
        />
      )}

      <div
        className={`
          mt-12 rounded-xl border-2 p-3 text-center transition-colors
          ${aligned
            ? 'border-[#5CBD76] bg-[#5CBD76]/10'
            : 'border-[#8B4513]/40 bg-[#1A0C03]'}
        `}
      >
        <p className="font-orbitron text-xs tracking-widest">
          <span className="text-[#C97A3F]">
            {lang === 'pl' ? 'CEL' : 'TARGET'}: {targetBearing}°
          </span>
        </p>
        <p className={`mt-1 text-sm font-bold ${aligned ? 'text-[#5CBD76]' : 'text-[#FFE27A]'}`}>
          {aligned
            ? lang === 'pl' ? '✅ NAMIERZONY' : '✅ ALIGNED'
            : lang === 'pl' ? `Odchylenie: ${Math.round(distance)}°` : `Deviation: ${Math.round(distance)}°`}
        </p>
      </div>
    </div>
  );
}