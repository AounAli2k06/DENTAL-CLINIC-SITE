import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSessionFromCookies } from '@/src/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default function ProtectedAdminLayout({ children }) {
  const session = getSessionFromCookies();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <Suspense fallback={null}>
      <AdminShell email={session.email}>{children}</AdminShell>
    </Suspense>
  );
}
