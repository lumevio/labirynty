import { motion } from 'framer-motion';

// Mapa labiryntu z checkpointami - widok z góry
export function MazeMapView({ 
  quests, 
  onQuestClick 
}: { 
  quests: Array<{ id: number; status: string }>; 
  onQuestClick: (id: number) => void;
}) {
  // Pozycje checkpointów na mapie (x, y jako procent)
  const checkpointPositions = [
    { x: 10, y: 90 },   // 1 - START
    { x: 18, y: 75 },   // 2
    { x: 30, y: 82 },   // 3
    { x: 25, y: 65 },   // 4
    { x: 40, y: 70 },   // 5
    { x: 35, y: 50 },   // 6
    { x: 50, y: 55 },   // 7
    { x: 45, y: 38 },   // 8
    { x: 60, y: 45 },   // 9
    { x: 55, y: 28 },   // 10
    { x: 70, y: 35 },   // 11
    { x: 65, y: 20 },   // 12
    { x: 78, y: 28 },   // 13
    { x: 82, y: 15 },   // 14
    { x: 90, y: 8 },    // 15 - META
  ];

  return (
    <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
      {/* Tło mapy */}
      <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full">
        <defs>
          {/* Tekstura papieru */}
          <filter id="paper">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#f5e6c8" surfaceScale="2">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
          </filter>
          {/* Gradient kukurydzy */}
          <linearGradient id="cornFieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7cba3f" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#5a8a2a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4a7a1a" stopOpacity="0.3" />
          </linearGradient>
          {/* Ścieżka */}
          <linearGradient id="pathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="100%" stopColor="#c9956c" />
          </linearGradient>
        </defs>
        
        {/* Tło - pole kukurydzy */}
        <rect x="0" y="0" width="100" height="120" fill="#2d1f0f" />
        <rect x="2" y="2" width="96" height="116" rx="3" fill="url(#cornFieldGrad)" />
        
        {/* Dekoracyjna ramka */}
        <rect x="3" y="3" width="94" height="114" rx="2" fill="none" 
          stroke="#8B5E3C" strokeWidth="0.8" strokeDasharray="2,1" opacity="0.5" />
        
        {/* Ścieżki labiryntu */}
        <g opacity="0.4" stroke="#5a4a3a" strokeWidth="0.3" fill="none">
          {/* Pionowe ścieżki */}
          <line x1="20" y1="5" x2="20" y2="95" />
          <line x1="35" y1="10" x2="35" y2="100" />
          <line x1="50" y1="5" x2="50" y2="90" />
          <line x1="65" y1="15" x2="65" y2="105" />
          <line x1="80" y1="5" x2="80" y2="95" />
          {/* Poziome ścieżki */}
          <line x1="5" y1="25" x2="95" y2="25" />
          <line x1="10" y1="45" x2="90" y2="45" />
          <line x1="5" y1="65" x2="95" y2="65" />
          <line x1="10" y1="85" x2="90" y2="85" />
        </g>
        
        {/* Główna ścieżka questów */}
        <path 
          d={`M ${checkpointPositions.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
          ).join(' ')}`}
          stroke="url(#pathGrad)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
          strokeDasharray="3,2"
        />
        
        {/* Róża wiatrów */}
        <g transform="translate(85, 100)" opacity="0.5">
          <circle cx="0" cy="0" r="8" fill="none" stroke="#8B5E3C" strokeWidth="0.3" />
          <text x="0" y="-10" fontSize="3" fill="#8B5E3C" textAnchor="middle">N</text>
          <text x="0" y="13" fontSize="3" fill="#8B5E3C" textAnchor="middle">S</text>
          <text x="11" y="1" fontSize="3" fill="#8B5E3C" textAnchor="middle">E</text>
          <text x="-11" y="1" fontSize="3" fill="#8B5E3C" textAnchor="middle">W</text>
          <polygon points="0,-6 1,-1 -1,-1" fill="#cc3300" />
          <polygon points="0,6 1,1 -1,1" fill="#8B5E3C" />
        </g>
        
        {/* Tytuł mapy */}
        <text x="50" y="112" fontSize="4" fill="#8B5E3C" textAnchor="middle" 
          fontFamily="serif" fontWeight="bold" opacity="0.7">
          LABIRYNTZATOR • ZATOR
        </text>
        
        {/* Dekoracje - kukurydza */}
        <text x="8" y="15" fontSize="6" opacity="0.3">🌽</text>
        <text x="88" y="108" fontSize="5" opacity="0.3">🌾</text>
        <text x="5" y="60" fontSize="4" opacity="0.2">🌿</text>
        <text x="92" y="50" fontSize="4" opacity="0.2">🍃</text>
      </svg>
      
      {/* Checkpointy */}
      {quests.map((quest, index) => {
        const pos = checkpointPositions[index];
        const isCompleted = quest.status === 'completed';
        const isUnlocked = quest.status === 'unlocked';
        const isLocked = quest.status === 'locked';
        
        return (
          <motion.button
            key={quest.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.08, type: 'spring' }}
            onClick={() => !isLocked && onQuestClick(quest.id)}
            disabled={isLocked}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
              ${isLocked ? 'cursor-not-allowed' : 'hover:scale-110'}
              transition-transform duration-200
            `}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className={`relative flex items-center justify-center
              ${index === 0 ? 'w-12 h-12' : index === 14 ? 'w-14 h-14' : 'w-10 h-10'}
            `}>
              {/* Marker tło */}
              <div className={`absolute inset-0 rounded-full 
                ${isCompleted 
                  ? 'bg-corn-green shadow-[0_0_15px_rgba(124,186,63,0.6)]' 
                  : isUnlocked 
                    ? 'bg-corn-gold shadow-[0_0_20px_rgba(255,215,0,0.5)] animate-pulse-corn'
                    : 'bg-corn-brown/60 opacity-50'
                }
              `} />
              
              {/* Numer/ikona */}
              <div className={`relative z-10 font-orbitron font-bold text-xs
                ${isCompleted ? 'text-white' : isUnlocked ? 'text-corn-bg' : 'text-corn-cream/30'}
              `}>
                {isCompleted ? '✓' : index === 0 ? '🚩' : index === 14 ? '🏁' : quest.id}
              </div>
              
              {/* Pulsujący ring dla aktywnego */}
              {isUnlocked && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-corn-gold"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </div>
            
            {/* Etykieta dla START i META */}
            {(index === 0 || index === 14) && (
              <div className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 
                text-[8px] font-orbitron font-bold whitespace-nowrap
                ${isCompleted ? 'text-corn-green' : isUnlocked ? 'text-corn-gold' : 'text-corn-cream/30'}
              `}>
                {index === 0 ? 'START' : 'META'}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// Corn cob icon
export function CornCobIcon({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="cornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="50%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
        <linearGradient id="huskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8bc34a" />
          <stop offset="100%" stopColor="#4a7a1a" />
        </linearGradient>
        <filter id="cornGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M35 15 C30 5, 25 0, 20 5 C15 10, 25 20, 35 25 Z" fill="url(#huskGrad)" opacity="0.9" />
      <path d="M65 15 C70 5, 75 0, 80 5 C85 10, 75 20, 65 25 Z" fill="url(#huskGrad)" opacity="0.9" />
      <path d="M30 20 C22 12, 15 10, 15 18 C15 26, 28 28, 35 30 Z" fill="url(#huskGrad)" opacity="0.7" />
      <path d="M70 20 C78 12, 85 10, 85 18 C85 26, 72 28, 65 30 Z" fill="url(#huskGrad)" opacity="0.7" />
      <ellipse cx="50" cy="58" rx="18" ry="35" fill="url(#cornGrad)" filter="url(#cornGlow)" />
      {[0, 1, 2, 3, 4].map(row => (
        <g key={row}>
          {[-2, -1, 0, 1, 2].map(col => (
            <circle key={`${row}-${col}`} cx={50 + col * 7} cy={38 + row * 10} r={3}
              fill={`hsl(${45 + row * 2}, 100%, ${65 + col * 2}%)`}
              stroke="#e6a800" strokeWidth="0.5" opacity="0.8" />
          ))}
        </g>
      ))}
      <path d="M45 23 Q43 15 40 8" stroke="#b8860b" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M50 22 Q50 14 48 6" stroke="#b8860b" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M55 23 Q57 15 60 8" stroke="#b8860b" strokeWidth="1" fill="none" opacity="0.5" />
    </motion.svg>
  );
}

// Tło pola kukurydzy
export function CornFieldBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #1a0f00 0%, #231400 30%, #2a1800 60%, #1a1200 100%)'
      }} />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-10" style={{
        background: 'radial-gradient(ellipse at 50% 100%, #ffd700, transparent 70%)'
      }} />
      <svg className="absolute bottom-0 left-0 right-0 opacity-10" viewBox="0 0 400 120" 
        preserveAspectRatio="none" style={{ height: '45%', width: '100%' }}>
        {Array.from({ length: 25 }).map((_, i) => {
          const x = i * 16 + Math.random() * 8;
          const h = 50 + Math.random() * 60;
          return (
            <g key={i}>
              <line x1={x} y1={120} x2={x + (Math.random() - 0.5) * 4} y2={120 - h}
                stroke="#5a8a2a" strokeWidth="2" opacity={0.2 + Math.random() * 0.3} />
              <ellipse cx={x + 2} cy={120 - h + 12} rx="3" ry="7"
                fill="#7cba3f" opacity={0.15 + Math.random() * 0.15} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Wzór ziaren
export function KernelPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="kernels" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="#ffd700" />
            <circle cx="30" cy="30" r="3" fill="#ffaa00" />
            <circle cx="10" cy="30" r="2" fill="#7cba3f" />
            <circle cx="30" cy="10" r="2" fill="#7cba3f" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kernels)" />
      </svg>
    </div>
  );
}

// Trofeum
export function TrophySvg({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="50%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#cc9900" />
        </linearGradient>
        <filter id="trophyGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M30 20 L30 55 Q30 70 50 75 Q70 70 70 55 L70 20 Z" fill="url(#trophyGrad)" filter="url(#trophyGlow)" />
      <path d="M30 30 Q15 30 15 45 Q15 55 30 55" stroke="#cc9900" strokeWidth="3" fill="none" />
      <path d="M70 30 Q85 30 85 45 Q85 55 70 55" stroke="#cc9900" strokeWidth="3" fill="none" />
      <rect x="38" y="75" width="24" height="5" rx="2" fill="#cc9900" />
      <rect x="33" y="80" width="34" height="6" rx="2" fill="#b8860b" />
      <polygon points="50,28 53,37 62,37 55,43 57,52 50,47 43,52 45,43 38,37 47,37" fill="#fff8dc" opacity="0.8" />
      <ellipse cx="50" cy="15" rx="5" ry="10" fill="#ffd700" />
      <path d="M47 8 Q45 3 43 5" stroke="#7cba3f" strokeWidth="1.5" fill="none" />
      <path d="M53 8 Q55 3 57 5" stroke="#7cba3f" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// NFC Scan
export function NfcScanSvg({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="nfcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#8B5E3C" />
        </linearGradient>
      </defs>
      <rect x="42" y="40" width="16" height="50" rx="3" fill="#8B5E3C" />
      <rect x="44" y="42" width="12" height="46" rx="2" fill="#a0734a" opacity="0.5" />
      <rect x="20" y="15" width="60" height="35" rx="4" fill="#6d4c2a" stroke="#8B5E3C" strokeWidth="2" />
      <rect x="24" y="19" width="52" height="27" rx="2" fill="#2a1800" />
      <path d="M42 32 Q38 28 42 24" stroke="#ffd700" strokeWidth="2" fill="none" opacity="0.8" />
      <path d="M38 35 Q32 28 38 21" stroke="#ffd700" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M34 38 Q26 28 34 18" stroke="#ffd700" strokeWidth="2" fill="none" opacity="0.4" />
      <rect x="50" y="24" width="14" height="20" rx="2" fill="none" stroke="#ffd700" strokeWidth="1.5" />
      <circle cx="57" cy="40" r="1" fill="#ffd700" />
      <ellipse cx="75" cy="12" rx="4" ry="7" fill="#ffd700" opacity="0.6" />
    </svg>
  );
}

// Locked Gate
export function LockedGateSvg({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="gateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B5E3C" />
          <stop offset="100%" stopColor="#5a3a1e" />
        </linearGradient>
      </defs>
      <rect x="10" y="20" width="10" height="70" fill="url(#gateGrad)" />
      <rect x="80" y="20" width="10" height="70" fill="url(#gateGrad)" />
      <path d="M10 20 Q50 -5 90 20" stroke="#8B5E3C" strokeWidth="6" fill="none" />
      <rect x="22" y="20" width="4" height="70" fill="#6d4c2a" opacity="0.7" />
      <rect x="35" y="20" width="4" height="70" fill="#6d4c2a" opacity="0.7" />
      <rect x="48" y="20" width="4" height="70" fill="#6d4c2a" opacity="0.7" />
      <rect x="61" y="20" width="4" height="70" fill="#6d4c2a" opacity="0.7" />
      <rect x="74" y="20" width="4" height="70" fill="#6d4c2a" opacity="0.7" />
      <rect x="20" y="40" width="60" height="4" fill="#6d4c2a" opacity="0.5" />
      <rect x="20" y="60" width="60" height="4" fill="#6d4c2a" opacity="0.5" />
      <circle cx="50" cy="50" r="8" fill="#ffd700" opacity="0.9" />
      <rect x="46" y="42" width="8" height="4" rx="2" fill="none" stroke="#cc9900" strokeWidth="2" />
      <circle cx="50" cy="52" r="2" fill="#2a1800" />
      <ellipse cx="30" cy="10" rx="3" ry="7" fill="#7cba3f" opacity="0.5" transform="rotate(-15 30 10)" />
      <ellipse cx="70" cy="10" rx="3" ry="7" fill="#7cba3f" opacity="0.5" transform="rotate(15 70 10)" />
    </svg>
  );
}

// Badge/odznaka ukończenia
export function CompleteBadgeSvg({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#ffaa00" />
          <stop offset="100%" stopColor="#cc8800" />
        </linearGradient>
        <filter id="badgeGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Wieniec laurowy */}
      <path d="M20 50 Q10 30 25 15 Q30 25 25 35 Q20 40 20 50" fill="#7cba3f" opacity="0.7" />
      <path d="M80 50 Q90 30 75 15 Q70 25 75 35 Q80 40 80 50" fill="#7cba3f" opacity="0.7" />
      <path d="M20 50 Q10 70 25 85 Q30 75 25 65 Q20 60 20 50" fill="#7cba3f" opacity="0.7" />
      <path d="M80 50 Q90 70 75 85 Q70 75 75 65 Q80 60 80 50" fill="#7cba3f" opacity="0.7" />
      {/* Tarcza */}
      <circle cx="50" cy="50" r="28" fill="url(#badgeGrad)" filter="url(#badgeGlow)" />
      <circle cx="50" cy="50" r="23" fill="none" stroke="#cc8800" strokeWidth="1.5" />
      {/* Kukurydza w środku */}
      <ellipse cx="50" cy="50" rx="10" ry="16" fill="#ffe066" />
      {[-1, 0, 1].map(col => (
        <g key={col}>
          {[-2, -1, 0, 1, 2].map(row => (
            <circle key={`${row}-${col}`} cx={50 + col * 5} cy={42 + row * 5} r={2}
              fill="#ffd700" stroke="#e6a800" strokeWidth="0.3" opacity="0.9" />
          ))}
        </g>
      ))}
      {/* Liście */}
      <path d="M42 35 Q38 28 40 22" stroke="#7cba3f" strokeWidth="2" fill="none" />
      <path d="M58 35 Q62 28 60 22" stroke="#7cba3f" strokeWidth="2" fill="none" />
      {/* Wstążka */}
      <path d="M35 80 L42 70 L50 78 L58 70 L65 80 L58 75 L50 82 L42 75 Z" 
        fill="#cc3300" stroke="#aa2200" strokeWidth="0.5" />
    </svg>
  );
}
