'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user, token, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href={token ? '/dashboard' : '/'} className="navbar-brand">
          ✈️ Travel Planner
        </Link>
        {!loading && token && (
          <nav className="navbar-links">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/plan">New Trip</Link>
            <span className="navbar-user">{user?.email}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </nav>
        )}
        {!loading && !token && (
          <nav className="navbar-links">
            <Link href="/login">Log in</Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
