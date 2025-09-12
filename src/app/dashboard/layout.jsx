import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, ParkingCircle, User, Shield, Search } from 'lucide-react';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import SignOutButton from './_components/SignOutButton';
import { Toaster } from 'react-hot-toast';

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.user?.role?.toLowerCase() === 'admin';

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
            <ParkingCircle className="text-blue-500" />
            <span>Parkirin</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Home className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </Link>
           <Link href="/dashboard/locations" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Search className="w-5 h-5 mr-3" />
            <span>Cari Lokasi</span>
          </Link>
          <Link href="/dashboard/bookings" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ParkingCircle className="w-5 h-5 mr-3" />
            <span>My Bookings</span>
          </Link>
          <Link href="/dashboard/profile" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <User className="w-5 h-5 mr-3" />
            <span>Profile</span>
          </Link>
          {isAdmin && (
            <Link href="/dashboard/admin" className="flex items-center px-4 py-2 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-gray-700 transition-colors font-semibold">
              <Shield className="w-5 h-5 mr-3" />
              <span>Admin Panel</span>
            </Link>
          )}
          {isAdmin && (
            <Link href="/dashboard/admin/monitoring" className="flex items-center px-4 py-2 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-gray-700 transition-colors font-semibold">
              <Shield className="w-5 h-5 mr-3" />
              <span>Monitoring</span>
            </Link>
          )}
        </nav>
        <div className="px-4 py-6 border-t dark:border-gray-700">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-end px-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-sm text-gray-800 dark:text-white">{session.user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{session.user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8">
          <Toaster 
            position="top-right"
            toastOptions={{
              className: '',
              style: {
                border: '1px solid #713200',
                padding: '16px',
                color: '#713200',
              },
            }}
          />
          {children}
        </main>
      </div>
    </div>
  );
}

