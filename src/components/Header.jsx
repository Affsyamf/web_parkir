"use client";

import { useSession } from 'next-auth/react';
import { Menu, User } from 'lucide-react';

export default function Header({ setSidebarOpen }) {
    const { data: session } = useSession();

    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between md:justify-end px-6">
            {/* Tombol Hamburger untuk Mobile */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-500 dark:text-gray-400"
                aria-label="Buka sidebar"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Info Pengguna */}
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                </div>
            </div>
        </header>
    );
}

