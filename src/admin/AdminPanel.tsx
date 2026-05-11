export type QuestStepType =
  | 'dialog'
  | 'quiz'
  | 'puzzle'
  | 'memory'
  | 'timer'
  | 'nfc'
  | 'minigame'
  | 'reward'
  | 'cutscene';

export interface QuestStep {
  id: string;

  type: QuestStepType;

  title: {
    pl: string;
    en: string;
  };

  description: {
    pl: string;
    en: string;
  };

  asset?: string;

  config?: any;
}

export interface Quest {
  id: number;

  title: {
    pl: string;
    en: string;
  };

  description: {
    pl: string;
    en: string;
  };

  difficulty: 'easy' | 'medium' | 'hard';

  type: string;

  points: number;

  status: 'locked' | 'unlocked' | 'completed';

  seasonId?: number;

  nfcTagId?: string;

  rewards?: {
    xp?: number;
    item?: string;
    badge?: string;
  };

  steps: QuestStep[];
}