import { useId, type ReactNode } from 'react';

interface QuestFrameProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function QuestFrame({
  children,
  title,
  className = '',
}: QuestFrameProps) {
  const id = useId().replace(/:/g, '');

  return (
    <div className={`fixed inset-0 w-screen h-[100dvh] overflow-hidden ${className}`}>

      {/* BACKGROUND BASE */}
      <div className="absolute inset-0 bg-[#3D1F08]" />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, #8B4513 0%, #6B3410 40%, #4A220A 100%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)',
        }}
      />

      {/* TITLE (overlay) */}
      {title && (
        <div className="absolute top-0 left-0 right-0 z-30 flex justify-center">
          <div className="px-6 py-2 rounded-b-lg border-x-2 border-b-2 border-[#3D1F08] bg-gradient-to-b from-[#C97A3F] to-[#8B4513] shadow-md max-w-[90%]">
            <span className="font-orbitron text-[11px] font-bold tracking-widest text-[#FFE27A] block text-center">
              {title}
            </span>
          </div>
        </div>
      )}

      {/* CENTER LAYER (GLOBAL AUTO-CENTER) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4 pt-14">

        {/* TASK WRAPPER */}
        <div className="w-full flex items-center justify-center">

          {/* CONTENT CONTAINER */}
          <div className="w-full max-w-md flex flex-col items-center justify-center">
            {children}
          </div>

        </div>
      </div>

    </div>
  );
}