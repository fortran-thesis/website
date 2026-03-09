import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { envOptions } from '@/configs/envOptions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!envOptions.disableAuth && !sessionCookie?.value) {

    redirect('/auth/log-in');
  }

  return <>{children}</>;
}
