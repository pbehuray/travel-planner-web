'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Day } from '@/lib/api';

// Leaflet touches window/document at import time, so it must never be part
// of the server-rendered bundle - load it as a client-only chunk.
const TripMapInner = dynamic(() => import('./TripMapInner').then((m) => m.TripMapInner), {
  ssr: false,
  loading: () => <div className="trip-map-wrap trip-map-placeholder">📍 Loading map…</div>,
});

export function TripMap({ destination, days }: { destination?: string; days: Day[] }) {
  const [open, setOpen] = useState(true);

  if (!days || days.length === 0) return null;

  return (
    <div className="card build-trace-card">
      <button type="button" className="build-trace-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>🗺️ Trip map</span>
        <span className="build-trace-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="build-trace-body">
          <TripMapInner destination={destination} days={days} />
        </div>
      )}
    </div>
  );
}
