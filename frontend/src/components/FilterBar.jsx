import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';

const FILTERS = [
  { value: null, label: 'ALL SOURCES' },
  { value: 'OSINT', label: 'OSINT', color: 'osint' },
  { value: 'HUMINT', label: 'HUMINT', color: 'humint' },
  { value: 'IMINT', label: 'IMINT', color: 'imint' },
];

export default function FilterBar({ activeFilter, onFilterChange, onRefresh, loading }) {
  const colorMap = {
    osint: {
      active: 'bg-osint/20 border-osint text-osint shadow-[0_0_8px_#00d4ff40]',
      inactive: 'border-ink-600 text-slate-500 hover:border-osint/50 hover:text-osint',
    },
    humint: {
      active: 'bg-humint/20 border-humint text-humint shadow-[0_0_8px_#ff6b3540]',
      inactive: 'border-ink-600 text-slate-500 hover:border-humint/50 hover:text-humint',
    },
    imint: {
      active: 'bg-imint/20 border-imint text-imint shadow-[0_0_8px_#7c3aed40]',
      inactive: 'border-ink-600 text-slate-500 hover:border-imint/50 hover:text-imint',
    },
  };

  return (
    <div className="intel-panel border-b border-ink-600 px-4 py-2 flex items-center gap-3 flex-shrink-0">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Filter className="w-3.5 h-3.5" />
        <span className="font-mono text-[10px] tracking-widest">FILTER</span>
      </div>

      <div className="h-4 w-px bg-ink-600" />

      <div className="flex items-center gap-2">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.value;
          const colorClass = f.color
            ? isActive
              ? colorMap[f.color].active
              : colorMap[f.color].inactive
            : isActive
            ? 'bg-slate-700 border-slate-400 text-slate-100'
            : 'border-ink-600 text-slate-500 hover:border-slate-500 hover:text-slate-300';

          return (
            <button
              key={f.label}
              onClick={() => onFilterChange(f.value)}
              className={`px-3 py-1 border font-mono text-[10px] tracking-widest transition-all duration-200 ${colorClass}`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="ml-auto">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 border border-ink-600 text-slate-500 hover:border-slate-500 hover:text-slate-300 font-mono text-[10px] tracking-widest transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          REFRESH
        </button>
      </div>
    </div>
  );
}
