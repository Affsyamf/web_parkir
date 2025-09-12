'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, User, Car, Loader2, ServerCrash, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const MonitoringCard = ({ booking }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const endTime = new Date(booking.estimated_exit_time);
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft('Waktu habis!');
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [booking.estimated_exit_time]);

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString('id-ID', { timeStyle: 'short' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-orange-500"
        >
            <div className="flex justify-between items-center">
                <p className="font-bold text-lg">{booking.location_name}</p>
                <p className="font-bold text-2xl text-orange-500">{booking.spot_code}</p>
            </div>
            <div className="mt-4 pt-4 border-t dark:border-gray-700 text-sm space-y-2">
                <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400"/>
                    <span className="font-semibold">{booking.user_name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400"/>
                    <span>Masuk: {formatDateTime(booking.entry_time)}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400"/>
                    <span>Keluar: {formatDateTime(booking.estimated_exit_time)}</span>
                </div>
            </div>
            <div className="mt-4 text-center bg-orange-100 dark:bg-orange-900/50 p-2 rounded-md">
                <p className="text-xs font-bold text-orange-500">Sisa Waktu</p>
                <p className="font-mono text-xl font-bold text-orange-600 dark:text-orange-400">{timeLeft}</p>
            </div>
        </motion.div>
    );
};

export default function MonitoringPage() {
    const [activeBookings, setActiveBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMonitoringData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/monitoring');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Gagal memuat data monitoring.");
                }
                const data = await response.json();
                setActiveBookings(data.activeBookings || []);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMonitoringData();
        
        // Auto-refresh data setiap 30 detik
        const interval = setInterval(fetchMonitoringData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Monitoring Parkir Aktif</h1>
                <p className="text-gray-500 dark:text-gray-400">Menampilkan semua slot yang sedang terisi di semua lokasi secara real-time.</p>
            </div>
            {activeBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeBookings.map(booking => (
                        <MonitoringCard key={booking.id} booking={booking} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                   <Eye className="mx-auto w-16 h-16 text-gray-400 mb-4"/>
                   <h3 className="text-2xl font-semibold">Tidak Ada Parkir Aktif</h3>
                   <p className="text-gray-500 mt-2">Semua slot parkir saat ini tersedia.</p>
                </div>
            )}
        </div>
    );
}
