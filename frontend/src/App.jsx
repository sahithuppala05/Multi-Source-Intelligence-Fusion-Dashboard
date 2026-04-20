import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import Sidebar from './components/Sidebar';
import IntelMap from './components/IntelMap';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorBanner from './components/ErrorBanner';
import { useIntelData } from './hooks/useIntelData';

export default function App() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const { data, loading, error, stats, refresh, remove } = useIntelData(activeFilter);

  // Check backend connection
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/data');
        setConnectionStatus(res.ok ? 'connected' : 'error');
      } catch {
        setConnectionStatus('error');
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setSelectedId(null);
  };

  const handleRemove = async (id) => {
    try {
      await remove(id);
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-ink-950 overflow-hidden">
      <Header stats={stats} connectionStatus={connectionStatus} />

      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onRefresh={refresh}
        loading={loading}
      />

      {error && <ErrorBanner message={error} onDismiss={() => {}} />}

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          data={data}
          selectedId={selectedId}
          onSelectItem={setSelectedId}
          onRefresh={refresh}
          onRemove={handleRemove}
        />

        <main className="flex-1 relative scanline-container">
          {loading && <LoadingOverlay />}
          <IntelMap
            data={data}
            selectedId={selectedId}
            onSelectMarker={setSelectedId}
          />
        </main>
      </div>
    </div>
  );
}
