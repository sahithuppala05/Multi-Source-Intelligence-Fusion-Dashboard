import React from 'react';

export default function LoadingOverlay({ message = 'LOADING INTELLIGENCE DATA...' }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm">
      <div className="intel-panel p-8 flex flex-col items-center gap-4">
        {/* Animated radar */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border border-osint/20" />
          <div className="absolute inset-2 rounded-full border border-osint/30" />
          <div className="absolute inset-4 rounded-full border border-osint/40" />
          <div
            className="absolute inset-0 rounded-full border-t-2 border-osint"
            style={{ animation: 'spin 1.5s linear infinite' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-osint animate-pulse" />
          </div>
        </div>

        <div className="text-center">
          <p className="font-mono text-xs text-osint tracking-widest">{message}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-osint/60 rounded-full"
                style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
