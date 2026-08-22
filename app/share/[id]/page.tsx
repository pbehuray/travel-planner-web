'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api, ApiError, type SharedTrip } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { BudgetBreakdownCard } from '@/components/BudgetBreakdownCard';
import { HotelList } from '@/components/HotelList';
import { ReadOnlyDayCard } from '@/components/ReadOnlyDayCard';
import { TripMap } from '@/components/TripMap';

export default function SharedTripPage() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTrip = useCallback(() => {
    if (!tripId) return;
    api
      .getSharedTrip(tripId)
      .then(setTrip)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load trip'));
  }, [tripId]);

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
        <LoadingState label="Loading shared trip…" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{trip.tripSpec?.destination || 'Shared trip'}</h1>
          <p className="trip-request">
            {trip.tripSpec?.duration ? `${trip.tripSpec.duration}-day trip` : 'Trip itinerary'}
          </p>
        </div>
        <div className="page-header-actions no-print">
          <span className="badge badge-shared">🔒 Read-only shared view</span>
          <button type="button" className="btn btn-primary btn-pdf" onClick={() => window.print()}>
            <svg className="btn-pdf-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 17v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      <p className="print-title">
        {trip.tripSpec?.duration ? `${trip.tripSpec.duration}-day trip to ` : 'Trip to '}
        {trip.tripSpec?.destination || ''}
      </p>

      <div className="no-print">
        <TripMap destination={trip.tripSpec?.destination} days={trip.itinerary.days} />
      </div>

      <div className="disclaimer">
        ⚠️ Estimates (costs, timings, and hotel suggestions) are AI-generated and illustrative only.
        Verify prices and availability before booking.
      </div>

      <div className="trip-layout">
        <div className="trip-days">
          {trip.itinerary.days.map((day) => (
            <ReadOnlyDayCard key={day.day} day={day} />
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
