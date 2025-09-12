'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car, Loader2, ArrowLeft, Building, Plane, MapPin, ArrowRight, X, Clock, DollarSign, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Komponen LocationHeader dan ParkingSlot tetap sama...
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
        maintenance: "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 cursor-not-allowed",
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
// --- Komponen Modal Baru untuk Booking ---
const BookingModal = ({ isOpen, onClose, slot, location, onConfirm, isBooking }) => {
    if (!isOpen) return null;

    const [estimatedExitTime, setEstimatedExitTime] = useState(() => {
        const now = new Date();
        now.setHours(now.getHours() + 1); // Default 1 jam dari sekarang
        return now;
    });
    
    const [price, setPrice] = useState(10000);

    useEffect(() => {
        const now = new Date();
        if (estimatedExitTime > now) {
            const durationInMillis = estimatedExitTime - now;
            const durationInHours = Math.ceil(durationInMillis / (1000 * 60 * 60));
            setPrice(durationInHours * 10000);
        } else {
            setPrice(0);
        }
    }, [estimatedExitTime]);

    const handleConfirm = () => {
        if (estimatedExitTime <= new Date()) {
            toast.error("Waktu keluar harus di masa depan!");
            return;
        }
        onConfirm({ slotId: slot.id, estimatedExitTime });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Konfirmasi Booking</h3>
                                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X/></button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-500">Lokasi</p>
                                    <p className="font-semibold">{location.name}</p>
                                    <p className="text-sm text-gray-500 mt-2">Slot Parkir</p>
                                    <p className="font-bold text-2xl text-blue-500">{slot.spot_code}</p>
                                </div>
                                <div className="relative">
                                    <label htmlFor="exitTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Perkiraan Waktu Keluar</label>
                                    <Calendar className="absolute left-3 top-10 z-10 w-5 h-5 text-gray-400"/>
                                    <DatePicker
                                        selected={estimatedExitTime}
                                        onChange={(date) => setEstimatedExitTime(date)}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        minDate={new Date()}
                                        className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                                    />
                                </div>
                                <div className="flex justify-between items-center p-4 border-t dark:border-gray-700 mt-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-6 h-6 text-green-500"/>
                                        <span className="text-lg font-bold">Total Biaya</span>
                                    </div>
                                    <span className="text-2xl font-bold text-green-500">Rp {price.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                            <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium rounded-md">Batal</button>
                            <button onClick={handleConfirm} disabled={isBooking} className="inline-flex items-center px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                                {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Konfirmasi Booking
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function LocationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [location, setLocation] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [locationRes, slotsRes] = await Promise.all([
                fetch(`/api/locations/${id}`),
                fetch(`/api/locations/${id}/slots`)
            ]);
            if (!locationRes.ok) throw new Error('Gagal memuat detail lokasi');
            if (!slotsRes.ok) throw new Error('Gagal memuat slot parkir');
            const locationData = await locationRes.json();
            const slotsData = await slotsRes.json();
            setLocation(locationData.location);
            setSlots(slotsData.slots);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) { fetchData(); } }, [id]);

    const handleSelectSlot = (slot) => {
        setSelectedSlot(prev => (prev?.id === slot.id ? null : slot));
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
            toast.success('Booking berhasil! Anda akan diarahkan ke halaman booking.');
            setIsBookingModalOpen(false);
            setSelectedSlot(null);
            
            // Refresh data slot & redirect setelah beberapa saat
            await fetchData();
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
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
                    <h2 className="text-xl font-bold">Pilih Slot Parkir</h2>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-200 border border-green-400"></div> Tersedia</span>
                        <span className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-200 border border-red-400"></div> Terisi</span>
                    </div>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                    {slots.map(slot => (
                        <ParkingSlot key={slot.id} slot={slot} onSelect={handleSelectSlot} isSelected={selectedSlot?.id === slot.id} />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedSlot && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl"
                    >
                        <div className="bg-white dark:bg-gray-800 m-4 p-4 rounded-lg shadow-2xl border dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Slot Terpilih:</p>
                                <p className="text-2xl font-bold">{selectedSlot.spot_code}</p>
                            </div>
                            <button onClick={() => setIsBookingModalOpen(true)} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                Lanjut ke Booking <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                slot={selectedSlot}
                location={location}
                onConfirm={handleConfirmBooking}
                isBooking={isBooking}
            />
        </div>
    );
}

