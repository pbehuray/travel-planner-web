'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { ErrorMessage } from '@/components/ErrorMessage';

const INTEREST_OPTIONS = [
  'Food',
  'Culture',
  'History',
  'Nature',
  'Adventure',
  'Nightlife',
  'Shopping',
  'Art',
  'Relaxation',
  'Family',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD'];

const TIERS = [
  { value: 'low', label: 'Low (budget-friendly)' },
  { value: 'medium', label: 'Medium (comfortable)' },
  { value: 'high', label: 'High (luxury)' },
];

function PlanFormContent() {
  const { token } = useAuth();
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [tier, setTier] = useState('medium');
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);

    if (!destination.trim()) {
      setError('Please enter a destination.');
      return;
    }

    const tierLabel = TIERS.find((t) => t.value === tier)?.label || tier;
    const budgetText = budget ? `${currency} ${budget} budget (${tierLabel})` : `${tierLabel} budget`;
    const interestsText = interests.length > 0 ? `Interested in: ${interests.join(', ')}.` : '';
    const requestText = `${duration} days in ${destination.trim()}, ${budgetText}. ${interestsText}`.trim();

    setSubmitting(true);
    try {
      const trip = await api.createPlan(requestText, token);
      router.push(`/trips/${trip._id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to generate plan. Please try again.');
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="page">
        <LoadingState label="Generating your itinerary… this can take 15-30 seconds while our agents research, plan, and validate your trip." />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Plan a new trip</h1>
      <form className="card plan-form" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        {error && <ErrorMessage message={error} />}

        <label className="field">
          <span>Destination</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Jaipur, India"
            required
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Number of days</span>
            <input
              type="number"
              min={1}
              max={30}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              required
            />
          </label>
          <label className="field">
            <span>Budget</span>
            <input
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g., 50000"
            />
          </label>
          <label className="field">
            <span>Currency</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="field">
          <legend>Budget tier</legend>
          <div className="radio-row">
            {TIERS.map((t) => (
              <label key={t.value} className="radio-option">
                <input
                  type="radio"
                  name="tier"
                  value={t.value}
                  checked={tier === t.value}
                  onChange={() => setTier(t.value)}
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Interests</legend>
          <div className="checkbox-grid">
            {INTEREST_OPTIONS.map((interest) => (
              <label key={interest} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={interests.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                />
                <span>{interest}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn btn-primary btn-block">
          Generate itinerary
        </button>
      </form>
    </div>
  );
}

export default function PlanPage() {
  return (
    <ProtectedRoute>
      <PlanFormContent />
    </ProtectedRoute>
  );
}
