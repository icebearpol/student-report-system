'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/alerts', label: 'Broadcast & Alerts' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTicketDetail = pathname.startsWith('/tickets/');

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-campus-primary text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-tight">Campus Report</h1>
          <p className="text-xs text-white/60 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-white/15 font-semibold'
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {!isTicketDetail && (
          <header className="bg-white border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-campus-primary">
              Operations Center
            </h2>
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
