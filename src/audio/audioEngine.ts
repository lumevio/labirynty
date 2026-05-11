const cache = new Map<string, HTMLAudioElement>();

export const playSound = (src: string, volume = 1) => {
  let audio = cache.get(src);

  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    cache.set(src, audio);
  }

  audio.volume = volume;
  audio.currentTime = 0;

  audio.play().catch(() => {
    // autoplay block fallback
  });
};

export const stopSound = (src: string) => {
  const audio = cache.get(src);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};