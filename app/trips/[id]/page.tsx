'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError, type Trip } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ValidationBadge } from '@/components/ValidationBadge';
import { BudgetBreakdownCard } from '@/components/BudgetBreakdownCard';
import { HotelList } from '@/components/HotelList';
import { DayCard } from '@/components/DayCard';
import { WarningsBanner } from '@/components/WarningsBanner';
import { HowThisPlanWasBuilt } from '@/components/HowThisPlanWasBuilt';

function TripResultsContent() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;
  const { token } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTrip = useCallback(() => {
    if (!token || !tripId) return;
    api
      .getTrip(tripId, token)
      .then(setTrip)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load trip'));
  }, [token, tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  if (error) {
    return (
      <div className="page">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="page">
        <LoadingState label="Loading trip…" />
      </div>
    );
  }

  const feedbackLines = trip.review?.feedback?.split('\n').filter(Boolean) || [];
  const warnings = feedbackLines
    .filter((line) => line.startsWith('warning:'))
    .map((line) => line.replace(/^warning:\s*/, ''));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{trip.tripSpec?.destination || 'Your trip'}</h1>
          <p className="trip-request">&ldquo;{trip.request}&rdquo;</p>
        </div>
        <ValidationBadge score={trip.review?.score} passed={trip.budget?.withinBudget} />
      </div>

      <WarningsBanner warnings={warnings} />

      <HowThisPlanWasBuilt buildTrace={trip.buildTrace} tripSpec={trip.tripSpec} />

      <div className="disclaimer">
        ⚠️ Estimates (costs, timings, and hotel suggestions) are AI-generated and illustrative only.
        Verify prices and availability before booking.
      </div>

      <div className="trip-layout">
        <div className="trip-days">
          {trip.itinerary.days.map((day) => (
            <DayCard key={day.day} tripId={trip._id} day={day} token={token!} onUpdate={setTrip} />
          ))}
        </div>
        <div className="trip-sidebar">
          <BudgetBreakdownCard
            budget={trip.budget}
            tripBudget={trip.tripSpec?.budget}
            currency={trip.tripSpec?.currency}
          />
          <HotelList hotels={trip.itinerary.hotels} />
        </div>
      </div>
    </div>
  );
}

export default function TripPage() {
  return (
    <ProtectedRoute>
      <TripResultsContent />
    </ProtectedRoute>
  );
}
