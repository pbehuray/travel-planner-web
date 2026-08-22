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
import { TripMap } from '@/components/TripMap';

function TripResultsContent() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;
  const { token } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = async () => {
    const url = `${window.location.origin}/share/${tripId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

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
        <div className="page-header-actions no-print">
          <ValidationBadge score={trip.review?.score} passed={trip.budget?.withinBudget} />
          <button type="button" className="btn btn-share" onClick={handleCopyShareLink}>
            <svg className="btn-pdf-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M8.5 10.5l7-4M8.5 13.5l7 4M9 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM19.5 6a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM19.5 18a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {copied ? 'Link copied' : 'Share'}
          </button>
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
        {trip.tripSpec?.destination || ''} &mdash; &ldquo;{trip.request}&rdquo;
      </p>

      <div className="no-print">
        <TripMap destination={trip.tripSpec?.destination} days={trip.itinerary.days} />
        <WarningsBanner warnings={warnings} />
        <HowThisPlanWasBuilt buildTrace={trip.buildTrace} tripSpec={trip.tripSpec} />
      </div>

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
