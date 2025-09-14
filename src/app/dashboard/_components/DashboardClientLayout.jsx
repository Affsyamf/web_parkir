'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, ParkingCircle, User, Shield, Search, Eye, BarChart3, Menu } from 'lucide-react';
import SignOutButton from './SignOutButton';
import { Toaster } from 'react-hot-toast';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';

// KOMENTAR: Komponen ini menangani semua logika interaktif (state) untuk layout dashboard.
export default function DashboardClientLayout({ session, children }) {
  // State untuk mengontrol apakah sidebar terbuka atau tertutup di layar mobile.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAdmin = session.user?.role?.toLowerCase() === 'admin';

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* KOMENTAR: Overlay gelap yang muncul di belakang sidebar saat terbuka di mobile. */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* KOMENTAR: Sidebar sekarang memiliki kelas untuk transisi dan posisi. */}
      {/* 'md:relative' membuatnya statis di desktop, 'fixed' di mobile. */}
      {/* 'translate-x' digunakan untuk animasi slide-in/slide-out. */}
      <aside className={`fixed top-0 left-0 h-full w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
            <ParkingCircle className="text-blue-500" />
            <span>Parkirin</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"> <Home className="w-5 h-5 mr-3" /> <span>Dashboard</span> </Link> 
          <Link href="/dashboard/locations" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"> <Search className="w-5 h-5 mr-3" /> <span>Cari Lokasi</span> </Link> 
          <Link href="/dashboard/bookings" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"> <ParkingCircle className="w-5 h-5 mr-3" /> <span>My Bookings</span> </Link> 
          <Link href="/dashboard/profile" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"> <User className="w-5 h-5 mr-3" /> <span>Profile</span> </Link> 
          {isAdmin && ( 
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700"> 
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</h3> 
              <Link href="/dashboard/admin" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"> <Shield className="w-5 h-5 mr-3" /> <span>Kelola Lokasi</span> </Link> 
              <Link href="/dashboard/admin/monitoring" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"> <Eye className="w-5 h-5 mr-3" /> <span>Monitoring</span> </Link> 
              <Link href="/dashboard/admin/analytics" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"> <BarChart3 className="w-5 h-5 mr-3" /> <span>Analytics</span> </Link> 
            </div> 
          )}
        </nav>
        <div className="px-4 py-6 border-t dark:border-gray-700">
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col w-full">
        <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
          {/* KOMENTAR: Tombol Hamburger ini hanya muncul di layar kecil (md:hidden) */}
          <button 
            className="md:hidden text-gray-500 dark:text-gray-400"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <Menu size={24} />
          </button>
          
          {/* Elemen di kanan header, ml-auto membuatnya tetap di kanan */}
          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggleButton />
            <div className="text-right">
              <p className="font-semibold text-sm text-gray-800 dark:text-white">{session.user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{session.user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Toaster 
            position="top-right"
            toastOptions={{
                success: { style: { background: '#dcfce7', color: '#166534', border: '1px solid #4ade80' } },
                error: { style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' } },
            }}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
