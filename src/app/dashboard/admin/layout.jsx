import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  const isAdmin = session?.user?.role?.toLowerCase() === 'admin';


  if (!session || !isAdmin) {
    redirect('/dashboard');
  }

  // Jika lolos, tampilkan halaman yang diminta
  return <>{children}</>;
}

