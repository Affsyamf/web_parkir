"use client";

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Home, ParkingCircle, User, Shield, Search, Eye, BarChart3, X,
    Download
} from 'lucide-react';
import SignOutButton from '@/app/dashboard/_components/SignOutButton';

const ActiveLink = ({ href, icon: Icon, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${
            isActive 
            ? 'bg-gray-700 text-white' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}>
            <Icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{children}</span>
        </Link>
    );
};

const SidebarContent = () => {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role?.toLowerCase() === 'admin';

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="h-16 flex items-center justify-center border-b border-gray-700">
                <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
                    <ParkingCircle className="text-blue-500" />
                    <span>Parkirin</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
                <ActiveLink href="/dashboard" icon={Home}>Dashboard</ActiveLink>
                <ActiveLink href="/dashboard/locations" icon={Search}>Cari Lokasi</ActiveLink>
                <ActiveLink href="/dashboard/bookings" icon={ParkingCircle}>My Bookings</ActiveLink>
                <ActiveLink href="/dashboard/profile" icon={User}>Profile</ActiveLink>

                {isAdmin && (
                    <div className="pt-4 mt-4 border-t border-gray-700">
                        <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</h3>
                        <ActiveLink href="/dashboard/admin" icon={Shield}>Kelola Lokasi</ActiveLink>
                        <ActiveLink href="/dashboard/admin/monitoring" icon={Eye}>Monitoring</ActiveLink>
                        <ActiveLink href="/dashboard/admin/analytics" icon={BarChart3}>Analytics</ActiveLink>
                        <ActiveLink href="/dashboard/admin/report" icon={Download}>Report</ActiveLink>
                    </div>
                )}
            </nav>
            <div className="px-4 py-6 mt-auto border-t border-gray-700">
                <SignOutButton />
            </div>
        </div>
    );
};


export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setSidebarOpen]);

    return (
        <>
            {/* --- SIDEBAR MOBILE (Overlay) --- */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-black/60 md:hidden"
                        />
                        <motion.aside
                            ref={sidebarRef}
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-64 z-40 md:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
            
            {/* --- SIDEBAR DESKTOP (Statis) --- */}
            <aside className="hidden md:flex md:flex-shrink-0 w-64 h-screen overflow-hidden border-r border-gray-800">
                <SidebarContent />
            </aside>
        </>
    );
}

