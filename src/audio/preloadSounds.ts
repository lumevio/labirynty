import { useCallback } from 'react';
import { playSound } from './audioEngine';

export function useSound(src: string, volume = 1) {
  return useCallback(() => {
    playSound(src, volume);
  }, [src, volume]);
}
export const preloadSounds = () => {
  // placeholder
};