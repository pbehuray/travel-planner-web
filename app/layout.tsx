import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'AI Travel Planner',
  description: 'Multi-agent AI travel itinerary generator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="app-main">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
