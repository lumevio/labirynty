import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

type AdminTab = 'overview' | 'quests' | 'graph' | 'answers' | 'memory' | 'fragments' | 'analytics' | 'tools' | 'logs';

interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'action';
  message: string;
  data?: any;
}

interface AnalyticsData {
  questId: number;
  attempts: number;
  completedAt?: number;
  startedAt?: number;
  duration?: number;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedQuest, setSelectedQuest] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSecrets, setShowSecrets] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // 🆕 NEW: Global Search (Ctrl+K)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // 🆕 NEW: Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<string>('all');

  // 🆕 NEW: Pinned quests
  const [pinnedQuests, setPinnedQuests] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_pinned') || '[]');
    } catch { return []; }
  });

  // 🆕 NEW: Live preview
  const [previewQuestId, setPreviewQuestId] = useState<number | null>(null);

  // 🆕 NEW: Notification toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);

  const store = useGameStore();

  // Safe accessors
  const quests = store.quests || [];
  const questProgress = (store as any).questProgress || {};
  const completedQuests = store.completedQuests || [];
  const unlockedQuests = store.unlockedQuests || [];
  const codeFragments = (store as any).codeFragments || [];
  const memory = (store as any).memory || [];
  const totalScore = (store as any).totalScore || 0;
  const playerName = (store as any).playerName || '';
  const playerAvatar = (store as any).playerAvatar || '🌽';
  const hiddenQuestsUnlocked = (store as any).hiddenQuestsUnlocked || [];
  const gameStarted = store.gameStarted || false;
  const startTime = store.startTime;
  const lang = store.lang || 'pl';

  /* ============== ACTIONS ============== */

  const log = useCallback((type: LogEntry['type'], message: string, data?: any) => {
    setLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type,
        message,
        data,
      },
      ...prev.slice(0, 199), // max 200 logs
    ]);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const forceCompleteQuest = (id: number) => {
    if (typeof store.forceCompleteQuest === 'function') {
      store.forceCompleteQuest(id);
    } else if (typeof store.completeQuest === 'function') {
      store.completeQuest(id);
    }
    log('action', `Force completed Quest #${id}`);
    showToast(`✅ Quest #${id} ukończony!`);
  };

  const resetQuestSafe = (id: number) => {
    if (typeof (store as any).resetQuest === 'function') {
      (store as any).resetQuest(id);
      log('warning', `Reset Quest #${id}`);
      showToast(`🔄 Quest #${id} zresetowany`);
    }
  };

  const resetGame = () => {
    if (typeof store.resetGame === 'function') {
      store.resetGame();
      log('error', 'Game fully reset');
      showToast('🗑 Cała gra zresetowana!', 'info');
    }
  };

  const unlockHiddenQuest = (id: number) => {
    if (typeof (store as any).unlockHiddenQuest === 'function') {
      (store as any).unlockHiddenQuest(id);
      log('action', `Unlocked hidden quest #${id}`);
      showToast(`🌟 Hidden Q${id} odblokowany!`);
    }
  };

  const addScore = (pts: number) => {
    if (typeof (store as any).addScore === 'function') {
      (store as any).addScore(pts);
      log('action', `Added ${pts} points`);
    }
  };

  const setMemoryFn = (key: string, value: string, fromQuest: number) => {
    if (typeof (store as any).setMemory === 'function') {
      (store as any).setMemory(key, value, fromQuest);
      log('action', `Memory updated: ${key} = ${value}`);
    }
  };

  const setLang = store.setLang;

  const togglePin = (id: number) => {
    setPinnedQuests((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      localStorage.setItem('admin_pinned', JSON.stringify(next));
      return next;
    });
  };

  /* ============== KEYBOARD SHORTCUTS ============== */

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ctrl+K — global search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }

      // Escape
      if (e.key === 'Escape') {
        setGlobalSearchOpen(false);
        setSelectedQuest(null);
        setPreviewQuestId(null);
      }

      // Tab numbers 1-9
      if (!globalSearchOpen && e.key >= '1' && e.key <= '9' && !e.ctrlKey) {
        const tabs: AdminTab[] = ['overview', 'quests', 'graph', 'answers', 'memory', 'fragments', 'analytics', 'tools', 'logs'];
        const idx = parseInt(e.key) - 1;
        if (tabs[idx]) {
          setActiveTab(tabs[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [globalSearchOpen]);

  /* ============== ANALYTICS ============== */

  const analyticsData = useMemo<AnalyticsData[]>(() => {
    return Object.entries(questProgress).map(([id, prog]: [string, any]) => ({
      questId: Number(id),
      attempts: prog?.attempts || 0,
      completedAt: prog?.completedAt,
      startedAt: prog?.startedAt,
      duration: prog?.completedAt && prog?.startedAt ? prog.completedAt - prog.startedAt : undefined,
    }));
  }, [questProgress]);

  /* ============== IMPORT ============== */

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        useGameStore.setState(data);
        log('success', `Imported game state from ${file.name}`);
        showToast('✅ Stan gry zaimportowany!');
      } catch (err) {
        log('error', `Import failed: ${err}`);
        showToast('❌ Nieprawidłowy plik!', 'error');
      }
    };
    reader.readAsText(file);
  };

  /* ============== FILTERED QUESTS (with pin sorting) ============== */

  const filteredQuests = useMemo(() => {
    const filtered = quests.filter((q: any) => {
      const title = typeof q.title === 'string' ? q.title : (q.title?.pl || `Quest ${q.id}`);
      const matchesSearch = searchQuery === '' ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(q.id).includes(searchQuery);
      const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const aPinned = pinnedQuests.includes(a.id);
      const bPinned = pinnedQuests.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return a.id - b.id;
    });
  }, [quests, searchQuery, filterStatus, pinnedQuests]);

  /* ============== STATS ============== */

  const stats = useMemo(() => {
    const completed = completedQuests.length;
    const total = quests.filter((q: any) => q.id <= 15).length || 15;
    const elapsedMinutes = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0;

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      hidden: hiddenQuestsUnlocked.length,
      fragmentsCollected: codeFragments.length,
      fragmentsTotal: 5,
      memoryEntries: memory.length,
      elapsedMinutes,
      score: totalScore,
    };
  }, [quests, completedQuests, hiddenQuestsUnlocked, codeFragments, memory, totalScore, startTime]);

  const getQuestTitle = (q: any): string => {
    if (!q) return '';
    if (typeof q.title === 'string') return q.title;
    if (q.title?.pl) return q.title.pl;
    return `Quest ${q.id}`;
  };

  /* ============== GLOBAL SEARCH RESULTS ============== */

  const globalSearchResults = useMemo(() => {
    if (!globalSearchQuery) return [];

    const q = globalSearchQuery.toLowerCase();
    const results: Array<{ type: string; label: string; sublabel?: string; action: () => void }> = [];

    // Search quests
    quests.forEach((quest: any) => {
      const title = getQuestTitle(quest);
      if (title.toLowerCase().includes(q) || String(quest.id).includes(q)) {
        results.push({
          type: 'quest',
          label: `Q${quest.id}: ${title}`,
          sublabel: quest.type,
          action: () => {
            setActiveTab('quests');
            setSelectedQuest(quest.id);
            setGlobalSearchOpen(false);
          },
        });
      }
    });

    // Search memory
    memory.forEach((m: any) => {
      if (m.key.toLowerCase().includes(q) || String(m.value).toLowerCase().includes(q)) {
        results.push({
          type: 'memory',
          label: `🧠 ${m.key}`,
          sublabel: `${m.value} (Q${m.fromQuest})`,
          action: () => {
            setActiveTab('memory');
            setGlobalSearchOpen(false);
          },
        });
      }
    });

    // Search fragments
    codeFragments.forEach((f: any) => {
      if (String(f.fragment).toLowerCase().includes(q) || f.type?.includes(q)) {
        results.push({
          type: 'fragment',
          label: `🧩 ${f.fragment}`,
          sublabel: `Q${f.questId} (${f.type})`,
          action: () => {
            setActiveTab('fragments');
            setGlobalSearchOpen(false);
          },
        });
      }
    });

    // Search tabs
    ['overview', 'quests', 'graph', 'answers', 'memory', 'fragments', 'analytics', 'tools', 'logs'].forEach((tab) => {
      if (tab.includes(q)) {
        results.push({
          type: 'tab',
          label: `📑 ${tab.toUpperCase()}`,
          sublabel: 'Open tab',
          action: () => {
            setActiveTab(tab as AdminTab);
            setGlobalSearchOpen(false);
          },
        });
      }
    });

    return results.slice(0, 10);
  }, [globalSearchQuery, quests, memory, codeFragments]);

  /* ============== INIT LOG ============== */

  useEffect(() => {
    log('info', 'Admin Panel V5 initialized');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#FFE27A] font-mono">

      {/* ============== TOAST ============== */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`
              fixed top-0 left-1/2 -translate-x-1/2 z-[9999]
              px-6 py-3 rounded-xl border-2 backdrop-blur
              font-orbitron text-xs font-bold tracking-widest shadow-2xl
              ${toast.type === 'success' ? 'border-[#5CBD76] bg-[#5CBD76]/20 text-[#5CBD76]' : ''}
              ${toast.type === 'error' ? 'border-red-500 bg-red-500/20 text-red-400' : ''}
              ${toast.type === 'info' ? 'border-[#FFE27A] bg-[#FFE27A]/20 text-[#FFE27A]' : ''}
            `}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== GLOBAL SEARCH (Ctrl+K) ============== */}
      <AnimatePresence>
        {globalSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGlobalSearchOpen(false)}
            className="fixed inset-0 z-[9000] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-32"
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-[#0d0d0d] border-2 border-[#FFE27A] rounded-2xl shadow-[0_0_60px_rgba(255,226,122,0.3)] overflow-hidden"
            >
              <div className="p-3 border-b border-[#FFE27A]/20">
                <input
                  autoFocus
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="🔍 Szukaj wszędzie... (questy, pamięć, fragmenty)"
                  className="w-full bg-transparent text-[#FFE27A] text-sm focus:outline-none placeholder:text-[#FFE27A]/30"
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {globalSearchResults.length === 0 ? (
                  <div className="p-8 text-center text-[#FFE27A]/40 text-xs">
                    {globalSearchQuery ? 'Brak wyników' : 'Wpisz aby szukać...'}
                  </div>
                ) : (
                  globalSearchResults.map((result, i) => (
                    <button
                      key={i}
                      onClick={result.action}
                      className="w-full p-3 flex items-center gap-3 hover:bg-[#FFE27A]/10 border-b border-[#FFE27A]/10 text-left"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-[#FFE27A]">{result.label}</p>
                        {result.sublabel && (
                          <p className="text-[10px] text-[#C97A3F] mt-0.5">{result.sublabel}</p>
                        )}
                      </div>
                      <span className="text-[9px] text-[#FFE27A]/40 uppercase">{result.type}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-[#FFE27A]/20 bg-[#1A0C03] text-[10px] text-[#FFE27A]/40 flex justify-between">
                <span>↑↓ Nawigacja</span>
                <span>↵ Wybierz</span>
                <span>ESC Zamknij</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== LIVE PREVIEW MODAL ============== */}
      <AnimatePresence>
        {previewQuestId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewQuestId(null)}
            className="fixed inset-0 z-[8000] bg-black/80 backdrop-blur flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md h-[80vh] bg-[#0d0d0d] border-2 border-[#FFE27A] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-3 border-b border-[#FFE27A]/20 flex items-center justify-between">
                <h3 className="font-orbitron text-sm font-bold tracking-widest text-[#FFE27A]">
                  🎮 PREVIEW Q{previewQuestId}
                </h3>
                <button
                  onClick={() => setPreviewQuestId(null)}
                  className="text-[#FFE27A]/50 hover:text-[#FFE27A] text-xl"
                >
                  ✕
                </button>
              </div>

              <iframe
                src={`#/quest/${previewQuestId}`}
                className="flex-1 bg-black border-0"
                title={`Quest ${previewQuestId} Preview`}
              />

              <div className="p-2 border-t border-[#FFE27A]/20 text-[10px] text-[#FFE27A]/40 text-center">
                Live preview (iframe) — zmiany działają natychmiastowo
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== TOP BAR ============== */}
      <header className="sticky top-0 z-40 bg-[#0d0d0d]/95 backdrop-blur border-b-2 border-[#FFE27A]/20">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🌽</span>
            <div>
              <h1 className="font-orbitron text-lg font-black tracking-widest text-[#FFE27A]">
                LABIRYNTZATOR ADMIN V5
              </h1>
              <p className="text-[10px] text-[#5CBD76]/60 tracking-wider">
                ULTIMATE QUEST DASHBOARD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="px-3 py-1.5 rounded border border-[#FFE27A]/30 text-[10px] hover:bg-[#FFE27A]/10 flex items-center gap-2"
            >
              🔍 SZUKAJ
              <kbd className="px-1.5 py-0.5 bg-[#FFE27A]/10 rounded text-[9px]">Ctrl+K</kbd>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#C97A3F]">{playerAvatar}</span>
              <span className="text-[#FFE27A]">{playerName || 'GUEST'}</span>
            </div>

            <div className="px-3 py-1 rounded-lg border border-[#5CBD76]/40 bg-[#5CBD76]/10 text-[10px] text-[#5CBD76]">
              {gameStarted ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </div>

            <button
              onClick={() => setLang && setLang(lang === 'pl' ? 'en' : 'pl')}
              className="px-2 py-1 rounded border border-[#FFE27A]/30 text-[10px] hover:bg-[#FFE27A]/10"
            >
              {lang.toUpperCase()}
            </button>

            <a
              href="#/"
              className="px-3 py-1 rounded border border-[#C97A3F]/40 bg-[#C97A3F]/10 text-[10px] text-[#C97A3F] hover:bg-[#C97A3F]/20"
            >
              ← POWRÓT
            </a>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-2 grid grid-cols-6 gap-3 text-xs">
          <StatBox label="POSTĘP" value={`${stats.completed}/${stats.total}`} color="#FFE27A" sub={`${stats.percentage}%`} />
          <StatBox label="PUNKTY" value={String(stats.score)} color="#5CBD76" />
          <StatBox label="FRAGMENTY" value={`${stats.fragmentsCollected}/${stats.fragmentsTotal}`} color="#C97A3F" />
          <StatBox label="PAMIĘĆ" value={String(stats.memoryEntries)} color="#3B82F6" />
          <StatBox label="SEKRETY" value={`${stats.hidden}/3`} color="#A855F7" />
          <StatBox label="CZAS" value={`${stats.elapsedMinutes}min`} color="#EC4899" />
        </div>
      </header>

      {/* ============== TAB NAV ============== */}
      <nav className="sticky top-[100px] z-30 bg-[#0d0d0d]/95 backdrop-blur border-b border-[#FFE27A]/10">
        <div className="max-w-[1600px] mx-auto px-6 flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 PRZEGLĄD', kbd: '1' },
            { id: 'quests', label: '🎯 QUESTY', kbd: '2' },
            { id: 'graph', label: '🗺️ GRAF', kbd: '3' },
            { id: 'answers', label: '🔑 ODPOWIEDZI', kbd: '4' },
            { id: 'memory', label: '🧠 PAMIĘĆ', kbd: '5' },
            { id: 'fragments', label: '🧩 FRAGMENTY', kbd: '6' },
            { id: 'analytics', label: '📈 ANALYTICS', kbd: '7' },
            { id: 'tools', label: '⚙️ NARZĘDZIA', kbd: '8' },
            { id: 'logs', label: `📜 LOGI (${logs.length})`, kbd: '9' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-3 font-orbitron text-[11px] tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#FFE27A] text-[#FFE27A] bg-[#FFE27A]/5'
                  : 'border-transparent text-[#FFE27A]/40 hover:text-[#FFE27A]/80 hover:border-[#FFE27A]/30'
              }`}
            >
              {tab.label}
              <kbd className="px-1 py-0.5 bg-[#FFE27A]/10 rounded text-[8px] opacity-50">{tab.kbd}</kbd>
            </button>
          ))}
        </div>
      </nav>

      {/* ============== MAIN ============== */}
      <main className="max-w-[1600px] mx-auto p-6">
        <AnimatePresence mode="wait">

          {/* ============ OVERVIEW ============ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-6">
              <Panel title="🎯 POSTĘP QUESTÓW">
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {quests.filter((q: any) => q.id <= 15).map((q: any) => {
                    const progress = questProgress[q.id];
                    const taskProgress = progress
                      ? `${progress.completedTasks?.filter(Boolean).length || 0}/${progress.totalTasks || 0}`
                      : '0/0';

                    return (
                      <div
                        key={q.id}
                        className={`p-2 rounded border flex items-center justify-between text-xs ${
                          q.status === 'completed' ? 'border-[#5CBD76]/40 bg-[#5CBD76]/5' :
                          q.status === 'unlocked' || q.status === 'in_progress' ? 'border-[#FFE27A]/40 bg-[#FFE27A]/5' :
                          'border-[#3D1F08] bg-[#1A0C03] opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold w-8">#{q.id}</span>
                          <span>{getQuestTitle(q)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#C97A3F]">{taskProgress}</span>
                          <StatusBadge status={q.status} />
                          <button
                            onClick={() => setPreviewQuestId(q.id)}
                            className="text-[10px] text-[#3B82F6] hover:bg-[#3B82F6]/10 px-2 py-0.5 rounded"
                          >
                            👁
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              <Panel title="🌟 UKRYTE QUESTY">
                <div className="space-y-2">
                  {[97, 98, 99].map((id) => {
                    const quest = quests.find((q: any) => q.id === id);
                    const isUnlocked = hiddenQuestsUnlocked.includes(id);

                    return (
                      <div
                        key={id}
                        className={`p-3 rounded border flex justify-between items-center ${
                          isUnlocked ? 'border-purple-500/40 bg-purple-500/5' : 'border-[#3D1F08] bg-[#1A0C03] opacity-60'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold">{quest ? getQuestTitle(quest) : `Hidden Q${id}`}</p>
                          <p className="text-[10px] text-[#C97A3F]">
                            {isUnlocked ? '✅ Odblokowany' : '🔒 Ukryty'}
                          </p>
                        </div>
                        {!isUnlocked && (
                          <button
                            onClick={() => unlockHiddenQuest(id)}
                            className="px-3 py-1 rounded text-[10px] border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                          >
                            UNLOCK
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>

              <Panel title="📌 PRZYPIĘTE QUESTY">
                {pinnedQuests.length === 0 ? (
                  <p className="text-[10px] text-[#FFE27A]/40 text-center py-6">
                    Brak przypiętych questów. Użyj 📌 w zakładce "Questy".
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pinnedQuests.map((id) => {
                      const q = quests.find((quest: any) => quest.id === id);
                      if (!q) return null;
                      return (
                        <div key={id} className="p-2 rounded border border-yellow-500/40 bg-yellow-500/5 flex justify-between items-center text-xs">
                          <span>📌 #{q.id} {getQuestTitle(q)}</span>
                          <button
                            onClick={() => togglePin(id)}
                            className="text-[10px] text-red-400 hover:bg-red-500/10 px-2 py-0.5 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>

              <Panel title="⚡ SZYBKIE AKCJE">
                <div className="grid grid-cols-2 gap-2">
                  <ActionButton onClick={() => addScore(1000)} color="green">+1000 PKT</ActionButton>
                  <ActionButton onClick={() => {
                    [1, 2, 3, 4, 5].forEach((id) => forceCompleteQuest(id));
                  }} color="yellow">UKOŃCZ Q1-5</ActionButton>
                  <ActionButton onClick={() => {
                    [97, 98, 99].forEach((id) => unlockHiddenQuest(id));
                  }} color="purple">ODBLOKUJ SEKRETY</ActionButton>
                  <ActionButton onClick={() => {
                    if (confirmReset) {
                      resetGame();
                      setConfirmReset(false);
                    } else {
                      setConfirmReset(true);
                      setTimeout(() => setConfirmReset(false), 3000);
                    }
                  }} color="red">{confirmReset ? '⚠️ POTWIERDŹ' : '🗑 RESET GRY'}</ActionButton>
                </div>
              </Panel>
            </motion.div>
          )}

          {/* ============ QUESTS ============ */}
          {activeTab === 'quests' && (
            <motion.div key="quests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-3 gap-6">
              <div className="col-span-1 space-y-4">
                <Panel title="🔍 FILTRY">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Szukaj questa..."
                      className="w-full bg-[#1A0C03] border border-[#FFE27A]/30 rounded p-2 text-xs text-[#FFE27A] focus:outline-none focus:border-[#FFE27A]"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { val: 'all', label: 'Wszystkie' },
                        { val: 'locked', label: 'Zablokowane' },
                        { val: 'unlocked', label: 'Odblokowane' },
                        { val: 'completed', label: 'Ukończone' },
                      ].map((f) => (
                        <button
                          key={f.val}
                          onClick={() => setFilterStatus(f.val)}
                          className={`px-2 py-1 rounded border text-[10px] ${
                            filterStatus === f.val
                              ? 'border-[#FFE27A] bg-[#FFE27A]/10 text-[#FFE27A]'
                              : 'border-[#3D1F08] text-[#FFE27A]/50 hover:border-[#FFE27A]/40'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel title={`📋 LISTA (${filteredQuests.length})`}>
                  <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2">
                    {filteredQuests.map((q: any) => {
                      const isPinned = pinnedQuests.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`group rounded border text-xs transition-all ${
                            selectedQuest === q.id
                              ? 'border-[#FFE27A] bg-[#FFE27A]/10'
                              : isPinned
                                ? 'border-yellow-500/40 bg-yellow-500/5'
                                : 'border-[#3D1F08] hover:border-[#FFE27A]/40'
                          }`}
                        >
                          <button
                            onClick={() => setSelectedQuest(q.id)}
                            className="w-full p-2 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-2">
                                {isPinned && '📌'}
                                #{q.id} {getQuestTitle(q)}
                              </span>
                              <StatusBadge status={q.status} />
                            </div>
                            <p className="text-[10px] text-[#C97A3F] mt-1">
                              {q.type || 'unknown'} • {q.points || 100}pts
                            </p>
                          </button>

                          <div className="px-2 pb-1.5 flex gap-1">
                            <button
                              onClick={() => togglePin(q.id)}
                              className="text-[9px] flex-1 py-0.5 rounded hover:bg-[#FFE27A]/10"
                            >
                              {isPinned ? '📌 Odepnij' : '📍 Przypnij'}
                            </button>
                            <button
                              onClick={() => setPreviewQuestId(q.id)}
                              className="text-[9px] flex-1 py-0.5 rounded hover:bg-[#3B82F6]/10 text-[#3B82F6]"
                            >
                              👁 Preview
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              </div>

              <div className="col-span-2">
                {selectedQuest ? (
                  <QuestDetailsPanel
                    questId={selectedQuest}
                    quests={quests}
                    questProgress={questProgress}
                    codeFragments={codeFragments}
                    onComplete={() => forceCompleteQuest(selectedQuest)}
                    onReset={() => resetQuestSafe(selectedQuest)}
                    onPreview={() => setPreviewQuestId(selectedQuest)}
                    getQuestTitle={getQuestTitle}
                  />
                ) : (
                  <Panel title="⚙️ SZCZEGÓŁY">
                    <div className="text-center py-12 text-[#FFE27A]/40">
                      <p className="text-lg">👈 Wybierz questa z listy</p>
                    </div>
                  </Panel>
                )}
              </div>
            </motion.div>
          )}

          {/* ============ GRAPH (NEW) ============ */}
          {activeTab === 'graph' && (
            <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Panel title="🗺️ GRAF ZALEŻNOŚCI QUESTÓW">
                <DependencyGraph
                  quests={quests}
                  onQuestClick={(id) => {
                    setActiveTab('quests');
                    setSelectedQuest(id);
                  }}
                  getQuestTitle={getQuestTitle}
                />
              </Panel>
            </motion.div>
          )}

          {/* ============ ANSWERS ============ */}
          {activeTab === 'answers' && (
            <motion.div key="answers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Panel title="🔑 KOMPLETNA BAZA ODPOWIEDZI">
                <div className="mb-4 flex items-center gap-3">
                  <button
                    onClick={() => setShowSecrets(!showSecrets)}
                    className={`px-4 py-2 rounded border text-xs ${
                      showSecrets
                        ? 'border-red-500 bg-red-500/20 text-red-400'
                        : 'border-[#FFE27A]/30 text-[#FFE27A]'
                    }`}
                  >
                    {showSecrets ? '🙈 UKRYJ ODPOWIEDZI' : '👁 POKAŻ ODPOWIEDZI'}
                  </button>
                  <p className="text-[10px] text-[#C97A3F]">
                    ⚠️ Tryb spoiler — używaj tylko do testowania!
                  </p>
                </div>
                <AnswersTable showSecrets={showSecrets} />
              </Panel>
            </motion.div>
          )}

          {/* ============ MEMORY ============ */}
          {activeTab === 'memory' && (
            <motion.div key="memory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Panel title={`🧠 PAMIĘĆ ŚWIATA (${memory.length} wpisów)`}>
                {memory.length === 0 ? (
                  <p className="text-center py-8 text-[#FFE27A]/40">
                    Brak wpisów. Pamięć będzie zapisywana automatycznie podczas gry.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#FFE27A]/30 text-[#C97A3F]">
                          <th className="text-left p-2">KEY</th>
                          <th className="text-left p-2">VALUE</th>
                          <th className="text-left p-2">FROM Q</th>
                          <th className="text-left p-2">CZAS</th>
                          <th className="text-right p-2">AKCJE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memory.map((m: any) => (
                          <tr key={m.key} className="border-b border-[#3D1F08] hover:bg-[#FFE27A]/5">
                            <td className="p-2 font-mono text-[#5CBD76]">{m.key}</td>
                            <td className="p-2 font-mono text-[#FFE27A]">{m.value}</td>
                            <td className="p-2">Q{m.fromQuest}</td>
                            <td className="p-2 text-[#C97A3F]">{new Date(m.timestamp).toLocaleTimeString()}</td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => {
                                  const newVal = prompt(`Edytuj: ${m.key}`, m.value);
                                  if (newVal !== null) setMemoryFn(m.key, newVal, m.fromQuest);
                                }}
                                className="px-2 py-1 rounded border border-[#FFE27A]/30 hover:bg-[#FFE27A]/10"
                              >
                                ✏️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            </motion.div>
          )}

          {/* ============ FRAGMENTS ============ */}
          {activeTab === 'fragments' && (
            <motion.div key="fragments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <Panel title="🧩 FRAGMENTY KODU GLOBALNEGO">
                {codeFragments.length === 0 ? (
                  <p className="text-center py-8 text-[#FFE27A]/40">
                    Brak fragmentów. Zbieraj je ukańczając questy.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {codeFragments.map((f: any) => (
                      <div key={`${f.questId}-${f.type}`} className="rounded-xl border-2 border-[#5CBD76]/40 bg-[#5CBD76]/5 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-[#C97A3F]">Q{f.questId}</span>
                          <span className="text-[10px] text-[#5CBD76]">{f.type?.toUpperCase()}</span>
                        </div>
                        <p className="font-mono text-2xl font-bold text-[#5CBD76] text-center my-2">{f.fragment}</p>
                        <p className="text-[9px] text-center text-[#FFE27A]/50">
                          {new Date(f.discoveredAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </motion.div>
          )}

          {/* ============ ANALYTICS (NEW) ============ */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-6">
              <Panel title="📈 CZAS UKOŃCZENIA QUESTÓW">
                <AnalyticsBar data={analyticsData.filter((d) => d.duration)} type="duration" />
              </Panel>

              <Panel title="🔥 LICZBA PRÓB (FAILS)">
                <AnalyticsBar data={analyticsData.filter((d) => d.attempts > 0)} type="attempts" />
              </Panel>

              <Panel title="📊 OGÓLNE STATYSTYKI">
                <div className="space-y-3">
                  <AnalyticItem label="Całkowity czas gry" value={`${stats.elapsedMinutes} min`} />
                  <AnalyticItem label="Ukończone questy" value={`${stats.completed}/${stats.total}`} />
                  <AnalyticItem label="Średni czas na quest" value={
                    analyticsData.filter((d) => d.duration).length > 0
                      ? `${Math.round(analyticsData.filter((d) => d.duration).reduce((acc, d) => acc + (d.duration || 0), 0) / analyticsData.filter((d) => d.duration).length / 1000)}s`
                      : '-'
                  } />
                  <AnalyticItem label="Łączna liczba prób" value={analyticsData.reduce((acc, d) => acc + d.attempts, 0)} />
                  <AnalyticItem label="Średnia prób na quest" value={
                    completedQuests.length > 0
                      ? (analyticsData.reduce((acc, d) => acc + d.attempts, 0) / completedQuests.length).toFixed(1)
                      : '0'
                  } />
                  <AnalyticItem label="Współczynnik sukcesu" value={`${stats.percentage}%`} />
                </div>
              </Panel>

              <Panel title="🏆 NAJWYŻSZE WYNIKI">
                <div className="space-y-2">
                  {analyticsData
                    .filter((d) => d.completedAt)
                    .sort((a, b) => (a.duration || 0) - (b.duration || 0))
                    .slice(0, 5)
                    .map((d, i) => {
                      const q = quests.find((quest: any) => quest.id === d.questId);
                      return (
                        <div key={d.questId} className="flex items-center justify-between p-2 rounded bg-[#1A0C03] border border-[#FFE27A]/20">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                            <span className="text-xs">Q{d.questId} {q ? getQuestTitle(q) : ''}</span>
                          </div>
                          <span className="text-xs text-[#5CBD76] font-mono">
                            {d.duration ? `${Math.round(d.duration / 1000)}s` : '-'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </Panel>
            </motion.div>
          )}

          {/* ============ TOOLS ============ */}
          {activeTab === 'tools' && (
            <motion.div key="tools" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-6">
              <Panel title="🎮 SYMULACJA">
                <div className="space-y-2">
                  <ActionButton onClick={() => [1, 2, 3, 4, 5].forEach((id) => forceCompleteQuest(id))} color="yellow">🚀 ZAKOŃCZ Q1-Q5</ActionButton>
                  <ActionButton onClick={() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((id) => forceCompleteQuest(id))} color="yellow">🚀 ZAKOŃCZ Q1-Q10</ActionButton>
                  <ActionButton onClick={() => Array.from({ length: 14 }, (_, i) => i + 1).forEach((id) => forceCompleteQuest(id))} color="yellow">🚀 ZAKOŃCZ Q1-Q14</ActionButton>
                  <ActionButton onClick={() => {
                    Array.from({ length: 15 }, (_, i) => i + 1).forEach((id) => forceCompleteQuest(id));
                    [97, 98, 99].forEach((id) => unlockHiddenQuest(id));
                  }} color="green">💯 100% COMPLETION</ActionButton>
                </div>
              </Panel>

              <Panel title="🧪 PUNKTY">
                <div className="space-y-2">
                  <ActionButton onClick={() => addScore(100)} color="green">+100 PKT</ActionButton>
                  <ActionButton onClick={() => addScore(1000)} color="green">+1000 PKT</ActionButton>
                  <ActionButton onClick={() => addScore(10000)} color="green">+10000 PKT</ActionButton>
                  <ActionButton onClick={() => [97, 98, 99].forEach((id) => unlockHiddenQuest(id))} color="purple">🌟 UNLOCK ALL SECRETS</ActionButton>
                </div>
              </Panel>

              <Panel title="💾 EKSPORT / IMPORT">
                <div className="space-y-2">
                  <ActionButton onClick={() => {
                    const data = JSON.stringify(useGameStore.getState(), null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `labiryntzator-save-${Date.now()}.json`;
                    a.click();
                    log('action', 'Game state exported');
                    showToast('💾 Stan gry zapisany!');
                  }} color="blue">💾 EKSPORTUJ STAN GRY</ActionButton>

                  <ActionButton onClick={() => importInputRef.current?.click()} color="blue">
                    📥 IMPORTUJ STAN GRY
                  </ActionButton>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />

                  <ActionButton onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(useGameStore.getState()));
                    showToast('📋 Skopiowano do schowka!');
                  }} color="blue">📋 COPY TO CLIPBOARD</ActionButton>
                </div>
              </Panel>

              <Panel title="⚠️ STREFA NIEBEZPIECZNA">
                <div className="space-y-2">
                  <ActionButton onClick={() => {
                    if (confirmReset) {
                      resetGame();
                      setConfirmReset(false);
                    } else {
                      setConfirmReset(true);
                      setTimeout(() => setConfirmReset(false), 3000);
                    }
                  }} color="red">{confirmReset ? '⚠️ KLIKNIJ ABY POTWIERDZIĆ' : '🗑 RESETUJ CAŁĄ GRĘ'}</ActionButton>

                  <ActionButton onClick={() => {
                    localStorage.clear();
                    log('error', 'localStorage cleared');
                    showToast('💣 LocalStorage wyczyszczony! Odśwież stronę.', 'error');
                  }} color="red">💣 WYCZYŚĆ LOCALSTORAGE</ActionButton>

                  <ActionButton onClick={() => {
                    setLogs([]);
                    showToast('🗑 Logi wyczyszczone');
                  }} color="red">🗑 WYCZYŚĆ LOGI</ActionButton>
                </div>
              </Panel>
            </motion.div>
          )}

          {/* ============ LOGS (NEW) ============ */}
          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Panel title={`📜 LOGI SYSTEMOWE (${logs.length})`}>
                <div className="mb-4 flex gap-2">
                  {['all', 'info', 'success', 'warning', 'error', 'action'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setLogFilter(type)}
                      className={`px-3 py-1 rounded text-[10px] border ${
                        logFilter === type
                          ? 'border-[#FFE27A] bg-[#FFE27A]/10 text-[#FFE27A]'
                          : 'border-[#3D1F08] text-[#FFE27A]/50 hover:border-[#FFE27A]/40'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                  <button
                    onClick={() => setLogs([])}
                    className="ml-auto px-3 py-1 rounded text-[10px] border border-red-500/40 text-red-400 hover:bg-red-500/10"
                  >
                    🗑 CLEAR
                  </button>
                </div>

                <div className="space-y-1 max-h-[600px] overflow-y-auto font-mono text-xs">
                  {logs
                    .filter((l) => logFilter === 'all' || l.type === logFilter)
                    .map((l) => (
                      <div
                        key={l.id}
                        className={`p-2 rounded border-l-4 flex items-start gap-2 ${
                          l.type === 'error' ? 'border-l-red-500 bg-red-500/5' :
                          l.type === 'warning' ? 'border-l-yellow-500 bg-yellow-500/5' :
                          l.type === 'success' ? 'border-l-[#5CBD76] bg-[#5CBD76]/5' :
                          l.type === 'action' ? 'border-l-[#3B82F6] bg-[#3B82F6]/5' :
                          'border-l-[#666] bg-[#666]/5'
                        }`}
                      >
                        <span className="text-[9px] text-[#FFE27A]/40 whitespace-nowrap">
                          {new Date(l.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-[9px] uppercase font-bold whitespace-nowrap ${
                          l.type === 'error' ? 'text-red-400' :
                          l.type === 'warning' ? 'text-yellow-400' :
                          l.type === 'success' ? 'text-[#5CBD76]' :
                          l.type === 'action' ? 'text-[#3B82F6]' :
                          'text-[#FFE27A]/60'
                        }`}>
                          [{l.type}]
                        </span>
                        <span className="text-[#FFE27A]">{l.message}</span>
                      </div>
                    ))}

                  {logs.length === 0 && (
                    <p className="text-center py-12 text-[#FFE27A]/40">
                      Brak logów. Akcje będą logowane automatycznie.
                    </p>
                  )}
                </div>
              </Panel>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ============== FOOTER WITH SHORTCUTS ============== */}
      <footer className="border-t border-[#FFE27A]/10 bg-[#0d0d0d]/50 mt-8">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between text-[9px] text-[#FFE27A]/40">
          <div className="flex items-center gap-4">
            <span>Admin V5 © 2026</span>
            <span>•</span>
            <span>{quests.length} questów załadowanych</span>
          </div>

          <div className="flex items-center gap-3">
            <KbdHint keys={['Ctrl', 'K']} action="Szukaj" />
            <KbdHint keys={['1-9']} action="Zakładki" />
            <KbdHint keys={['Esc']} action="Zamknij" />
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ====================== HELPER COMPONENTS ====================== */

function StatBox({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-[#1A0C03] p-2" style={{ borderColor: `${color}40` }}>
      <p className="text-[9px] tracking-widest mb-0.5" style={{ color }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="font-orbitron text-lg font-bold" style={{ color }}>{value}</p>
        {sub && <p className="text-[10px] opacity-60">{sub}</p>}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#FFE27A]/20 bg-[#0d0d0d] p-4">
      <h3 className="font-orbitron text-sm font-bold tracking-widest text-[#FFE27A] mb-4 pb-2 border-b border-[#FFE27A]/10">
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    locked: { color: 'text-[#666]', bg: 'bg-[#666]/10', label: '🔒' },
    unlocked: { color: 'text-[#FFE27A]', bg: 'bg-[#FFE27A]/10', label: '🔓' },
    in_progress: { color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', label: '⏳' },
    completed: { color: 'text-[#5CBD76]', bg: 'bg-[#5CBD76]/10', label: '✅' },
    failed: { color: 'text-red-400', bg: 'bg-red-500/10', label: '❌' },
  };

  const c = config[status || 'locked'] || config.locked;

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] ${c.color} ${c.bg}`}>
      {c.label}
    </span>
  );
}

function ActionButton({
  onClick, children, color,
}: {
  onClick: () => void;
  children: React.ReactNode;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
}) {
  const colorMap = {
    green: 'border-[#5CBD76]/40 bg-[#5CBD76]/10 text-[#5CBD76] hover:bg-[#5CBD76]/20',
    yellow: 'border-[#FFE27A]/40 bg-[#FFE27A]/10 text-[#FFE27A] hover:bg-[#FFE27A]/20',
    red: 'border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20',
    blue: 'border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20',
    purple: 'border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full px-4 py-3 rounded border font-orbitron text-xs font-bold tracking-widest transition-colors ${colorMap[color]}`}
    >
      {children}
    </motion.button>
  );
}

function KbdHint({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((k) => (
        <kbd key={k} className="px-1.5 py-0.5 bg-[#FFE27A]/10 border border-[#FFE27A]/20 rounded text-[8px]">{k}</kbd>
      ))}
      <span className="ml-1">{action}</span>
    </div>
  );
}

function QuestDetailsPanel({
  questId, quests, questProgress, codeFragments, onComplete, onReset, onPreview, getQuestTitle,
}: any) {
  const quest = quests.find((q: any) => q.id === questId);
  const progress = questProgress[questId];
  const fragments = codeFragments.filter((f: any) => f.questId === questId);

  if (!quest) return null;

  return (
    <Panel title={`#${quest.id} — ${getQuestTitle(quest)}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoRow label="ID" value={String(quest.id)} />
          <InfoRow label="TYP" value={quest.type || '-'} />
          <InfoRow label="PUNKTY" value={`${quest.points || 0}pts`} />
          <InfoRow label="STATUS" value={<StatusBadge status={quest.status} />} />
        </div>

        {progress && progress.totalTasks > 0 && (
          <div>
            <p className="text-[10px] text-[#C97A3F] tracking-widest mb-2">POSTĘP ZADAŃ</p>
            <div className="flex gap-1">
              {progress.completedTasks?.map((completed: boolean, i: number) => (
                <div key={i} className={`h-2 flex-1 rounded ${completed ? 'bg-[#5CBD76]' : 'bg-[#3D1F08]'}`} />
              ))}
            </div>
            <p className="text-[10px] text-[#FFE27A]/60 mt-1">
              {progress.completedTasks?.filter(Boolean).length || 0}/{progress.totalTasks} ukończonych
            </p>
          </div>
        )}

        {fragments.length > 0 && (
          <div>
            <p className="text-[10px] text-[#C97A3F] tracking-widest mb-2">ZEBRANE FRAGMENTY</p>
            <div className="grid grid-cols-2 gap-2">
              {fragments.map((f: any) => (
                <div key={f.type} className="rounded border border-[#5CBD76]/40 bg-[#5CBD76]/5 p-2 text-center">
                  <p className="text-[9px] text-[#C97A3F]">{f.type?.toUpperCase()}</p>
                  <p className="font-mono text-lg font-bold text-[#5CBD76]">{f.fragment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#FFE27A]/10">
          <ActionButton onClick={onComplete} color="green">✅ COMPLETE</ActionButton>
          <ActionButton onClick={onReset} color="yellow">🔄 RESET</ActionButton>
          <ActionButton onClick={onPreview} color="blue">👁 PREVIEW</ActionButton>
        </div>
      </div>
    </Panel>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center px-2 py-1.5 rounded bg-[#1A0C03] border border-[#3D1F08]">
      <span className="text-[9px] text-[#C97A3F] tracking-widest">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}

function AnalyticItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center p-2 rounded bg-[#1A0C03] border border-[#FFE27A]/20">
      <span className="text-xs text-[#FFE27A]/70">{label}</span>
      <span className="font-orbitron text-sm font-bold text-[#FFE27A]">{value}</span>
    </div>
  );
}

function AnalyticsBar({ data, type }: { data: AnalyticsData[]; type: 'duration' | 'attempts' }) {
  if (data.length === 0) {
    return <p className="text-center py-8 text-[#FFE27A]/40 text-xs">Brak danych. Ukończ kilka questów aby zobaczyć analytics.</p>;
  }

  const maxValue = Math.max(...data.map((d) => type === 'duration' ? (d.duration || 0) : d.attempts));

  return (
    <div className="space-y-2">
      {data.map((d) => {
        const value = type === 'duration' ? (d.duration || 0) : d.attempts;
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const display = type === 'duration' ? `${Math.round(value / 1000)}s` : `${value}`;

        return (
          <div key={d.questId} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#FFE27A]">Q{d.questId}</span>
              <span className="text-[#C97A3F]">{display}</span>
            </div>
            <div className="h-2 bg-[#1A0C03] rounded-full overflow-hidden border border-[#3D1F08]">
              <div
                className={`h-full transition-all ${type === 'duration' ? 'bg-[#3B82F6]' : 'bg-red-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============== DEPENDENCY GRAPH ============== */

function DependencyGraph({ quests, onQuestClick, getQuestTitle }: any) {
  const QUEST_DEPS: Record<number, number[]> = {
    1: [], 2: [], 3: [1], 4: [2], 5: [7], 6: [2], 7: [2, 4],
    8: [3], 9: [3, 6], 10: [5], 11: [6, 7], 12: [8, 11],
    13: [8, 11], 14: [12, 13], 15: [1, 7, 12, 14],
  };

  const positions: Record<number, { x: number; y: number }> = {
    1: { x: 100, y: 50 },
    2: { x: 300, y: 50 },
    3: { x: 100, y: 150 },
    4: { x: 300, y: 150 },
    5: { x: 500, y: 250 },
    6: { x: 200, y: 250 },
    7: { x: 400, y: 250 },
    8: { x: 50, y: 350 },
    9: { x: 150, y: 350 },
    10: { x: 500, y: 350 },
    11: { x: 350, y: 350 },
    12: { x: 200, y: 450 },
    13: { x: 400, y: 450 },
    14: { x: 300, y: 550 },
    15: { x: 300, y: 650 },
  };

  return (
    <div className="relative w-full h-[750px] bg-[#0a0a0a] rounded-lg border border-[#FFE27A]/20 overflow-auto">
      <svg width="700" height="750" className="absolute inset-0">
        {/* Lines */}
        {Object.entries(QUEST_DEPS).map(([id, deps]) => {
          const target = positions[Number(id)];
          if (!target) return null;

          return deps.map((depId) => {
            const source = positions[depId];
            if (!source) return null;

            return (
              <line
                key={`${depId}-${id}`}
                x1={source.x + 30}
                y1={source.y + 15}
                x2={target.x + 30}
                y2={target.y + 15}
                stroke="#FFE27A"
                strokeWidth="1"
                opacity="0.3"
                markerEnd="url(#arrowhead)"
              />
            );
          });
        })}

        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#FFE27A" opacity="0.5" />
          </marker>
        </defs>
      </svg>

      {/* Quest nodes */}
      {Object.entries(positions).map(([id, pos]) => {
        const q = quests.find((quest: any) => quest.id === Number(id));
        if (!q) return null;

        return (
          <button
            key={id}
            onClick={() => onQuestClick(Number(id))}
            className={`absolute w-16 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold transition-all hover:scale-110 hover:z-10 ${
              q.status === 'completed' ? 'border-[#5CBD76] bg-[#5CBD76]/20 text-[#5CBD76]' :
              q.status === 'unlocked' || q.status === 'in_progress' ? 'border-[#FFE27A] bg-[#FFE27A]/20 text-[#FFE27A]' :
              'border-[#3D1F08] bg-[#1A0C03] text-[#666]'
            }`}
            style={{ left: pos.x, top: pos.y }}
            title={getQuestTitle(q)}
          >
            <span className="text-sm">Q{id}</span>
            <span className="text-[8px] opacity-70 truncate w-full text-center px-1">
              {getQuestTitle(q).substring(0, 8)}
            </span>
          </button>
        );
      })}

      <div className="absolute bottom-2 left-2 text-[9px] text-[#FFE27A]/40 bg-[#0d0d0d] p-2 rounded border border-[#FFE27A]/20">
        <p>🟢 Ukończone</p>
        <p>🟡 Dostępne</p>
        <p>⚫ Zablokowane</p>
      </div>
    </div>
  );
}

function AnswersTable({ showSecrets }: { showSecrets: boolean }) {
  const ANSWERS = [
    { q: 1, task: 5, type: 'observation', question: 'Ile ŻÓŁTYCH tabliczek?', answer: '3' },
    { q: 1, task: 7, type: 'code', question: 'Kod z NFC', answer: '37' },
    { q: 2, task: 1, type: 'observation', question: 'Kierunek flagi', answer: 'E' },
    { q: 2, task: 7, type: 'code', question: 'Ukryty kod', answer: '4821' },
    { q: 2, task: 8, type: 'fragment', question: 'Fragment', answer: 'RED' },
    { q: 3, task: 1, type: 'quiz', question: 'Kraj Zatoru', answer: 'Polska' },
    { q: 3, task: 4, type: 'backref', question: 'Kod z Q1', answer: '37' },
    { q: 3, task: 6, type: 'fragment', question: 'Słowo', answer: 'CORN' },
    { q: 4, task: 4, type: 'logic', question: 'Fibonacci', answer: '21, 34, 55' },
    { q: 4, task: 5, type: 'backref', question: 'Kolor z Q2', answer: 'RED' },
    { q: 4, task: 7, type: 'fragment', question: 'Symbol', answer: '⚡' },
    { q: 5, task: 7, type: 'fragment', question: 'Cyfry', answer: '58' },
    { q: 6, task: 6, type: 'fragment', question: 'Kolor', answer: 'BLUE' },
    { q: 7, task: 7, type: 'fragment', question: 'Cyfry', answer: '4821' },
    { q: 8, task: 6, type: 'fragment', question: 'Klucz', answer: 'OMEGA' },
    { q: 9, task: 7, type: 'fragment', question: 'Symbol', answer: '🌽' },
    { q: 10, task: 7, type: 'fragment', question: 'Słowo', answer: 'TRAP' },
    { q: 11, task: 8, type: 'fragment', question: 'Fragmenty', answer: '99 + GREEN' },
    { q: 12, task: 7, type: 'fragment', question: 'Symbol', answer: '🔮' },
    { q: 13, task: 8, type: 'fragment', question: 'Cyfry', answer: '7531' },
    { q: 14, task: 6, type: 'fragment', question: 'Klucz', answer: 'GATE' },
    { q: 15, task: 2, type: 'final', question: 'Kod finałowy', answer: '37-4821-🔮-58-GATE' },
  ];

  return (
    <div className="overflow-x-auto max-h-[600px]">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-[#0d0d0d]">
          <tr className="border-b-2 border-[#FFE27A]/30 text-[#C97A3F]">
            <th className="text-left p-2 w-12">Q</th>
            <th className="text-left p-2 w-12">T</th>
            <th className="text-left p-2 w-24">TYP</th>
            <th className="text-left p-2">PYTANIE</th>
            <th className="text-left p-2 w-48">ODPOWIEDŹ</th>
          </tr>
        </thead>
        <tbody>
          {ANSWERS.map((a, i) => (
            <tr key={i} className="border-b border-[#3D1F08] hover:bg-[#FFE27A]/5">
              <td className="p-2 font-bold text-[#FFE27A]">Q{a.q}</td>
              <td className="p-2 text-[#C97A3F]">#{a.task}</td>
              <td className="p-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#3D1F08] text-[#FFE27A]/70">
                  {a.type}
                </span>
              </td>
              <td className="p-2 text-[#FFE27A]/80">{a.question}</td>
              <td className="p-2">
                {showSecrets ? (
                  <span className="font-mono font-bold text-[#5CBD76]">{a.answer}</span>
                ) : (
                  <span className="text-[#666] italic">[ukryte]</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}