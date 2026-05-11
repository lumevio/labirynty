import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ================= TYPES ================= */

export type QuestStatus = 'locked' | 'unlocked' | 'completed';

export type Quest = {
  id: number;
  title: string;
  type: string;
  points: number;
  status: QuestStatus;
  requiresQuestId: number | null;
};

export type Quest = {
  id: number;

  slug: string;

  title: {
    pl: string;
    en: string;
  };

  description: {
    pl: string;
    en: string;
  };

  type:
    | 'intro'
    | 'quiz'
    | 'puzzle'
    | 'logic'
    | 'memory'
    | 'maze'
    | 'nfc'
    | 'boss'
    | 'video'
    | 'timer'
    | 'hidden';

  difficulty: 'easy' | 'medium' | 'hard';

  points: number;

  season: number;

  estimatedTime: number;

  status: QuestStatus;

  requiresQuestId: number | null;

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
  };

  translations?: {
    pl?: Record<string, string>;
    en?: Record<string, string>;
  };
};

type Lang = 'pl' | 'en';

type State = {
  /* QUESTS */
  quests: Quest[];

  currentQuest: number;
  completedQuests: number[];
  unlockedQuests: number[];

  /* PLAYER */
  player: Player | null;

  /* GAME */
  gameStarted: boolean;
  startTime: number | null;

  /* UI */
  lang: Lang;

  /* SECRET */
  cornMode: boolean;
  secretCodeInput: string;

  /* ADMIN */
  adminUnlocked: boolean;
  demoMode: boolean;

  /* GAME CONTROL */
  startGame: () => void;
  resetGame: () => void;

  /* PLAYER */
  updatePlayer: (player: Player) => void;

  /* QUESTS */
  completeQuest: (id: number) => void;
  forceCompleteQuest: (id: number) => void;

  /* UI */
  setLang: (lang: Lang) => void;

  /* SECRET */
  toggleCornMode: () => void;
  setSecretCodeInput: (value: string) => void;

  /* HELPERS */
  isQuestCompleted: (id: number) => boolean;
  getQuestById: (id: number) => Quest | undefined;
  getElapsedTime: () => number;

  /* ADMIN */
  unlockAdmin: (code: string) => void;
};

/* ================= QUEST FACTORY ================= */

const createQuests = (): Quest[] =>
  Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    title: `Quest ${i + 1}`,
    type: 'logic',
    points: 100,
    status: i === 0 ? 'unlocked' : 'locked',
    requiresQuestId: i === 0 ? null : i,
  }));

/* ================= STORE ================= */

export const useGameStore = create<State>()(
  persist(
    (set, get) => ({
      /* INITIAL */

      quests: createQuests(),

      currentQuest: 1,
      completedQuests: [],
      unlockedQuests: [1],

      player: null,

      gameStarted: false,
      startTime: null,

      lang: 'pl',

      cornMode: false,
      secretCodeInput: '',

      adminUnlocked: false,
      demoMode: false,

      /* ================= GAME ================= */

      startGame: () =>
        set({
          gameStarted: true,
          currentQuest: 1,
          completedQuests: [],
          unlockedQuests: [1],
          quests: createQuests(),
          startTime: Date.now(),
        }),

      resetGame: () =>
        set({
          quests: createQuests(),

          currentQuest: 1,
          completedQuests: [],
          unlockedQuests: [1],

          player: null,

          gameStarted: false,
          startTime: null,

          cornMode: false,
          secretCodeInput: '',
        }),

      /* ================= PLAYER ================= */

      updatePlayer: (player) =>
        set({
          player,
        }),

      /* ================= UI ================= */

      setLang: (lang) =>
        set({
          lang,
        }),

      /* ================= SECRET ================= */

      toggleCornMode: () =>
        set((state) => ({
          cornMode: !state.cornMode,
        })),

      setSecretCodeInput: (value) =>
        set({
          secretCodeInput: value,
        }),

      /* ================= QUESTS ================= */

      completeQuest: (id) => {
        const state = get();

        if (state.completedQuests.includes(id)) {
          return;
        }

        const nextQuest = id + 1;

        set({
          completedQuests: [...state.completedQuests, id],

          currentQuest: nextQuest,

          unlockedQuests: [
            ...new Set([...state.unlockedQuests, nextQuest]),
          ],

          quests: state.quests.map((quest) => {
            if (quest.id === id) {
              return {
                ...quest,
                status: 'completed' as QuestStatus,
              };
            }

            if (quest.id === nextQuest) {
              return {
                ...quest,
                status: 'unlocked' as QuestStatus,
              };
            }

            return quest;
          }),
        });
      },

      forceCompleteQuest: (id) => {
        const state = get();

        const nextQuest = id + 1;

        set({
          completedQuests: [
            ...new Set([...state.completedQuests, id]),
          ],

          currentQuest: nextQuest,

          unlockedQuests: [
            ...new Set([...state.unlockedQuests, nextQuest]),
          ],

          quests: state.quests.map((quest) => {
            if (quest.id === id) {
              return {
                ...quest,
                status: 'completed' as QuestStatus,
              };
            }

            if (quest.id === nextQuest) {
              return {
                ...quest,
                status: 'unlocked' as QuestStatus,
              };
            }

            return quest;
          }),
        });
      },

      /* ================= HELPERS ================= */

      isQuestCompleted: (id) => {
        return get().completedQuests.includes(id);
      },

      getQuestById: (id) => {
        return get().quests.find((q) => q.id === id);
      },

      getElapsedTime: () => {
        const start = get().startTime;

        if (!start) return 0;

        return Math.floor((Date.now() - start) / 1000);
      },

      /* ================= ADMIN ================= */

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
      name: 'game-store',
    }
  )
);