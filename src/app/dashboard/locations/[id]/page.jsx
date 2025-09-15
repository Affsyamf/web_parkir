'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car, Loader2, ArrowLeft, Building, Plane, MapPin, ArrowRight, X, Clock, DollarSign, Calendar, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Komponen LocationHeader, ParkingSlot, dan BookingModal tidak berubah dari versi sebelumnya
// Saya sertakan lagi di sini untuk kelengkapan file.
const LocationHeader = ({ location, onBack }) => {
    const TypeIcon = () => {
        if (!location?.type) return <MapPin className="w-8 h-8 text-gray-500" />;
        switch (location.type.toUpperCase()) {
            case 'MALL': return <Building className="w-8 h-8 text-purple-500" />;
            case 'BANDARA': return <Plane className="w-8 h-8 text-sky-500" />;
            case 'GEDUNG': return <Building className="w-8 h-8 text-orange-500" />;
            default: return <MapPin className="w-8 h-8 text-gray-500" />;
        }
    };
    return (
        <div className="mb-8">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 mb-4">
                <ArrowLeft size={16} />
                Kembali ke Daftar Lokasi
            </button>
            <div className="flex items-center gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"><TypeIcon /></div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{location?.name || 'Memuat...'}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{location?.address || '...'}</p>
                </div>
            </div>
        </div>
    );
};
const ParkingSlot = ({ slot, onSelect, isSelected }) => {
    const isAvailable = slot.status === 'available';
    const baseClasses = "relative aspect-[2/1] rounded-lg flex flex-col items-center justify-center font-bold text-sm border-2 transition-all duration-200";
    const statusClasses = {
        available: "bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-700 text-green-800 dark:text-green-300 cursor-pointer hover:bg-green-200 dark:hover:bg-green-800",
        booked: "bg-red-200 dark:bg-red-800/50 border-red-400 dark:border-red-700 text-red-800 dark:text-red-300 cursor-not-allowed",
    };
    const selectedClasses = isSelected ? "!bg-blue-500 !border-blue-700 !text-white ring-4 ring-blue-300" : "";
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`${baseClasses} ${statusClasses[slot.status]} ${selectedClasses}`}
            onClick={() => isAvailable && onSelect(slot)}
        >
            <Car size={20} className="mb-1" />
            {slot.spot_code}
            {slot.status === 'booked' && (<div className="absolute inset-0 bg-black/40 rounded-lg"></div>)}
        </motion.div>
    );
};
const BookingModal = ({ isOpen, onClose, slot, location, onConfirm, isBooking, entryTime, estimatedExitTime }) => {
    if (!isOpen) return null;
    
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (estimatedExitTime > entryTime) {
            const durationInMillis = new Date(estimatedExitTime) - new Date(entryTime);
            const durationInHours = Math.ceil(durationInMillis / (1000 * 60 * 60));
            setPrice(durationInHours * 10000);
        } else {
            setPrice(0);
        }
    }, [entryTime, estimatedExitTime]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Konfirmasi Booking</h3>
                                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X/></button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                    <p className="font-semibold">{location.name}</p>
                                    <p className="font-bold text-2xl text-blue-500">Slot {slot.spot_code}</p>
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                        <p>Masuk: {new Date(entryTime).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                        <p>Keluar: {new Date(estimatedExitTime).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-4 border-t dark:border-gray-700 mt-4">
                                    <span className="text-lg font-bold">Total Biaya</span>
                                    <span className="text-2xl font-bold text-green-500">Rp {price.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                            <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium rounded-md">Batal</button>
                            <button onClick={() => onConfirm({ slotId: slot.id, entryTime, estimatedExitTime })} disabled={isBooking} className="inline-flex items-center px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                                {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Konfirmasi & Bayar
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// --- Komponen Utama dengan Perubahan Logika ---
export default function LocationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [location, setLocation] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    // State baru untuk rentang waktu pencarian
    const [searchStartTime, setSearchStartTime] = useState(new Date());
    const [searchEndTime, setSearchEndTime] = useState(() => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        return now;
    });

    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    // Fetch data lokasi (hanya sekali)
    useEffect(() => {
        const fetchLocationInfo = async () => {
            if (!id) return;
            try {
                const res = await fetch(`/api/locations/${id}`);
                if (!res.ok) throw new Error('Gagal memuat detail lokasi');
                const data = await res.json();
                setLocation(data.location);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLocationInfo();
    }, [id]);

    // Fungsi baru untuk fetch ketersediaan slot
    const fetchAvailability = async () => {
        if (!id || !searchStartTime || !searchEndTime) return;
        setLoadingSlots(true);
        setSelectedSlot(null); // Reset pilihan saat mencari jadwal baru
        try {
            const response = await fetch(`/api/locations/${id}/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startTime: searchStartTime, endTime: searchEndTime })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Gagal memeriksa ketersediaan');
            }
            const data = await response.json();
            setSlots(data.slots);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleConfirmBooking = async (bookingData) => {
        setIsBooking(true);
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal melakukan booking');
            }
            toast.success('Booking berhasil! Anda akan diarahkan...');
            setIsBookingModalOpen(false);
            setSelectedSlot(null);
            setTimeout(() => router.push('/dashboard/bookings'), 2000);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsBooking(false);
        }
    };
    
    if (loading) { return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>; }
    
    return (
        <div className="max-w-7xl mx-auto">
            <LocationHeader location={location} onBack={() => router.push('/dashboard/locations')} />
            
            {/* --- Form Pencarian Jadwal --- */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold mb-4">1. Pilih Jadwal Parkir</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waktu Masuk</label>
                        <DatePicker selected={searchStartTime} onChange={(date) => setSearchStartTime(date)} showTimeSelect dateFormat="Pp" minDate={new Date()} className="w-full pl-3 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waktu Keluar</label>
                        <DatePicker selected={searchEndTime} onChange={(date) => setSearchEndTime(date)} showTimeSelect dateFormat="Pp" minDate={searchStartTime} className="w-full pl-3 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <button onClick={fetchAvailability} disabled={loadingSlots} className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                        {loadingSlots ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
                        Cek Ketersediaan
                    </button>
                </div>
            </div>

            {/* --- Denah Slot Parkir --- */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">2. Pilih Slot Parkir</h2>
                {loadingSlots ? (
                    <div className="flex justify-center items-center py-10"><Loader2 className="w-8 h-8 animate-spin"/></div>
                ) : slots.length > 0 ? (
                     <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                        {slots.map(slot => (
                            <ParkingSlot key={slot.id} slot={slot} onSelect={setSelectedSlot} isSelected={selectedSlot?.id === slot.id} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-10">Silakan pilih jadwal untuk melihat slot yang tersedia.</p>
                )}
            </div>

            <AnimatePresence>
                {selectedSlot && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl">
                        <div className="bg-white dark:bg-gray-800 m-4 p-4 rounded-lg shadow-2xl border dark:border-gray-700 flex justify-between items-center">
                            <p className="text-2xl font-bold">Slot Terpilih: {selectedSlot.spot_code}</p>
                            <button onClick={() => setIsBookingModalOpen(true)} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                Lanjut <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} slot={selectedSlot} location={location} onConfirm={handleConfirmBooking} isBooking={isBooking} entryTime={searchStartTime} estimatedExitTime={searchEndTime} />
        </div>
    );
}

