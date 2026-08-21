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
    <div className="hero">
      <h1>Plan smarter trips with AI</h1>
      <p>
        A multi-agent planner that researches destinations, suggests hotels, builds a
        day-by-day itinerary, estimates your budget, and validates the whole plan — from a
        single request.
      </p>
      <div className="hero-actions">
        <Link href="/register" className="btn btn-primary">
          Get started
        </Link>
        <Link href="/login" className="btn btn-secondary">
          Log in
        </Link>
      </div>
    </div>
  );
}
