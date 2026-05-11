import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ============================================================
   TYPY SYSTEMU
   ============================================================ */

export type Lang = 'pl' | 'en';

export type QuestStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed' | 'failed';

export type QuestType =
  | 'intro' | 'quiz' | 'puzzle' | 'logic' | 'memory' | 'maze' | 'nfc'
  | 'boss' | 'video' | 'timer' | 'hidden' | 'speed' | 'decision'
  | 'trap' | 'pattern' | 'meta';

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type FragmentType = 'digits' | 'symbol' | 'color' | 'word' | 'key';

export interface Quest {
  id: number;
  slug: string;
  title: { pl: string; en: string };
  description: { pl: string; en: string };
  type: QuestType;
  difficulty: QuestDifficulty;
  points: number;
  season: number;
  estimatedTime: number;
  status: QuestStatus;
  requiresQuestId: number | null;
  physicalLocation?: { pl: string; en: string };
  nfcTagId?: string;
  background?: string;
  music?: string;
  introScene?: string;
  completionScene?: string;
  minigame?: string;
  rewards?: {
    xp: number;
    badge?: string;
    unlockItem?: string;
    fragment?: FragmentType;
  };
  translations?: {
    pl?: Record<string, string>;
    en?: Record<string, string>;
  };
}

export interface Player {
  id?: string;
  name: string;
  avatar: string;
  createdAt: number;
  totalPlayTime?: number;
  achievements?: string[];
}

export interface QuestProgress {
  questId: number;
  status: QuestStatus;
  currentTask: number;
  totalTasks: number;
  attempts: number;
  completedTasks: boolean[];
  startedAt?: number;
  completedAt?: number;
  unlockedBy?: number[];
}

export interface CodeFragment {
  questId: number;
  fragment: string;
  type: FragmentType;
  discoveredAt: number;
}

export interface MemoryEntry {
  key: string;
  value: string;
  fromQuest: number;
  timestamp: number;
}

export interface JumpRequest {
  fromQuest: number;
  toQuest: number;
  reason: string;
  requiredMemory?: string;
  returnAfter: boolean;
  timestamp?: number;
}

export interface BackReference {
  targetQuest: number;
  targetTask: number;
  hint: string;
  physicalLocation?: string;
}

/* ============================================================
   QUEST DEPENDENCIES MAP
   ============================================================ */

export const QUEST_DEPENDENCIES: Record<
  number,
  {
    requires: number[];
    provides: FragmentType[];
    backRefs: BackReference[];
    jumpTargets: number[];
    physicalLocation: string;
  }
> = {
  1: { requires: [], provides: ['digits'], backRefs: [], jumpTargets: [], physicalLocation: 'WEJŚCIE GŁÓWNE' },
  2: { requires: [], provides: ['color'], backRefs: [], jumpTargets: [], physicalLocation: 'STREFA NFC ALPHA' },
  3: { requires: [1], provides: ['word'],
       backRefs: [{ targetQuest: 1, targetTask: 2, hint: 'Kod startowy' }],
       jumpTargets: [], physicalLocation: 'SKRZYŻOWANIE PÓŁNOCNE' },
  4: { requires: [2], provides: ['symbol'],
       backRefs: [{ targetQuest: 2, targetTask: 3, hint: 'Kolor z panelu' }],
       jumpTargets: [], physicalLocation: 'ALEJA KUKURYDZIANA' },
  5: { requires: [7], provides: ['digits'],
       backRefs: [{ targetQuest: 7, targetTask: 1, hint: 'Liczba rzędów' }],
       jumpTargets: [], physicalLocation: 'POLANA CENTRALNA' },
  6: { requires: [2], provides: ['color'], backRefs: [],
       jumpTargets: [11], physicalLocation: 'TUNEL WSCHODNI' },
  7: { requires: [2, 4], provides: ['digits'],
       backRefs: [
         { targetQuest: 2, targetTask: 4, hint: 'Kod z lewego rogu' },
         { targetQuest: 4, targetTask: 2, hint: 'Kolor dominujący' },
       ],
       jumpTargets: [11], physicalLocation: 'ZAKRĘT LABIRYNTU' },
  8: { requires: [3], provides: ['key'],
       backRefs: [{ targetQuest: 3, targetTask: 3, hint: 'Słowo klucz' }],
       jumpTargets: [], physicalLocation: 'BRAMA UKRYTA' },
  9: { requires: [3, 6], provides: ['symbol'],
       backRefs: [
         { targetQuest: 3, targetTask: 1, hint: 'Odpowiedź quizu' },
         { targetQuest: 6, targetTask: 1, hint: 'Kolor sygnału' },
       ],
       jumpTargets: [], physicalLocation: 'ROZWIDLENIE ZACHODNIE' },
  10: { requires: [5], provides: ['word'],
        backRefs: [{ targetQuest: 5, targetTask: 2, hint: 'Sekwencja memory' }],
        jumpTargets: [], physicalLocation: 'STREFA PUŁAPEK' },
  11: { requires: [6, 7], provides: ['digits', 'color'],
        backRefs: [
          { targetQuest: 6, targetTask: 1, hint: 'Czas reakcji' },
          { targetQuest: 7, targetTask: 3, hint: 'Liczba znaczników' },
        ],
        jumpTargets: [13], physicalLocation: 'HUB LOGICZNY' },
  12: { requires: [8, 11], provides: ['symbol'],
        backRefs: [
          { targetQuest: 8, targetTask: 1, hint: 'Klucz ukryty' },
          { targetQuest: 11, targetTask: 2, hint: 'Kolory huba' },
        ],
        jumpTargets: [], physicalLocation: 'WIEŻA OBSERWACYJNA' },
  13: { requires: [8, 11], provides: ['digits'],
        backRefs: [
          { targetQuest: 8, targetTask: 1, hint: 'Klucz bramy' },
          { targetQuest: 11, targetTask: 3, hint: 'Sekwencja huba' },
        ],
        jumpTargets: [14], physicalLocation: 'KORYTARZ FINALNY' },
  14: { requires: [12, 13], provides: ['key'],
        backRefs: [
          { targetQuest: 12, targetTask: 1, hint: 'Symbol z wieży' },
          { targetQuest: 13, targetTask: 2, hint: 'Cyfry z korytarza' },
        ],
        jumpTargets: [15], physicalLocation: 'BRAMA FINAŁOWA' },
  15: { requires: [1, 7, 12, 14], provides: ['key'],
        backRefs: [
          { targetQuest: 1, targetTask: 2, hint: '2 cyfry startowe' },
          { targetQuest: 7, targetTask: 5, hint: '4 cyfry kodu' },
          { targetQuest: 12, targetTask: 1, hint: 'Symbol końcowy' },
        ],
        jumpTargets: [], physicalLocation: 'CENTRUM LABIRYNTU' },
};

/* ============================================================
   FINAL CODE STRUCTURE
   ============================================================ */

export const FINAL_CODE_STRUCTURE = {
  positions: [
    { questId: 1, type: 'digits' as FragmentType, length: 2, position: 0 },
    { questId: 7, type: 'digits' as FragmentType, length: 4, position: 1 },
    { questId: 12, type: 'symbol' as FragmentType, length: 1, position: 2 },
    { questId: 5, type: 'digits' as FragmentType, length: 2, position: 3 },
    { questId: 15, type: 'key' as FragmentType, length: 4, position: 4 },
  ],

  validate(fragments: CodeFragment[]): boolean {
    return this.positions.every((pos) =>
      fragments.some(
        (f) =>
          f.questId === pos.questId &&
          f.type === pos.type &&
          f.fragment.length >= pos.length
      )
    );
  },

  assemble(fragments: CodeFragment[]): string {
    return this.positions
      .map((pos) => {
        const frag = fragments.find(
          (f) => f.questId === pos.questId && f.type === pos.type
        );
        return frag?.fragment ?? '??';
      })
      .join('-');
  },
};

/* ============================================================
   QUEST METADATA + FACTORIES
   ============================================================ */

const QUEST_METADATA: Array<{
  id: number;
  slug: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  points: number;
  estimatedTime: number;
  title: { pl: string; en: string };
  description: { pl: string; en: string };
}> = [
  { id: 1, slug: 'intro', type: 'intro', difficulty: 'easy', points: 100, estimatedTime: 5,
    title: { pl: 'Inicjalizacja Systemu', en: 'System Initialization' },
    description: { pl: 'Stwórz profil i poznaj system NFC', en: 'Create profile and learn NFC system' } },
  { id: 2, slug: 'nfc-tutorial', type: 'nfc', difficulty: 'easy', points: 150, estimatedTime: 8,
    title: { pl: 'Trening NFC', en: 'NFC Training' },
    description: { pl: 'Naucz się skanować punkty NFC', en: 'Learn to scan NFC points' } },
  { id: 3, slug: 'quiz', type: 'quiz', difficulty: 'medium', points: 200, estimatedTime: 7,
    title: { pl: 'Quiz Labiryntowy', en: 'Maze Quiz' },
    description: { pl: 'Sprawdź swoją wiedzę', en: 'Test your knowledge' } },
  { id: 4, slug: 'puzzle', type: 'puzzle', difficulty: 'medium', points: 250, estimatedTime: 10,
    title: { pl: 'Labirynt Sygnałów', en: 'Signal Maze' },
    description: { pl: 'Rozwiąż logiczne łamigłówki', en: 'Solve logical puzzles' } },
  { id: 5, slug: 'memory', type: 'memory', difficulty: 'medium', points: 250, estimatedTime: 10,
    title: { pl: 'Pamięć Sieci', en: 'Network Memory' },
    description: { pl: 'Wyzwania pamięciowe', en: 'Memory challenges' } },
  { id: 6, slug: 'speed', type: 'speed', difficulty: 'hard', points: 300, estimatedTime: 8,
    title: { pl: 'Refleks Reaktora', en: 'Reactor Reflex' },
    description: { pl: 'Test szybkości i refleksu', en: 'Speed and reflex test' } },
  { id: 7, slug: 'code', type: 'puzzle', difficulty: 'hard', points: 300, estimatedTime: 12,
    title: { pl: 'Kod w Kukurydzy', en: 'Corn Code' },
    description: { pl: 'Odkryj ukryty kod', en: 'Discover the hidden code' } },
  { id: 8, slug: 'hidden', type: 'hidden', difficulty: 'hard', points: 350, estimatedTime: 10,
    title: { pl: 'Ukryty Sygnał', en: 'Hidden Signal' },
    description: { pl: 'Znajdź to czego nie widać', en: 'Find what is not seen' } },
  { id: 9, slug: 'decision', type: 'decision', difficulty: 'medium', points: 300, estimatedTime: 10,
    title: { pl: 'Ścieżka Przeznaczenia', en: 'Path of Fate' },
    description: { pl: 'Twoje wybory mają znaczenie', en: 'Your choices matter' } },
  { id: 10, slug: 'trap', type: 'trap', difficulty: 'hard', points: 300, estimatedTime: 8,
    title: { pl: 'Strefa Pułapek', en: 'Trap Zone' },
    description: { pl: 'Test cierpliwości i mądrości', en: 'Patience and wisdom test' } },
  { id: 11, slug: 'math', type: 'logic', difficulty: 'extreme', points: 400, estimatedTime: 15,
    title: { pl: 'Hub Logiczny', en: 'Logic Hub' },
    description: { pl: 'Centrum obliczeń labiryntu', en: 'Maze computation center' } },
  { id: 12, slug: 'pattern', type: 'pattern', difficulty: 'extreme', points: 400, estimatedTime: 15,
    title: { pl: 'Wieża Wzorców', en: 'Pattern Tower' },
    description: { pl: 'Łam szyfry i wzory', en: 'Break ciphers and patterns' } },
  { id: 13, slug: 'timed', type: 'timer', difficulty: 'extreme', points: 500, estimatedTime: 10,
    title: { pl: 'Korytarz Finałowy', en: 'Final Corridor' },
    description: { pl: 'Wszystko pod presją czasu', en: 'Everything under time pressure' } },
  { id: 14, slug: 'final-gate', type: 'puzzle', difficulty: 'extreme', points: 500, estimatedTime: 12,
    title: { pl: 'Brama Finałowa', en: 'Final Gate' },
    description: { pl: 'Ostatnia przeszkoda', en: 'Last obstacle' } },
  { id: 15, slug: 'meta', type: 'boss', difficulty: 'extreme', points: 1000, estimatedTime: 20,
    title: { pl: 'Meta Boss', en: 'Meta Boss' },
    description: { pl: 'Walka o zakończenie', en: 'Fight for the ending' } },
  { id: 97, slug: 'ancient-guardian', type: 'hidden', difficulty: 'extreme', points: 750, estimatedTime: 15,
    title: { pl: 'Starożytny Strażnik', en: 'Ancient Guardian' },
    description: { pl: 'Sekretne zagadki', en: 'Secret riddles' } },
  { id: 98, slug: 'corn-whisperer', type: 'hidden', difficulty: 'hard', points: 500, estimatedTime: 12,
    title: { pl: 'Szeptacz Kukurydzy', en: 'Corn Whisperer' },
    description: { pl: 'Mistyczna ścieżka', en: 'Mystic path' } },
  { id: 99, slug: 'ghost-farmer', type: 'hidden', difficulty: 'hard', points: 600, estimatedTime: 12,
    title: { pl: 'Duch Farmera', en: 'Ghost Farmer' },
    description: { pl: 'Pomóż uwięzionej duszy', en: 'Help a trapped soul' } },
];

const createInitialQuests = (): Quest[] =>
  QUEST_METADATA.map((meta) => {
    const deps = QUEST_DEPENDENCIES[meta.id];

    return {
      id: meta.id,
      slug: meta.slug,
      title: meta.title,
      description: meta.description,
      type: meta.type,
      difficulty: meta.difficulty,
      points: meta.points,
      season: 1,
      estimatedTime: meta.estimatedTime,
      status: meta.id <= 2 ? ('unlocked' as QuestStatus) : ('locked' as QuestStatus),
      requiresQuestId: deps?.requires[0] ?? null,
      physicalLocation: deps?.physicalLocation
        ? { pl: deps.physicalLocation, en: deps.physicalLocation }
        : undefined,
      rewards: {
        xp: meta.points,
        fragment: deps?.provides[0],
      },
    };
  });

const createInitialQuestProgress = (): Record<number, QuestProgress> => {
  const progress: Record<number, QuestProgress> = {};

  QUEST_METADATA.forEach((meta) => {
    progress[meta.id] = {
      questId: meta.id,
      status: meta.id <= 2 ? 'unlocked' : 'locked',
      currentTask: 0,
      totalTasks: 0,
      attempts: 0,
      completedTasks: [],
    };
  });

  return progress;
};

/* ============================================================
   STORE TYPE
   ============================================================ */

type State = {
  quests: Quest[];
  questProgress: Record<number, QuestProgress>;
  currentQuest: number;
  completedQuests: number[];
  unlockedQuests: number[];
  player: Player | null;
  playerName: string;
  playerAvatar: string;
  codeFragments: CodeFragment[];
  memory: MemoryEntry[];
  activeJump: JumpRequest | null;
  jumpHistory: JumpRequest[];
  pendingBackRef: BackReference | null;
  totalScore: number;
  gameStarted: boolean;
  startTime: number | null;
  hiddenQuestsUnlocked: number[];
  lang: Lang;
  cornMode: boolean;
  secretCodeInput: string;
  adminUnlocked: boolean;
  demoMode: boolean;

  startGame: () => void;
  resetGame: () => void;
  setGameStarted: () => void;

  updatePlayer: (player: Player) => void;
  setPlayerName: (name: string) => void;
  setPlayerAvatar: (avatar: string) => void;

  initQuest: (id: number, totalTasks: number) => void;
  completeTask: (questId: number, taskIndex: number) => void;
  completeQuest: (id: number) => void;
  forceCompleteQuest: (id: number) => void;
  failQuest: (id: number) => void;
  resetQuest: (id: number) => void;

  addCodeFragment: (fragment: CodeFragment) => void;
  getFragmentsForQuest: (questId: number) => CodeFragment[];
  getFinalCode: () => string;
  isFinalCodeComplete: () => boolean;

  setMemory: (key: string, value: string, fromQuest: number) => void;
  getMemory: (key: string) => string | undefined;
  hasMemory: (key: string) => boolean;

  requestJump: (jump: JumpRequest) => void;
  clearJump: () => void;

  requestBackRef: (ref: BackReference) => void;
  clearBackRef: () => void;

  isQuestAvailable: (questId: number) => boolean;
  getRequiredQuests: (questId: number) => number[];
  getQuestsThatNeed: (questId: number) => number[];

  addScore: (points: number) => void;

  unlockHiddenQuest: (id: number) => void;

  setLang: (lang: Lang) => void;

  toggleCornMode: () => void;
  setSecretCodeInput: (value: string) => void;

  isQuestCompleted: (id: number) => boolean;
  getQuestById: (id: number) => Quest | undefined;
  getElapsedTime: () => number;

  unlockAdmin: (code: string) => void;
};

/* ============================================================
   STORE IMPLEMENTATION
   ============================================================ */

export const useGameStore = create<State>()(
  persist(
    (set, get) => ({
      /* ========== INITIAL STATE ========== */
      quests: createInitialQuests(),
      questProgress: createInitialQuestProgress(),
      currentQuest: 1,
      completedQuests: [],
      unlockedQuests: [1, 2],
      player: null,
      playerName: '',
      playerAvatar: '🌽',
      codeFragments: [],
      memory: [],
      activeJump: null,
      jumpHistory: [],
      pendingBackRef: null,
      totalScore: 0,
      gameStarted: false,
      startTime: null,
      hiddenQuestsUnlocked: [],
      lang: 'pl',
      cornMode: false,
      secretCodeInput: '',
      adminUnlocked: false,
      demoMode: false,

      /* ========== GAME CONTROL ========== */

      startGame: () =>
        set({
          gameStarted: true,
          currentQuest: 1,
          completedQuests: [],
          unlockedQuests: [1, 2],
          quests: createInitialQuests(),
          questProgress: createInitialQuestProgress(),
          codeFragments: [],
          memory: [],
          activeJump: null,
          jumpHistory: [],
          pendingBackRef: null,
          totalScore: 0,
          startTime: Date.now(),
          hiddenQuestsUnlocked: [],
        }),

      setGameStarted: () => {
        if (!get().startTime) {
          set({ startTime: Date.now(), gameStarted: true });
        }
      },

      resetGame: () =>
        set({
          quests: createInitialQuests(),
          questProgress: createInitialQuestProgress(),
          currentQuest: 1,
          completedQuests: [],
          unlockedQuests: [1, 2],
          player: null,
          playerName: '',
          playerAvatar: '🌽',
          codeFragments: [],
          memory: [],
          activeJump: null,
          jumpHistory: [],
          pendingBackRef: null,
          totalScore: 0,
          gameStarted: false,
          startTime: null,
          hiddenQuestsUnlocked: [],
          cornMode: false,
          secretCodeInput: '',
        }),

      /* ========== PLAYER ========== */

      updatePlayer: (player) => set({ player }),

      setPlayerName: (name) => {
        const cleaned = name.trim().toUpperCase().slice(0, 12);
        set({
          playerName: cleaned,
          player: {
            ...(get().player ?? {
              name: cleaned,
              avatar: get().playerAvatar,
              createdAt: Date.now(),
            }),
            name: cleaned,
          },
        });
      },

      setPlayerAvatar: (avatar) => {
        set({
          playerAvatar: avatar,
          player: {
            ...(get().player ?? {
              name: get().playerName,
              avatar,
              createdAt: Date.now(),
            }),
            avatar,
          },
        });
      },

      /* ========== QUEST PROGRESS (task tracking) ========== */

      initQuest: (id, totalTasks) =>
        set((s) => ({
          questProgress: {
            ...s.questProgress,
            [id]: {
              questId: id,
              status: 'in_progress',
              currentTask: 0,
              totalTasks,
              attempts: 0,
              completedTasks: new Array(totalTasks).fill(false),
              startedAt: Date.now(),
            },
          },
        })),

      completeTask: (questId, taskIndex) =>
        set((s) => {
          const progress = s.questProgress[questId];
          if (!progress) return s;

          const tasks = [...progress.completedTasks];
          tasks[taskIndex] = true;

          return {
            questProgress: {
              ...s.questProgress,
              [questId]: {
                ...progress,
                completedTasks: tasks,
                currentTask: taskIndex + 1,
              },
            },
          };
        }),

      completeQuest: (id) =>
        set((s) => {
          if (s.completedQuests.includes(id)) return s;

          const updatedQuests = s.quests.map((q) =>
            q.id === id ? { ...q, status: 'completed' as QuestStatus } : q
          );

          const updatedProgress = { ...s.questProgress };
          if (updatedProgress[id]) {
            updatedProgress[id] = {
              ...updatedProgress[id],
              status: 'completed',
              completedAt: Date.now(),
            };
          }

          /* Odblokuj zależne questy */
          Object.entries(QUEST_DEPENDENCIES).forEach(([qId, dep]) => {
            const questId = Number(qId);
            const allMet = dep.requires.every((req) =>
              [...s.completedQuests, id].includes(req)
            );

            if (allMet && updatedProgress[questId]?.status === 'locked') {
              updatedProgress[questId] = {
                ...updatedProgress[questId],
                status: 'unlocked',
                unlockedBy: dep.requires,
              };

              const idx = updatedQuests.findIndex((q) => q.id === questId);
              if (idx !== -1) {
                updatedQuests[idx] = {
                  ...updatedQuests[idx],
                  status: 'unlocked',
                };
              }
            }
          });

          const newUnlocked = Array.from(
            new Set(
              updatedQuests
                .filter((q) => q.status === 'unlocked' || q.status === 'in_progress')
                .map((q) => q.id)
            )
          );

          return {
            completedQuests: [...s.completedQuests, id],
            currentQuest: id + 1,
            unlockedQuests: newUnlocked,
            quests: updatedQuests,
            questProgress: updatedProgress,
          };
        }),

      forceCompleteQuest: (id) => {
        const state = get();
        if (!state.completedQuests.includes(id)) {
          state.completeQuest(id);
        }
      },

      failQuest: (id) =>
        set((s) => ({
          questProgress: {
            ...s.questProgress,
            [id]: {
              ...s.questProgress[id],
              status: 'failed',
              attempts: (s.questProgress[id]?.attempts ?? 0) + 1,
            },
          },
        })),

      resetQuest: (id) =>
        set((s) => {
          const progress = s.questProgress[id];
          if (!progress) return s;

          return {
            questProgress: {
              ...s.questProgress,
              [id]: {
                ...progress,
                status: 'unlocked',
                currentTask: 0,
                completedTasks: new Array(progress.totalTasks).fill(false),
              },
            },
          };
        }),

      /* ========== CODE FRAGMENTS ========== */

      addCodeFragment: (fragment) =>
        set((s) => {
          const exists = s.codeFragments.some(
            (f) => f.questId === fragment.questId && f.type === fragment.type
          );
          if (exists) return s;
          return { codeFragments: [...s.codeFragments, fragment] };
        }),

      getFragmentsForQuest: (questId) =>
        get().codeFragments.filter((f) => f.questId === questId),

      getFinalCode: () => FINAL_CODE_STRUCTURE.assemble(get().codeFragments),

      isFinalCodeComplete: () =>
        FINAL_CODE_STRUCTURE.validate(get().codeFragments),

      /* ========== MEMORY ========== */

      setMemory: (key, value, fromQuest) =>
        set((s) => {
          const filtered = s.memory.filter((m) => m.key !== key);
          return {
            memory: [
              ...filtered,
              { key, value, fromQuest, timestamp: Date.now() },
            ],
          };
        }),

      getMemory: (key) => get().memory.find((m) => m.key === key)?.value,

      hasMemory: (key) => get().memory.some((m) => m.key === key),

      /* ========== JUMPS ========== */

      requestJump: (jump) =>
        set((s) => ({
          activeJump: { ...jump, timestamp: Date.now() },
          jumpHistory: [...s.jumpHistory, { ...jump, timestamp: Date.now() }],
        })),

      clearJump: () => set({ activeJump: null }),

      /* ========== BACK-REFS ========== */

      requestBackRef: (ref) => set({ pendingBackRef: ref }),

      clearBackRef: () => set({ pendingBackRef: null }),

      /* ========== DEPENDENCIES ========== */

      isQuestAvailable: (questId) => {
        const progress = get().questProgress[questId];
        if (!progress) return false;
        if (progress.status === 'unlocked' || progress.status === 'in_progress') return true;
        if (progress.status === 'completed') return false;

        const deps = QUEST_DEPENDENCIES[questId];
        if (!deps) return false;

        return deps.requires.every((req) =>
          get().completedQuests.includes(req)
        );
      },

      getRequiredQuests: (questId) =>
        QUEST_DEPENDENCIES[questId]?.requires ?? [],

      getQuestsThatNeed: (questId) =>
        Object.entries(QUEST_DEPENDENCIES)
          .filter(([, dep]) => dep.requires.includes(questId))
          .map(([id]) => Number(id)),

      /* ========== SCORE ========== */

      addScore: (points) =>
        set((s) => ({ totalScore: s.totalScore + points })),

      /* ========== HIDDEN QUESTS ========== */

      unlockHiddenQuest: (id) =>
        set((s) => {
          if (s.hiddenQuestsUnlocked.includes(id)) return s;

          const updatedQuests = s.quests.map((q) =>
            q.id === id ? { ...q, status: 'unlocked' as QuestStatus } : q
          );

          const updatedProgress = { ...s.questProgress };
          if (updatedProgress[id]) {
            updatedProgress[id] = {
              ...updatedProgress[id],
              status: 'unlocked',
            };
          }

          return {
            hiddenQuestsUnlocked: [...s.hiddenQuestsUnlocked, id],
            quests: updatedQuests,
            questProgress: updatedProgress,
          };
        }),

      /* ========== UI ========== */

      setLang: (lang) => set({ lang }),

      /* ========== SECRETS ========== */

      toggleCornMode: () =>
        set((s) => ({ cornMode: !s.cornMode })),

      setSecretCodeInput: (value) =>
        set({ secretCodeInput: value }),

      /* ========== HELPERS ========== */

      isQuestCompleted: (id) => get().completedQuests.includes(id),

      getQuestById: (id) => get().quests.find((q) => q.id === id),

      getElapsedTime: () => {
        const start = get().startTime;
        if (!start) return 0;
        return Math.floor((Date.now() - start) / 1000);
      },

      /* ========== ADMIN ========== */

      unlockAdmin: (code) => {
        if (code === 'ADMIN2026') {
          set({
            adminUnlocked: true,
            demoMode: true,
          });
        }
      },
    }),
    {
      name: 'labiryntzator-game-v2',
    }
  )
);