'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Day } from '@/lib/api';

interface Pin {
  day: number;
  label: string;
  lat: number;
  lon: number;
  approx?: boolean;
}

const DAY_COLORS = ['#4f46e5', '#0d9488', '#d97706', '#dc2626', '#7c3aed', '#059669', '#db2777', '#0891b2'];
const INDIA_FALLBACK: [number, number] = [20.5937, 78.9629];

function colorForDay(day: number) {
  return DAY_COLORS[(day - 1) % DAY_COLORS.length];
}

// Auto-frames the map to the current pins whenever they change: fits bounds
// around all pins (with padding), or centers at a sensible city zoom level
// if there's only one.
function FitBounds({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lon], 13);
    } else {
      const bounds = L.latLngBounds(pins.map((pin) => [pin.lat, pin.lon] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [pins, map]);
  return null;
}

function pinIcon(color: string, label: string) {
  return L.divIcon({
    className: 'trip-map-pin',
    html: `<span class="trip-map-pin-bg" style="background:${color}"><span class="trip-map-pin-label">${label}</span></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
}

// Simple, direct client-side geocode against Nominatim. No queue, no
// backend proxy - we only ever call this a handful of times (one per day's
// neighborhood), so a plain sequential loop is all that's needed.
async function geocode(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(results) || results.length === 0) return null;
    const lat = parseFloat(results[0].lat);
    const lon = parseFloat(results[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
}

export function TripMapInner({ destination, days }: { destination?: string; days: Day[] }) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const cache = new Map<string, { lat: number; lon: number } | null>();

    async function resolve(place: string): Promise<{ lat: number; lon: number } | null> {
      const query = destination ? `${place}, ${destination}` : place;
      const key = query.toLowerCase();
      let coords = cache.get(key);
      if (coords === undefined) {
        coords = await geocode(query);
        cache.set(key, coords);
      }
      return coords;
    }

    (async () => {
      setLoading(true);
      setPins([]);
      setFailedCount(0);

      // Sequential loop, one neighborhood at a time. Only ~1-2 lookups per day.
      for (const day of days) {
        if (cancelled) return;
        const neighborhood = day.neighborhood || day.location;
        if (!neighborhood) continue;

        let coords = await resolve(neighborhood);
        let approx = false;

        // Neighborhood too vague to geocode (e.g. "Northwest Kyoto") - fall
        // back to the city itself so the day still gets a pin, just at
        // city center instead of the precise area.
        if (!coords && day.location && day.location !== neighborhood) {
          if (cancelled) return;
          coords = await resolve(day.location);
          approx = true;
        }
        if (cancelled) return;

        if (coords) {
          setPins((prev) => [...prev, { day: day.day, label: neighborhood, lat: coords!.lat, lon: coords!.lon, approx }]);
        } else {
          setFailedCount((prev) => prev + 1);
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [days, destination]);

  // Don't mount the map with a placeholder center - wait for the first pin
  // (or for the loop to finish, if every lookup failed) so it opens on the
  // right part of the world.
  if (pins.length === 0 && loading) {
    return <div className="trip-map-wrap trip-map-placeholder">📍 Loading map…</div>;
  }

  const center: [number, number] = pins[0] ? [pins[0].lat, pins[0].lon] : INDIA_FALLBACK;
  const zoom = pins.length > 0 ? 12 : 4;

  return (
    <div className="trip-map-wrap">
      {loading && <div className="trip-map-loading">📍 Locating neighborhoods…</div>}
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="trip-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds pins={pins} />
        {pins.map((pin, idx) => (
          <Marker key={`${pin.day}-${idx}`} position={[pin.lat, pin.lon]} icon={pinIcon(colorForDay(pin.day), String(pin.day))}>
            <Popup>
              <strong>Day {pin.day}</strong>
              <br />
              {pin.label}
              {pin.approx && (
                <>
                  <br />
                  <em>couldn&apos;t be precisely located - showing city center</em>
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="trip-map-legend">
        {days.map((day) => (
          <span key={day.day} className="trip-map-legend-item">
            <span className="trip-map-legend-dot" style={{ background: colorForDay(day.day) }} />
            Day {day.day}
          </span>
        ))}
        {pins.some((pin) => pin.approx) && (
          <span className="trip-map-legend-note">
            📍 Some pins couldn&apos;t be precisely located - showing city center instead
          </span>
        )}
        {failedCount > 0 && (
          <span className="trip-map-legend-note">
            {failedCount} day{failedCount === 1 ? '' : 's'} couldn&apos;t be located at all
          </span>
        )}
      </div>
    </div>
  );
}
