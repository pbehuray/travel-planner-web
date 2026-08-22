import type { Day } from '@/lib/api';

export function ReadOnlyDayCard({ day }: { day: Day }) {
  return (
    <div className="card day-card">
      <div className="day-card-header">
        <h3>
          Day {day.day} · {day.location}
        </h3>
      </div>

      {day.neighborhood && <p className="day-card-neighborhood">📍 {day.neighborhood}</p>}
      {day.transport && <p className="day-card-transport">🚗 {day.transport}</p>}

      <ul className="activity-list">
        {day.activities.map((activity, idx) => (
          <li key={idx} className="activity-item">
            <div className="activity-item-main">
              <span className="activity-time">{activity.time}</span>
              <span className="activity-name">{activity.name}</span>
              <span className="activity-category">{activity.category}</span>
            </div>
            <p className="activity-description">{activity.description}</p>
            {typeof activity.costEstimate === 'number' && (
              <div className="activity-item-footer">
                <span className="activity-cost">~{activity.costEstimate}</span>
              </div>
            )}
          </li>
        ))}
        {day.activities.length === 0 && <li className="activity-empty">No activities yet.</li>}
      </ul>
    </div>
  );
}
