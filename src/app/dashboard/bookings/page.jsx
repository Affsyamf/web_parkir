'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, DollarSign, MapPin, Car, Loader2, ServerCrash } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BookingCard = ({ booking }) => {
    const statusStyles = {
        active: {
            bg: 'bg-blue-100 dark:bg-blue-900/50',
            text: 'text-blue-800 dark:text-blue-300',
            border: 'border-blue-500',
            label: 'Aktif'
        },
        completed: {
            bg: 'bg-green-100 dark:bg-green-900/50',
            text: 'text-green-800 dark:text-green-300',
            border: 'border-green-500',
            label: 'Selesai'
        },
        cancelled: {
            bg: 'bg-gray-100 dark:bg-gray-700',
            text: 'text-gray-600 dark:text-gray-400',
            border: 'border-gray-500',
            label: 'Dibatalkan'
        }
    };

    const currentStatus = statusStyles[booking.status] || statusStyles.cancelled;

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg shadow-md overflow-hidden border-l-4 ${currentStatus.border} ${currentStatus.bg}`}
        >
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                           <MapPin size={14} /> 
                           <span>{booking.location_name || 'Lokasi tidak diketahui'}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                            Slot {booking.spot_code || 'N/A'}
                        </p>
                    </div>
                    <div className={`px-3 py-1 text-xs font-bold rounded-full ${currentStatus.bg} ${currentStatus.text}`}>
                        {currentStatus.label}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400"/>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Waktu Masuk</p>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">{formatDateTime(booking.entry_time)}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400"/>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Perkiraan Keluar</p>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">{formatDateTime(booking.estimated_exit_time)}</p>
                        </div>
                    </div>
                </div>
            </div>
            {booking.total_price && (
                <div className={`p-3 ${currentStatus.bg} flex justify-end items-center gap-2 border-t border-gray-200 dark:border-gray-700`}>
                     <DollarSign size={16} className={currentStatus.text} />
                     <span className={`font-bold text-lg ${currentStatus.text}`}>
                        Rp {Number(booking.total_price).toLocaleString('id-ID')}
                     </span>
                </div>
            )}
        </motion.div>
    )
}

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/bookings');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Gagal memuat riwayat booking.");
                }
                const data = await response.json();
                setBookings(data.bookings || []);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const activeBookings = bookings.filter(b => b.status === 'active');
    const pastBookings = bookings.filter(b => b.status !== 'active');

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12">
             <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Booking Aktif</h1>
                <p className="text-gray-500 dark:text-gray-400">Parkir yang sedang berjalan saat ini.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeBookings.length > 0 ? (
                        activeBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                    ) : (
                        <div className="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                           <Car className="mx-auto w-12 h-12 text-gray-400 mb-4"/>
                           <h3 className="text-xl font-semibold">Tidak Ada Booking Aktif</h3>
                           <p className="text-gray-500">Anda belum memiliki parkir yang sedang aktif.</p>
                        </div>
                    )}
                </div>
             </div>
             <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Riwayat Booking</h1>
                <p className="text-gray-500 dark:text-gray-400">Semua parkir Anda yang telah selesai.</p>
                <div className="mt-6 space-y-6">
                    {pastBookings.length > 0 ? (
                        pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                    ) : (
                        <div className="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                           <ServerCrash className="mx-auto w-12 h-12 text-gray-400 mb-4"/>
                           <h3 className="text-xl font-semibold">Tidak Ada Riwayat</h3>
                           <p className="text-gray-500">Riwayat booking Anda akan muncul di sini.</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
}

