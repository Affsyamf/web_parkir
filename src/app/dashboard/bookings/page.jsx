'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, DollarSign, MapPin, Car, Loader2, ServerCrash, LogOut, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BookingCard = ({ booking, onCheckout, onPrint }) => {
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
    

    // --- State & Logika Baru untuk Timer & Notifikasi ---
    const [timeLeft, setTimeLeft] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
     const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
         setIsMounted(true);
        if (booking.status !== 'active') return;

        const interval = setInterval(() => {
            const now = new Date();
            const endTime = new Date(booking.actual_exit_time);
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft('Waktu habis!');
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}j ${minutes}m ${seconds}d`);


                 // Tampilkan notifikasi jika waktu kurang dari 15 menit
                if (diff > 0 && diff < 15 * 60 * 1000 && !toast.custom) {
                    toast.custom((t) => (
                        <div
                          className={`${
                            t.visible ? 'animate-enter' : 'animate-leave'
                          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                        >
                          <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 pt-0.5">
                                <Clock className="h-10 w-10 text-orange-500"/>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  Waktu Parkir Hampir Habis!
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Sisa waktu untuk Slot {booking.spot_code} kurang dari 15 menit.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex border-l border-gray-200">
                            <button
                              onClick={() => toast.dismiss(t.id)}
                              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              Tutup
                            </button>
                          </div>
                        </div>
                      ), { id: `reminder-${booking.id}`, duration: 60000 }); // durasi notif 1 menit
                }
            }
        }, 1000);

         return () => clearInterval(interval);
    }, [booking]);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        await onCheckout(booking.id);
        setIsCheckingOut(false);
    };

    return (
        <motion.div
            id={`booking-card-${booking.id}`}
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
                            <p className="font-semibold text-gray-700 dark:text-gray-300">{isMounted ? formatDateTime(booking.entry_time) : '...'}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400"/>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Waktu Keluar</p>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">{isMounted ? formatDateTime(booking.actual_exit_time) : '...'}</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* --- Perubahan di bagian bawah kartu --- */}
            <div className={`p-3 ${currentStatus.bg} flex justify-between items-center gap-2 border-t border-gray-200 dark:border-gray-700`}>
                {booking.status === 'active' ? (
                    <>
                        <div className='text-center'>
                           <p className='text-xs font-bold text-orange-500'>Sisa Waktu</p>
                           <p className='font-mono font-bold text-orange-600 dark:text-orange-400'>{isMounted ? timeLeft : '...'}</p>
                        </div>
                        <button 
                            onClick={handleCheckout} 
                            disabled={isCheckingOut}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-green-400"
                        >
                            {isCheckingOut ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
                            {isCheckingOut ? 'Loading...' : 'Selesaikan Parkir'}
                        </button>
                    </>
                ) : (
                    <div className="flex justify-end items-center gap-2 w-full">
                          <div className="flex items-center gap-2">
                           <DollarSign size={16} className={currentStatus.text} />
                           <span className={`font-bold text-lg ${currentStatus.text}`}>
                                Rp {Number(booking.total_price).toLocaleString('id-ID')}
                           </span>
                        </div>
                         <button 
                            onClick={() => onPrint(booking.id)}
                            className="print-button bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-1 px-3 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            <Printer size={16} />
                            Cetak
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}


export default function MyBookingsPage() {
   const [activeBookings, setActiveBookings] = useState([]);
    const [pastBookings, setPastBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

        // State baru untuk pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchBookings = async (currentPage = 1) => {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
       try {
            const response = await fetch(`/api/bookings?page=${currentPage}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Gagal memuat data booking.");
            }
            const data = await response.json();
            
            if (currentPage === 1) {
                setActiveBookings(data.activeBookings || []);
                setPastBookings(data.pastBookings || []);
            } else {
                // Tambahkan data baru ke data yang sudah ada
                setPastBookings(prev => [...prev, ...(data.pastBookings || [])]);
            }

             // Cek apakah masih ada data untuk dimuat
            const totalLoaded = currentPage === 1 
                ? (data.pastBookings || []).length 
                : pastBookings.length + (data.pastBookings || []).length;

            setHasMore(totalLoaded < data.totalPastBookings);

             } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

        useEffect(() => {
        fetchBookings();
    }, []);


    // --- FUNGSI BARU UNTUK MENGHUBUNGKAN TOMBOL KE API ---
    const handleCheckout = async (bookingId) => {
       try {
            const response = await fetch(`/api/bookings/${bookingId}`, { method: 'PUT' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Gagal melakukan checkout.");
            }
            toast.success('Parkir berhasil diselesaikan!');
            await fetchBookings(1); // Muat ulang semua data dari awal
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchBookings(nextPage);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
    }

    const handlePrint = (bookingId) => {
        window.open(`/print/${bookingId}`, '_blank');
    };

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
                        activeBookings.map(booking => <BookingCard key={booking.id} booking={booking} onCheckout={handleCheckout} />)
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
                        pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} onPrint={handlePrint} />)
                      ) : (
                        <div className="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                           <ServerCrash className="mx-auto w-12 h-12 text-gray-400 mb-4"/>
                           <h3 className="text-xl font-semibold">Tidak Ada Riwayat</h3>
                           <p className="text-gray-500">Riwayat booking Anda akan muncul di sini.</p>
                        </div>
                    )}
                </div>


                {hasMore && (
                    <div className="mt-8 text-center">
                        <button 
                            onClick={handleLoadMore} 
                            disabled={loadingMore}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            {loadingMore ? (
                                <span className="flex items-center"><Loader2 className="animate-spin mr-2"/> Memuat...</span>
                            ) : (
                                'Muat Lebih Banyak'
                            )}
                        </button>
                    </div>
                )}

             </div>
        </div>
    );
}

