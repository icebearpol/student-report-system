import { Suspense } from 'react';
import { CampusProvider } from '@campus/mock-data';
import { AdminShell } from '@/components/AdminShell';
import './globals.css';

export const metadata = {
  title: 'Campus Report — Admin Dashboard',
  description: 'Campus issue reporting operations center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CampusProvider>
          <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}>
            <AdminShell>{children}</AdminShell>
          </Suspense>
        </CampusProvider>
      </body>
    </html>
  );
}
