"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Loader2, ServerCrash, Printer, Search, ChevronLeft, ChevronRight, FileText, Download, Calendar, MapPin, User, Clock } from "lucide-react";
import toast from "react-hot-toast";

const DebouncedSearchInput = ({ value, onChange, delay = 500 }) => {
    const [inputValue, setInputValue] = useState(value);
    useEffect(() => { setInputValue(value); }, [value]);
    useEffect(() => {
        const handler = setTimeout(() => {
            if (inputValue !== value) {
                onChange(inputValue);
            }
        }, delay);
        return () => { clearTimeout(handler); };
    }, [inputValue, delay, onChange, value]);
    return (
        <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Cari nama, lokasi, atau ID..."
                className="pl-12 pr-4 py-3 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color = "indigo" }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-4">
            <div className={`bg-${color}-100 dark:bg-${color}-900/30 p-3 rounded-xl`}>
                <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);

export default function ReportPage() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // --- PERBAIKAN 1: Membuat state untuk setiap data statistik ---
    const [totalCount, setTotalCount] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [uniqueUsers, setUniqueUsers] = useState(0);
    const [uniqueLocations, setUniqueLocations] = useState(0);
    
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState(new Date());
    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchReport = useCallback(async (filter, search, page, start, end) => {
        setLoading(true);
        try {
            const startDateISO = start.toISOString();
            const endDateISO = end.toISOString();
            const response = await fetch(`/api/report?type=${filter}&search=${search}&page=${page}&startDate=${startDateISO}&endDate=${endDateISO}`);
            if (!response.ok) throw new Error('Gagal memuat data laporan');
            const data = await response.json();
            setReportData(data.reportData || []);
            
            // --- PERBAIKAN 2: Mengisi state statistik dari data API ---
            setTotalCount(data.totalCount || 0);
            setTotalRevenue(data.totalRevenue || 0);
            setUniqueUsers(data.uniqueUsers || 0);
            setUniqueLocations(data.uniqueLocations || 0);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport(typeFilter, searchTerm, currentPage, startDate, endDate);
    }, [typeFilter, searchTerm, currentPage, startDate, endDate, fetchReport]);

    const filterOptions = [
        { value: 'ALL', label: 'Semua Lokasi', icon: FileText },
        { value: 'MALL', label: 'Mall', icon: MapPin },
        { value: 'BANDARA', label: 'Bandara', icon: MapPin },
        { value: 'GEDUNG', label: 'Gedung', icon: MapPin }
    ];
    const handleSearchChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
        setCurrentPage(1);
    };
    const handleFilterChange = (option) => {
        setTypeFilter(option);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Laporan Booking</h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Kelola dan analisis riwayat booking yang telah selesai</p>
                </div>
                <Link 
                    href={`/report/print?type=${typeFilter}&search=${searchTerm}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                    <Printer size={20} />
                    Cetak Laporan
                </Link>
            </div>

            {/* --- PERBAIKAN 3: StatCard sekarang menggunakan data dari state, bukan dari kalkulasi frontend --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Booking" value={loading ? '...' : totalCount.toLocaleString('id-ID')} icon={FileText} color="indigo" />
                <StatCard title="Total Pendapatan" value={loading ? '...' : `Rp ${totalRevenue.toLocaleString('id-ID')}`} icon={Download} color="green" />
                <StatCard title="Pengguna Unik" value={loading ? '...' : uniqueUsers.toLocaleString('id-ID')} icon={User} color="purple" />
                <StatCard title="Lokasi Aktif" value={loading ? '...' : uniqueLocations.toLocaleString('id-ID')} icon={MapPin} color="orange" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter Lokasi</p>
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.map(option => (
                                <button key={option.value} onClick={() => handleFilterChange(option.value)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${typeFilter === option.value ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
                                    <option.icon size={16} />{option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pencarian</p>
                        <DebouncedSearchInput value={searchTerm} onChange={handleSearchChange} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t dark:border-gray-700">
                    <div className="relative w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                        <Calendar className="absolute left-3 top-9 z-10 w-5 h-5 text-gray-400" />
                        <DatePicker selected={startDate} onChange={(date) => { setStartDate(date); setCurrentPage(1); }} dateFormat="dd/MM/yyyy" className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div className="relative w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Akhir</label>
                        <Calendar className="absolute left-3 top-9 z-10 w-5 h-5 text-gray-400" />
                        <DatePicker selected={endDate} onChange={(date) => { setEndDate(date); setCurrentPage(1); }} dateFormat="dd/MM/yyyy" minDate={startDate} className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? ( <div className="flex justify-center items-center py-24"><Loader2 className="w-12 h-12 animate-spin text-indigo-500" /></div>) 
                : reportData.length === 0 ? ( <div className="text-center py-24"><ServerCrash className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Tidak Ada Data</h4><p className="text-gray-500 dark:text-gray-400">Tidak ada data laporan yang cocok dengan filter.</p></div>) 
                : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID Booking</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Pengguna</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Lokasi & Slot</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Waktu</th><th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Bayar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {reportData.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-6 py-4"><div className="flex items-center gap-3"><FileText className="w-4 h-4 text-indigo-600" /><span className="font-bold text-gray-900 dark:text-white">#{booking.id}</span></div></td>
                                            <td className="px-6 py-4"><div className="flex items-center gap-3"><User className="w-4 h-4 text-purple-600" /><span className="font-medium text-gray-900 dark:text-white">{booking.user_name}</span></div></td>
                                            <td className="px-6 py-4"><div><div className="flex items-center gap-2 mb-1"><MapPin className="w-4 h-4 text-green-600" /><span className="font-medium text-gray-900 dark:text-white">{booking.location_name}</span></div><div className="text-sm text-gray-500 dark:text-gray-400">Slot: {booking.spot_code}</div></div></td>
                                            <td className="px-6 py-4"><div className="space-y-1"><div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-blue-600" /><span className="text-gray-600 dark:text-gray-400">Masuk:</span><span className="font-medium text-gray-900 dark:text-white">{new Date(booking.entry_time).toLocaleString('id-ID')}</span></div><div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-red-600" /><span className="text-gray-600 dark:text-gray-400">Keluar:</span><span className="font-medium text-gray-900 dark:text-white">{new Date(booking.actual_exit_time).toLocaleString('id-ID')}</span></div></div></td>
                                            <td className="px-6 py-4 text-right"><div className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg inline-block"><span className="font-bold text-green-700 dark:text-green-400">Rp {Number(booking.total_price).toLocaleString('id-ID')}</span></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Menampilkan {reportData.length} dari {totalCount} data</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /> Sebelumnya</button>
                                        <div className="flex items-center gap-1">{[...Array(Math.min(5, totalPages))].map((_, i) => { const page = i + 1; return (<button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 text-sm font-medium rounded-lg ${ currentPage === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>{page}</button>);})}{totalPages > 5 && (<span className="px-2">...</span>)}</div>
                                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 disabled:opacity-50">Berikutnya <ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

