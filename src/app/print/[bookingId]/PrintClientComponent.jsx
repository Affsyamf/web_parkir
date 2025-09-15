'use client';

import { useEffect } from 'react';
import { ParkingCircle, Calendar, Clock, MapPin } from 'lucide-react';

export default function PrintClientComponent({ booking }) {

    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    };

    return (
        <>
            <style jsx global>{`
                @media print {
                    html, body {
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background-color: white;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        display: flex;
                        align-items: flex-start;
                        justify-content: center;
                        min-height: 98vh;
                        
                        /* --- ATUR JARAK DARI ATAS DI SINI --- */
                        /* Coba ganti nilai '5rem' ini ke angka yang lebih besar (misal: 8rem) atau kecil (misal: 3rem) */
                        padding-top: 5rem !important; 
                    }
                    .printable-receipt {
                        transform: scale(1.3);
                        transform-origin: top center;
                    }
                }
            `}</style>
            
            <div className={`
                printable-receipt 
                bg-white font-sans p-8 max-w-md mx-auto my-8 border border-gray-300 rounded-lg
                print:max-w-xl print:shadow-none print:border-2 print:my-0 print:mx-0
            `}>
                <header className="text-center mb-6 pb-6 border-b-2 border-dashed border-gray-300">
                    <ParkingCircle className="mx-auto w-12 h-12 text-blue-600 mb-2" />
                    <h1 className="text-2xl font-bold text-gray-800 print:text-black">Parkirin</h1>
                    <p className="text-sm text-gray-500 print:text-black">Bukti Pembayaran Parkir</p>
                </header>

                <section className="space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 print:text-black">ID Booking:</span>
                        <span className="font-mono font-semibold print:text-black text-slate-900">#{booking.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 print:text-black">Status:</span>
                        <span className="font-semibold px-2 py-0.5 bg-green-100 text-green-800 rounded print:bg-green-100 print:text-green-800">
                            {booking.status === 'completed' ? 'SELESAI' : booking.status.toUpperCase()}
                        </span>
                    </div>
                </section>

                <section className="my-6 py-6 border-y-2 border-dashed border-gray-300 space-y-4 text-sm">
                    <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-3 mt-1 text-gray-400 print:text-black" />
                        <div className="print:text-black">
                            <p className="font-bold text-slate-900">{booking.location_name}</p>
                            <p className="text-gray-500 print:text-black">{booking.location_address}</p>
                            <p className="text-gray-500 print:text-black">Slot: <span className="font-semibold">{booking.spot_code}</span></p>
                        </div>
                    </div>
                     <div className="flex items-start">
                        <Calendar className="w-4 h-4 mr-3 mt-1 text-gray-400 print:text-black" />
                        <div className="print:text-black">
                            <p className="text-gray-500 print:text-black">Waktu Masuk</p>
                            <p className="font-semibold text-slate-900">{formatDateTime(booking.entry_time)}</p>
                        </div>
                    </div>
                     <div className="flex items-start">
                        <Clock className="w-4 h-4 mr-3 mt-1 text-gray-400 print:text-black" />
                        <div className="print:text-black">
                            <p className="text-slate-500 print:text-black">Waktu Keluar</p>
                            <p className="font-semibold text-slate-900">{formatDateTime(booking.actual_exit_time)}</p>
                        </div>
                    </div>
                </section>

                <footer className="space-y-4">
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600 font-semibold print:text-black">Total Bayar:</span>
                        <span className="font-bold text-blue-600 print:text-blue-600">
                            Rp {Number(booking.total_price).toLocaleString('id-ID')}
                        </span>
                    </div>
                     <p className="text-center text-xs text-gray-500 pt-4 print:text-black">
                        Terima kasih telah menggunakan layanan kami.
                    </p>
                </footer>
            </div>
        </>
    );
}

