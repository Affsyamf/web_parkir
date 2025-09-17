"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ServerCrash, Printer, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";


const DebouncedSearchInput = ({ value, onChange, delay = 500 }) => {
    const [inputValue, setInputValue] = useState(value);

      useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (inputValue !== value) {
                onChange(inputValue);
            }
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, delay, onChange]);
    return (
        <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Cari nama pengguna/lokasi..."
                className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
        </div>
    );
};


// PERBAIKAN: Nama komponen menggunakan PascalCase (ReportPage)
export default function ReportPage() {
    // PERBAIKAN: Menggunakan konvensi penamaan camelCase untuk semua state
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchReport = useCallback( async (filter, search, page) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/report?type=${filter}&search=${search}&page=${page}`);
            if (!response.ok) {
                throw new Error('Gagal memuat data laporan');
            }
            const data = await response.json();
            setReportData(data.reportData || []);
            setTotalCount(data.totalCount || 0);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport(typeFilter, searchTerm, currentPage);
    }, [typeFilter, searchTerm, currentPage, fetchReport]);

    const handlePrint = () => {window.print(); };
    const filterOptions = ['ALL', 'MALL', 'BANDARA', 'GEDUNG'];

    const handleSearchChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
        setCurrentPage(1); // Reset ke halaman 1 saat ada pencarian baru
    };

     const handleFilterChange = (option) => {
        setTypeFilter(option);
        setSearchTerm('')
        setCurrentPage(1); // Reset ke halaman 1 saat filter diubah
    };

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

           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg w-full sm:w-auto">
                    {filterOptions.map(option => (
                        <button
                            key={option}
                            onClick={() => 
                                handleFilterChange(option)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors w-full ${
                                typeFilter === option
                                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {option === 'ALL' ? 'Semua' : option}
                        </button>
                    ))}
                </div>
                <DebouncedSearchInput value={searchTerm} onChange={setSearchTerm} />
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

                {totalPages > 1 && (
                    <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Halaman {currentPage} dari {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage === 1 || loading}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage === totalPages || loading}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            >
                                Berikutnya
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

