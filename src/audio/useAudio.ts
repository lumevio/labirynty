import { useEffect } from 'react';
import { audioEngine } from '../audioEngine';

export const useAudio = () => {
  useEffect(() => {
    audioEngine.init();
  }, []);

  return {
    play: audioEngine.play.bind(audioEngine),
    ambient: audioEngine.playAmbient.bind(audioEngine),
    stopAmbient: audioEngine.stopAmbient.bind(audioEngine),
    music: audioEngine.playMusic.bind(audioEngine),
    unlock: audioEngine.unlock.bind(audioEngine),
  };
};