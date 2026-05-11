interface QuestHUDProps {
  step: string;
  score?: string;
  streak?: string;
  progress: number; // 0 - 100
}

export default function QuestHUD({ step, score, streak, progress }: QuestHUDProps) {
  return (
    <div className="space-y-2 mb-4 bg-[#3D1F08]/40 p-3 rounded-lg border border-[#8B4513]/30">
      <div className="flex justify-between text-[10px] font-mono text-[#FFE27A]/80 font-bold tracking-wider">
        <span>{step}</span>
        {score && <span>🎯 {score}</span>}
        {streak && <span>⚡ {streak}</span>}
      </div>
      <div className="w-full h-1.5 bg-[#1A0C03] rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-[#C97A3F] to-[#FFE27A] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}