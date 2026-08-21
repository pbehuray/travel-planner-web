'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError, type Trip } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ValidationBadge } from '@/components/ValidationBadge';

function DashboardContent() {
  const { token } = useAuth();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getTrips(token)
      .then(setTrips)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load trips'));
  }, [token]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your trips</h1>
        <Link href="/plan" className="btn btn-primary">
          + New trip
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}
      {!trips && !error && <LoadingState label="Loading your trips…" />}

      {trips && trips.length === 0 && (
        <div className="empty-state">
          <p>No trips yet. Create your first AI-generated itinerary.</p>
          <Link href="/plan" className="btn btn-primary">
            Plan a trip
          </Link>
        </div>
      )}

      <div className="trip-grid">
        {trips?.map((trip) => (
          <Link key={trip._id} href={`/trips/${trip._id}`} className="card trip-card">
            <h2>{trip.tripSpec?.destination || 'Untitled trip'}</h2>
            <p className="trip-card-meta">
              {trip.tripSpec?.duration ? `${trip.tripSpec.duration} days` : ''}
              {trip.tripSpec?.budget ? ` · ${trip.tripSpec.currency || 'USD'} ${trip.tripSpec.budget}` : ''}
            </p>
            <p className="trip-card-request">&ldquo;{trip.request}&rdquo;</p>
            <div className="trip-card-footer">
              <ValidationBadge score={trip.review?.score} passed={trip.budget?.withinBudget} />
              <span className="trip-card-date">{new Date(trip.createdAt).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
