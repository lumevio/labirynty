import type { ComponentType } from 'react';

import Quest1Intro from './Quest1Intro';
import Quest2NfcTutorial from './Quest2NfcTutorial';
import Quest3Quiz from './Quest3Quiz';
import Quest4Puzzle from './Quest4Puzzle';
import Quest5Memory from './Quest5Memory';
import Quest6Speed from './Quest6Speed';
import Quest7Code from './Quest7Code';
import Quest8Hidden from './Quest8Hidden';
import Quest9Decision from './Quest9Decision';
import Quest10Trap from './Quest10Trap';
import Quest11Math from './Quest11Math';
import Quest12Pattern from './Quest12Pattern';
import Quest13Timed from './Quest13Timed';
import Quest14FinalGate from './Quest14FinalGate';
import Quest15Meta from './Quest15Meta';

// 🌟 HIDDEN QUESTS
import Quest97AncientGuardian from './hidden/Quest97AncientGuardian';
import Quest98CornWhisperer from './hidden/Quest98CornWhisperer';
import Quest99GhostFarmer from './hidden/Quest99GhostFarmer';

export type QuestComponentProps = {
  onComplete: () => void;
  onFail: () => void;
};

export const QUEST_REGISTRY: Record<number, ComponentType<QuestComponentProps>> = {
  1: Quest1Intro,
  2: Quest2NfcTutorial,
  3: Quest3Quiz,
  4: Quest4Puzzle,
  5: Quest5Memory,
  6: Quest6Speed,
  7: Quest7Code,
  8: Quest8Hidden,
  9: Quest9Decision,
  10: Quest10Trap,
  11: Quest11Math,
  12: Quest12Pattern,
  13: Quest13Timed,
  14: Quest14FinalGate,
  15: Quest15Meta,

  // 🌟 HIDDEN
  97: Quest97AncientGuardian,
  98: Quest98CornWhisperer,
  99: Quest99GhostFarmer,
};

export const HIDDEN_QUEST_IDS = [97, 98, 99];

export const isHiddenQuest = (id: number) => HIDDEN_QUEST_IDS.includes(id);