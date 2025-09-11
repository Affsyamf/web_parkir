import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Layout ini berfungsi sebagai "penjaga gerbang" untuk semua halaman admin
export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Menggunakan pengecekan yang sama (case-insensitive) seperti di dashboard layout
  const isAdmin = session?.user?.role?.toLowerCase() === 'admin';

  // Jika tidak ada sesi ATAU role bukan admin, tendang keluar!
  if (!session || !isAdmin) {
    // Arahkan ke halaman dashboard utama
    redirect('/dashboard');
  }

  // Jika lolos, tampilkan halaman yang diminta
  return <>{children}</>;
}

