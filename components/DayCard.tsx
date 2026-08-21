'use client';

import { useState, type FormEvent } from 'react';
import { api, ApiError, type Day, type Trip } from '@/lib/api';

interface DayCardProps {
  tripId: string;
  day: Day;
  token: string;
  onUpdate: (trip: Trip) => void;
}

interface NewActivityForm {
  time: string;
  name: string;
  category: string;
  description: string;
  costEstimate: string;
}

const EMPTY_ACTIVITY: NewActivityForm = { time: '', name: '', category: '', description: '', costEstimate: '' };

export function DayCard({ tripId, day, token, onUpdate }: DayCardProps) {
  const [newActivity, setNewActivity] = useState<NewActivityForm>(EMPTY_ACTIVITY);
  const [adding, setAdding] = useState(false);
  const [busyIdx, setBusyIdx] = useState<number | null>(null);
  const [showRegenForm, setShowRegenForm] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (idx: number) => {
    setError(null);
    setBusyIdx(idx);
    try {
      const trip = await api.removeActivity(tripId, day.day, idx, token);
      onUpdate(trip);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to remove activity');
    } finally {
      setBusyIdx(null);
    }
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newActivity.time || !newActivity.name || !newActivity.category || !newActivity.description) {
      setError('Time, name, category, and description are required.');
      return;
    }
    setError(null);
    setAdding(true);
    try {
      const trip = await api.addActivity(
        tripId,
        day.day,
        {
          time: newActivity.time,
          name: newActivity.name,
          category: newActivity.category,
          description: newActivity.description,
          costEstimate: newActivity.costEstimate ? Number(newActivity.costEstimate) : undefined,
        },
        token
      );
      onUpdate(trip);
      setNewActivity(EMPTY_ACTIVITY);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add activity');
    } finally {
      setAdding(false);
    }
  };

  const handleRegenerate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegenerating(true);
    try {
      const trip = await api.regenerateDay(tripId, day.day, instruction.trim() || undefined, token);
      onUpdate(trip);
      setShowRegenForm(false);
      setInstruction('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to regenerate day');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="card day-card">
      <div className="day-card-header">
        <h3>
          Day {day.day} · {day.location}
        </h3>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowRegenForm((v) => !v)}
          disabled={regenerating}
        >
          🔁 Regenerate day
        </button>
      </div>

      {day.neighborhood && <p className="day-card-neighborhood">📍 {day.neighborhood}</p>}
      {day.transport && <p className="day-card-transport">🚗 {day.transport}</p>}

      {error && <div className="alert alert-error alert-sm">{error}</div>}

      {showRegenForm && (
        <form className="regen-form" onSubmit={handleRegenerate}>
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Optional: e.g., focus on street food and markets"
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={regenerating}>
            {regenerating ? 'Regenerating…' : 'Regenerate'}
          </button>
        </form>
      )}

      {regenerating && (
        <div className="inline-loading">Regenerating day {day.day}… this may take up to 30 seconds.</div>
      )}

      <ul className="activity-list">
        {day.activities.map((activity, idx) => (
          <li key={idx} className="activity-item">
            <div className="activity-item-main">
              <span className="activity-time">{activity.time}</span>
              <span className="activity-name">{activity.name}</span>
              <span className="activity-category">{activity.category}</span>
            </div>
            <p className="activity-description">{activity.description}</p>
            <div className="activity-item-footer">
              {typeof activity.costEstimate === 'number' && (
                <span className="activity-cost">~{activity.costEstimate}</span>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-danger"
                onClick={() => handleRemove(idx)}
                disabled={busyIdx === idx}
                aria-label={`Remove ${activity.name}`}
              >
                {busyIdx === idx ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </li>
        ))}
        {day.activities.length === 0 && <li className="activity-empty">No activities yet.</li>}
      </ul>

      <form className="add-activity-form" onSubmit={handleAdd}>
        <div className="add-activity-grid">
          <input
            aria-label="Time"
            placeholder="Time (e.g., 09:00)"
            value={newActivity.time}
            onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
          />
          <input
            aria-label="Activity name"
            placeholder="Activity name"
            value={newActivity.name}
            onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
          />
          <input
            aria-label="Category"
            placeholder="Category"
            value={newActivity.category}
            onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
          />
          <input
            aria-label="Cost estimate"
            placeholder="Cost estimate"
            type="number"
            value={newActivity.costEstimate}
            onChange={(e) => setNewActivity({ ...newActivity, costEstimate: e.target.value })}
          />
        </div>
        <input
          aria-label="Description"
          placeholder="Description"
          value={newActivity.description}
          onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
          className="add-activity-description"
        />
        <button type="submit" className="btn btn-secondary btn-sm" disabled={adding}>
          {adding ? 'Adding…' : '+ Add activity'}
        </button>
      </form>
    </div>
  );
}
