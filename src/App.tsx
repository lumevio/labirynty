import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import StartScreen from './screens/StartScreen';
import GameMapScreen from './screens/GameMapScreen';
import QuestScreen from './screens/QuestScreen';
import NfcScreen from './screens/NfcScreen';
import MetaScreen from './screens/MetaScreen';
import AdminPanel from './screens/AdminPanel';

import ScanlineOverlay from './components/ScanlineOverlay';
import { useGameStore } from './store/gameStore';
import { preloadSounds } from './audio/preloadSounds';

export default function App() {
  const [route, setRoute] = useState(() =>
    parseHash(window.location.hash)
  );

  const cornMode = useGameStore((s) => s.cornMode);

  /* ✅ FIX: hook MUSI być w środku komponentu */
  useEffect(() => {
    preloadSounds();
  }, []);

  useEffect(() => {
    const update = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path ? `/${path}` : '/';
  }, []);

  const routeKey =
    route.type === 'quest'
      ? `quest-${route.id}`
      : route.type === 'nfc'
      ? `nfc-${route.tagId}`
      : route.type;

  if (route.type === 'admin') return <AdminPanel />;

  return (
    <div className="min-h-dvh bg-black">
      <ScanlineOverlay />

      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {route.type === 'start' && <StartScreen onNavigate={navigate} />}
          {route.type === 'game' && <GameMapScreen onNavigate={navigate} />}
          {route.type === 'quest' && (
            <QuestScreen questId={route.id} onNavigate={navigate} />
          )}
          {route.type === 'nfc' && (
            <NfcScreen tagId={route.tagId} onNavigate={navigate} />
          )}
          {route.type === 'meta' && <MetaScreen onNavigate={navigate} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* helper */
function parseHash(hash: string) {
  const cleaned = hash.replace('#', '').replace(/^\//, '');

  if (cleaned === 'admin') return { type: 'admin' };
  if (cleaned === 'game') return { type: 'game' };
  if (cleaned === 'meta') return { type: 'meta' };

  if (cleaned.startsWith('quest/')) {
    return { type: 'quest', id: Number(cleaned.split('/')[1]) };
  }

  if (cleaned.startsWith('nfc/')) {
    return { type: 'nfc', tagId: cleaned.split('/')[1] };
  }

  return { type: 'start' };
}