'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && token) {
      router.replace('/dashboard');
    }
  }, [loading, token, router]);

  if (loading || token) return null;

  return (
    <div className="home-hero">
      <div className="home-hero-content">
        <h1>Plan smarter trips with AI</h1>
        <p className="subtitle">
          A multi-agent planner that researches destinations, suggests hotels, builds a
          day-by-day itinerary, estimates your budget, and validates the whole plan — from a
          single request.
        </p>
        <div className="home-hero-actions">
          <Link href="/register" className="btn btn-primary">
            Get started
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Log in
          </Link>
        </div>
      </div>

      <div className="home-hero-features">
        <div className="feature-card">
          <div className="feature-icon" aria-hidden="true">🧠</div>
          <h3>Multi-Agent AI</h3>
          <p>Specialized agents research, budget, and plan your trip</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon" aria-hidden="true">✅</div>
          <h3>Independently Validated</h3>
          <p>A second AI model checks every plan</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon" aria-hidden="true">✏️</div>
          <h3>Fully Editable</h3>
          <p>Regenerate any day, add or remove activities</p>
        </div>
      </div>
    </div>
  );
}
