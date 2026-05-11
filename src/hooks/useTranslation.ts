import { useGameStore } from '../store/gameStore';

const translations = {
  pl: {
    startGame: 'Rozpocznij grę',
    continueGame: 'Kontynuuj',
    resetGame: 'Resetuj grę',
    enterCode: 'Wpisz kod...',
    cornMode: 'TRYB KUKURYDZY',
  },

  en: {
    startGame: 'Start Game',
    continueGame: 'Continue',
    resetGame: 'Reset Game',
    enterCode: 'Enter code...',
    cornMode: 'CORN MODE',
  },
};

export function useTranslation() {
  const lang = useGameStore((s) => s.lang);

  return {
    lang,
    t: translations[lang],
  };
}