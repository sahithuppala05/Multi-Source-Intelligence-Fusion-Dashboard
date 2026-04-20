import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 bg-alert/10 border-b border-alert/30 px-4 py-2 flex-shrink-0">
      <AlertTriangle className="w-4 h-4 text-alert flex-shrink-0" />
      <span className="font-mono text-xs text-alert flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-alert/60 hover:text-alert transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
