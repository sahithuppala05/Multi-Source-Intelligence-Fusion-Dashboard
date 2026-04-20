import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TYPE_CONFIG = {
  OSINT: { color: '#00d4ff', glow: '#00d4ff', label: 'OSINT' },
  HUMINT: { color: '#ff6b35', glow: '#ff6b35', label: 'HUMINT' },
  IMINT: { color: '#a78bfa', glow: '#7c3aed', label: 'IMINT' },
};

function createMarkerIcon(type, isSelected = false) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.OSINT;
  const size = isSelected ? 20 : 14;
  const glowRadius = isSelected ? 30 : 20;

  const svg = `
    <svg width="${glowRadius * 2}" height="${glowRadius * 2}" viewBox="0 0 ${glowRadius * 2} ${glowRadius * 2}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-${type}">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="${glowRadius}" cy="${glowRadius}" r="${glowRadius - 4}" fill="${cfg.color}10" stroke="${cfg.color}40" stroke-width="1"/>
      <circle cx="${glowRadius}" cy="${glowRadius}" r="${size / 2 + 2}" fill="${cfg.color}30" filter="url(#glow-${type})"/>
      <rect x="${glowRadius - size / 2}" y="${glowRadius - size / 2}" width="${size}" height="${size}" 
        fill="${cfg.color}" opacity="${isSelected ? 1 : 0.9}" 
        transform="rotate(45, ${glowRadius}, ${glowRadius})"
        filter="url(#glow-${type})"/>
      <rect x="${glowRadius - size / 2 + 2}" y="${glowRadius - size / 2 + 2}" width="${size - 4}" height="${size - 4}" 
        fill="${cfg.color}40"
        transform="rotate(45, ${glowRadius}, ${glowRadius})"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [glowRadius * 2, glowRadius * 2],
    iconAnchor: [glowRadius, glowRadius],
    popupAnchor: [0, -glowRadius],
  });
}

function createPopupContent(item) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.OSINT;
  const confidence = item.confidence || 50;

  return `
    <div style="min-width:260px; max-width:320px; background:#0a0f1e; color:#e2e8f0; font-family:'Rajdhani',sans-serif;">
      <!-- Header -->
      <div style="padding:10px 14px 8px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.15em; color:${cfg.color}; background:${cfg.color}15; border:1px solid ${cfg.color}50; padding:2px 6px;">${item.type}</span>
        <span style="font-family:'JetBrains Mono',monospace; font-size:9px; color:#475569;">${new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
      
      ${item.imageUrl ? `
      <div style="position:relative; overflow:hidden; height:120px;">
        <img src="${item.imageUrl}" alt="${item.title}" 
          style="width:100%; height:100%; object-fit:cover; opacity:0.85;"
          onerror="this.parentElement.style.display='none'"/>
        <div style="position:absolute; inset:0; background:linear-gradient(to bottom, transparent 60%, #0a0f1e);"></div>
      </div>` : ''}

      <!-- Content -->
      <div style="padding:10px 14px 12px;">
        <h3 style="font-family:'Orbitron',sans-serif; font-size:13px; font-weight:600; color:#f1f5f9; margin:0 0 6px; letter-spacing:0.05em; line-height:1.3;">
          ${item.title}
        </h3>
        
        ${item.description ? `
        <p style="font-size:12px; color:#94a3b8; margin:0 0 10px; line-height:1.5;">
          ${item.description}
        </p>` : ''}

        <!-- Coordinates -->
        <div style="display:flex; gap:10px; margin-bottom:8px;">
          <div style="font-family:'JetBrains Mono',monospace; font-size:9px; color:#475569;">
            <span style="color:#64748b;">LAT</span> ${parseFloat(item.latitude).toFixed(4)}
          </div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:9px; color:#475569;">
            <span style="color:#64748b;">LNG</span> ${parseFloat(item.longitude).toFixed(4)}
          </div>
        </div>

        <!-- Confidence bar -->
        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
            <span style="font-family:'JetBrains Mono',monospace; font-size:9px; color:#475569; letter-spacing:0.1em;">CONFIDENCE</span>
            <span style="font-family:'JetBrains Mono',monospace; font-size:9px; color:${cfg.color};">${confidence}%</span>
          </div>
          <div style="height:3px; background:#1e293b; border-radius:0;">
            <div style="height:3px; width:${confidence}%; background:${cfg.color}; box-shadow:0 0 6px ${cfg.color}80;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export default function IntelMap({ data, selectedId, onSelectMarker }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // Init map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    data.forEach((item) => {
      if (!item.latitude || !item.longitude) return;

      const isSelected = item._id === selectedId;
      const marker = L.marker([item.latitude, item.longitude], {
        icon: createMarkerIcon(item.type, isSelected),
        title: item.title,
      });

      marker.bindPopup(createPopupContent(item), {
        maxWidth: 340,
        minWidth: 260,
        className: 'intel-popup',
      });

      marker.on('click', () => {
        if (onSelectMarker) onSelectMarker(item._id);
      });

      marker.addTo(map);
      markersRef.current[item._id] = marker;
    });
  }, [data, selectedId, onSelectMarker]);

  // Pan to selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId) return;

    const item = data.find((d) => d._id === selectedId);
    if (!item) return;

    map.flyTo([item.latitude, item.longitude], Math.max(map.getZoom(), 6), {
      duration: 1.2,
    });

    const marker = markersRef.current[selectedId];
    if (marker) {
      setTimeout(() => marker.openPopup(), 800);
    }
  }, [selectedId, data]);

  return (
    <div className="relative w-full h-full">
      {/* Corner decorations */}
      <div className="absolute top-3 left-3 z-[400] pointer-events-none">
        <div className="w-4 h-4 border-t-2 border-l-2 border-osint/60" />
      </div>
      <div className="absolute top-3 right-3 z-[400] pointer-events-none">
        <div className="w-4 h-4 border-t-2 border-r-2 border-osint/60" />
      </div>
      <div className="absolute bottom-8 left-3 z-[400] pointer-events-none">
        <div className="w-4 h-4 border-b-2 border-l-2 border-osint/60" />
      </div>
      <div className="absolute bottom-8 right-3 z-[400] pointer-events-none">
        <div className="w-4 h-4 border-b-2 border-r-2 border-osint/60" />
      </div>

      {/* Legend */}
      <div className="absolute bottom-10 left-4 z-[400] intel-panel p-3 space-y-1.5">
        <div className="font-mono text-[9px] text-slate-500 tracking-widest mb-2">LEGEND</div>
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rotate-45" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.glow}` }} />
            <span className="font-mono text-[10px] tracking-widest" style={{ color: cfg.color }}>{type}</span>
          </div>
        ))}
      </div>

      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
