import type { Hotel } from '@/lib/api';

function tierClass(tier: string) {
  const key = tier.toLowerCase().replace(/\s+/g, '-');
  return `badge badge-tier-${key}`;
}

export function HotelList({ hotels }: { hotels: Hotel[] }) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <div className="card hotel-card">
      <h3>Hotel suggestions</h3>
      <ul className="hotel-list">
        {hotels.map((hotel, idx) => (
          <li key={`${hotel.name}-${idx}`} className="hotel-item">
            <div className="hotel-item-header">
              <span className="hotel-name">{hotel.name}</span>
              <span className={tierClass(hotel.tier)}>{hotel.tier}</span>
            </div>
            <p className="hotel-area">{hotel.area}</p>
            <p className="hotel-cost">~{hotel.estimatedCost.toLocaleString()} / night</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
