"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Loader2, ServerCrash, Printer, Search, ChevronLeft, ChevronRight, FileText, Download, Calendar, MapPin, User, Clock } from "lucide-react";
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
    }, [inputValue, delay, onChange, value]);

    return (
        <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Cari nama pengguna atau lokasi..."
                className="pl-12 pr-4 py-3 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
    const [totalCount, setTotalCount] = useState(0);
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
            setTotalCount(data.totalCount || 0);
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
        setSearchTerm('');
        setCurrentPage(1);
    };

    const totalRevenue = reportData.reduce((sum, booking) => sum + Number(booking.total_price), 0);
    const uniqueUsers = new Set(reportData.map(booking => booking.user_name)).size;
    const uniqueLocations = new Set(reportData.map(booking => booking.location_name)).size;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                                    <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Laporan Booking</h1>
                            </div>
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                Kelola dan analisis riwayat booking yang telah selesai
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link 
                                href={`/report/print?type=${typeFilter}&search=${searchTerm}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <Printer size={20} />
                                Cetak Laporan
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        title="Total Booking" 
                        value={totalCount.toLocaleString('id-ID')} 
                        icon={FileText} 
                        color="indigo"
                    />
                    <StatCard 
                        title="Total Pendapatan" 
                        value={`Rp ${totalRevenue.toLocaleString('id-ID')}`} 
                        icon={Download} 
                        color="green"
                    />
                    <StatCard 
                        title="Pengguna Unik" 
                        value={uniqueUsers.toLocaleString('id-ID')} 
                        icon={User} 
                        color="purple"
                    />
                    <StatCard 
                        title="Lokasi Aktif" 
                        value={uniqueLocations.toLocaleString('id-ID')} 
                        icon={MapPin} 
                        color="orange"
                    />
                </div>

                {/* Filters and Search */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Filter Buttons */}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter Lokasi</p>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.map(option => {
                                    const IconComponent = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleFilterChange(option.value)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                                typeFilter === option.value
                                                    ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <IconComponent size={16} />
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Search */}
                        <div className="flex-shrink-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pencarian</p>
                            <DebouncedSearchInput value={searchTerm} onChange={handleSearchChange} />
                        </div>
                    </div>
                    {/* datepciker */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t dark:border-gray-700">
  <div className="relative w-full">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Tanggal Mulai
    </label>
    <Calendar className="absolute left-3 top-9 z-10 w-5 h-5 text-gray-400" />
    <DatePicker
      selected={startDate}
      onChange={(date) => {
        setStartDate(date);
        setCurrentPage(1);
      }}
      dateFormat="dd/MM/yyyy"
      className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
    />
  </div>

  <div className="relative w-full">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Tanggal Akhir
    </label>
    <Calendar className="absolute left-3 top-9 z-10 w-5 h-5 text-gray-400" />
    <DatePicker
      selected={endDate}
      onChange={(date) => {
        setEndDate(date);
        setCurrentPage(1);
      }}
      dateFormat="dd/MM/yyyy"
      minDate={startDate}
      className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
    />
  </div>
</div>

                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-24">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-800"></div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-4 font-medium">Memuat data laporan...</p>
                        </div>
                    ) : reportData.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl inline-block mb-6">
                                <ServerCrash className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Tidak Ada Data</h4>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                Tidak ada data laporan yang cocok dengan filter yang dipilih. Coba ubah filter atau kata kunci pencarian.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID Booking</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Pengguna</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Lokasi & Slot</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Waktu</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Bayar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {reportData.map((booking, index) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                                                            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <span className="font-bold text-gray-900 dark:text-white">#{booking.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                                                            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{booking.user_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            <span className="font-medium text-gray-900 dark:text-white">{booking.location_name}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Slot: {booking.spot_code}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            <span className="text-gray-600 dark:text-gray-400">Masuk:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {new Date(booking.entry_time).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                            <span className="text-gray-600 dark:text-gray-400">Keluar:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {new Date(booking.actual_exit_time).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg inline-block">
                                                        <span className="font-bold text-green-700 dark:text-green-400">
                                                            Rp {Number(booking.total_price).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Enhanced Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Menampilkan <span className="font-semibold">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> dari <span className="font-semibold">{totalCount}</span> data
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(p => p - 1)}
                                                disabled={currentPage === 1 || loading}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Sebelumnya
                                            </button>
                                            
                                            <div className="flex items-center gap-1">
                                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                                    const page = i + 1;
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`w-10 h-10 text-sm font-medium rounded-lg transition-all ${
                                                                currentPage === page
                                                                    ? 'bg-indigo-600 text-white shadow-lg'
                                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                })}
                                                {totalPages > 5 && (
                                                    <span className="px-2 text-gray-500">...</span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                disabled={currentPage === totalPages || loading}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                Berikutnya
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}