import React from 'react';
import { Radio, Shield, Clock } from 'lucide-react';

export default function Header({ stats, connectionStatus }) {
  const now = new Date();
  const timeStr = now.toUTCString().replace('GMT', 'UTC');

  return (
    <header className="intel-panel border-b border-ink-600 px-4 py-2 flex items-center justify-between flex-shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="w-7 h-7 text-osint" />
          <div className="absolute inset-0 animate-ping opacity-20">
            <Shield className="w-7 h-7 text-osint" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-base font-bold tracking-[0.15em] text-osint leading-none">
            MULTI-SOURCE INTEL
          </h1>
          <p className="font-mono text-[9px] text-slate-500 tracking-widest leading-none mt-0.5">
            INTELLIGENCE FUSION DASHBOARD
          </p>
        </div>
      </div>

      {/* Center stats */}
      <div className="hidden md:flex items-center gap-6">
        <StatPill label="OSINT" value={stats.OSINT} color="osint" />
        <StatPill label="HUMINT" value={stats.HUMINT} color="humint" />
        <StatPill label="IMINT" value={stats.IMINT} color="imint" />
        <div className="h-6 w-px bg-ink-600" />
        <div className="text-center">
          <div className="font-display text-xl font-bold text-slate-100">{stats.total}</div>
          <div className="font-mono text-[9px] text-slate-500 tracking-widest">TOTAL INTEL</div>
        </div>
      </div>

      {/* Right: status */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-slate-500 font-mono text-[10px]">
          <Clock className="w-3 h-3" />
          <span>{timeStr}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-success animate-pulse' : connectionStatus === 'error' ? 'bg-alert' : 'bg-warn animate-pulse'}`} />
          <span className="font-mono text-[10px] text-slate-500 uppercase">{connectionStatus}</span>
        </div>
        <div className="flex items-center gap-1.5 border border-osint/30 px-2 py-1">
          <Radio className="w-3 h-3 text-osint" />
          <span className="font-mono text-[10px] text-osint tracking-widest">LIVE</span>
        </div>
      </div>
    </header>
  );
}

function StatPill({ label, value, color }) {
  const colorMap = {
    osint: { text: 'text-osint', border: 'border-osint/40', bg: 'bg-osint/10' },
    humint: { text: 'text-humint', border: 'border-humint/40', bg: 'bg-humint/10' },
    imint: { text: 'text-imint', border: 'border-imint/40', bg: 'bg-imint/10' },
  };
  const c = colorMap[color];
  return (
    <div className={`flex items-center gap-2 px-2 py-1 border ${c.border} ${c.bg}`}>
      <span className={`font-mono text-[9px] tracking-widest ${c.text}`}>{label}</span>
      <span className={`font-display text-base font-bold ${c.text}`}>{value}</span>
    </div>
  );
}
