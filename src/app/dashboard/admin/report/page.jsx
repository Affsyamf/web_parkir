"use client";

import { useState, useEffect } from "react";
import { Loader2, ServerCrash, Printer } from "lucide-react";
import toast from "react-hot-toast";

// PERBAIKAN: Nama komponen menggunakan PascalCase (ReportPage)
export default function ReportPage() {
    // PERBAIKAN: Menggunakan konvensi penamaan camelCase untuk semua state
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('ALL');

    const fetchReport = async (filter) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/report?type=${filter}`);
            if (!response.ok) {
                throw new Error('Gagal memuat data laporan');
            }
            const data = await response.json();
            // PERBAIKAN: Menggunakan setter state yang benar
            setReportData(data.reportData || []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            // PERBAIKAN: Menggunakan setter state yang benar
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(typeFilter);
    }, [typeFilter]);

    const handlePrint = () => {
        window.print();
    };

    const filterOptions = ['ALL', 'MALL', 'BANDARA', 'GEDUNG'];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Laporan Booking</h1>
                    <p className="text-gray-500 dark:text-gray-400">Lihat dan cetak riwayat semua booking yang telah selesai.</p>
                </div>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                    <Printer size={18} />
                    Cetak Laporan
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    {filterOptions.map(option => (
                        <button
                            key={option}
                            onClick={() => setTypeFilter(option)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                // PERBAIKAN: Nama variabel sekarang cocok (typeFilter)
                                typeFilter === option
                                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {option === 'ALL' ? 'Semua' : option}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                    Menampilkan {reportData.length} hasil
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-24"> <Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
                ) : reportData.length === 0 ? (
                    <div className="text-center py-24 text-gray-500">
                        <ServerCrash className="w-12 h-12 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold">Tidak Ada Data</h4>
                        <p>Tidak ada data laporan yang cocok dengan filter yang dipilih.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Nama Pengguna</th>
                                    <th className="px-6 py-3">Lokasi</th>
                                    <th className="px-6 py-3">Slot</th>
                                    <th className="px-6 py-3">Waktu Masuk</th>
                                    <th className="px-6 py-3">Waktu Keluar</th>
                                    <th className="px-6 py-3 text-right">Total Bayar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* PERBAIKAN: Menggunakan state yang benar (reportData) */}
                                {reportData.map((booking) => (
                                    <tr key={booking.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-semibold">#{booking.id}</td>
                                        <td className="px-6 py-4">{booking.user_name}</td>
                                        <td className="px-6 py-4">{booking.location_name}</td>
                                        <td className="px-6 py-4">{booking.spot_code}</td>
                                        <td className="px-6 py-4">{new Date(booking.entry_time).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4">{new Date(booking.actual_exit_time).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 text-right font-semibold">
                                            Rp {Number(booking.total_price).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

