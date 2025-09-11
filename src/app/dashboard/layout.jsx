import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Car, Building, Plane, LogOut } from 'lucide-react';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import SignOutButton from './_components/SignOutButton';

// Komponen untuk setiap item di sidebar
function SidebarNavItem({ href, icon: Icon, children }) {
  return (
    <Link href={href}>
      <span className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150">
        <Icon className="h-5 w-5" />
        <span>{children}</span>
      </span>
    </Link>
  );
}


export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col p-4">
        <div className="flex items-center space-x-2 px-2 mb-8">
          <Car className="h-8 w-8 text-blue-400" />
          <h1 className="text-2xl font-bold">Park<span className="text-blue-400">Wise</span></h1>
        </div>

        <nav className="flex-grow space-y-2">
          <SidebarNavItem href="/dashboard" icon={LayoutDashboard}>
            Dashboard
          </SidebarNavItem>
          <SidebarNavItem href="/dashboard/mall" icon={Building}>
            Pilih Mall
          </SidebarNavItem>
          <SidebarNavItem href="/dashboard/airport" icon={Plane}>
            Pilih Bandara
          </SidebarNavItem>
        </nav>

        <div className="mt-auto">
           {/* Tombol Logout diletakkan di sini */}
           <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4">
            <div className="flex justify-end items-center">
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

