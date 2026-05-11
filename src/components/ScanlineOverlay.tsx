export default function ScanlineOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* Scanline effect */}
      <div
        className="absolute inset-0 animate-scanline opacity-[0.015]"
        style={{
          background: 'linear-gradient(transparent 50%, rgba(255, 215, 0, 0.05) 50%)',
          backgroundSize: '100% 4px',
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      {/* Corner marks */}
      <div className="absolute top-4 left-4 w-5 h-5 border-l-2 border-t-2 border-corn-gold/20" />
      <div className="absolute top-4 right-4 w-5 h-5 border-r-2 border-t-2 border-corn-gold/20" />
      <div className="absolute bottom-4 left-4 w-5 h-5 border-l-2 border-b-2 border-corn-gold/20" />
      <div className="absolute bottom-4 right-4 w-5 h-5 border-r-2 border-b-2 border-corn-gold/20" />
    </div>
  );
}
