'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, ParkingCircle } from 'lucide-react';

// Wrapper untuk menggunakan useSearchParams di Client Component
function PrintReportContent() {
    const searchParams = useSearchParams();
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const type = searchParams.get('type') || 'ALL';
        const search = searchParams.get('search') || '';

        const fetchAllData = async () => {
            try {
                // Panggil API dengan parameter forPrint=true untuk mengambil semua data
                const response = await fetch(`/api/report?type=${type}&search=${search}&forPrint=true`);
                if (!response.ok) throw new Error('Gagal memuat data laporan');
                const data = await response.json();
                setReportData(data.reportData || []);
            } catch (error) {
                console.error(error);
                alert('Gagal memuat data untuk dicetak.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [searchParams]);

    useEffect(() => {
        if (!loading && reportData.length >= 0) {
            // Memicu dialog cetak setelah data selesai dimuat
            const timer = setTimeout(() => window.print(), 1000);
            return () => clearTimeout(timer);
        }
    }, [loading, reportData]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <p className="mt-4 text-lg">Mempersiapkan laporan...</p>
            </div>
        );
    }

    return (
        <div className="p-8 font-sans">
            <header className="text-center mb-6 pb-4 border-b">
                <ParkingCircle className="mx-auto w-10 h-10 text-blue-600 mb-2" />
                <h1 className="text-2xl font-bold">Laporan Booking Lengkap</h1>
                <p className="text-sm text-gray-500">Filter: {searchParams.get('type') || 'Semua'}</p>
                <p className="text-sm text-gray-500">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </header>
            <table className="w-full text-sm text-left table-auto">
                <thead className="text-xs text-white uppercase bg-gray-800">
                    <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Pengguna</th>
                        <th className="px-4 py-3">Lokasi</th>
                        <th className="px-4 py-3">Slot</th>
                        <th className="px-4 py-3">Masuk</th>
                        <th className="px-4 py-3">Keluar</th>
                        <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-gray-200 hover:text-slate-900">
                            <td className="px-4 py-2 font-semibold">#{booking.id}</td>
                            <td className="px-4 py-2">{booking.user_name}</td>
                            <td className="px-4 py-2">{booking.location_name}</td>
                            <td className="px-4 py-2">{booking.spot_code}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{new Date(booking.entry_time).toLocaleString('id-ID')}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{new Date(booking.actual_exit_time).toLocaleString('id-ID')}</td>
                            <td className="px-4 py-2 text-right font-semibold">
                                Rp {Number(booking.total_price).toLocaleString('id-ID')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


export default function PrintReportPage() {
    // Suspense diperlukan karena useSearchParams hanya bisa digunakan di Client Component
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin" /></div>}>
            <PrintReportContent />
        </Suspense>
    );
}

