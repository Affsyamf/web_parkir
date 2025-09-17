'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, ParkingCircle, Calendar, MapPin, User, FileText, Phone, Mail } from 'lucide-react';

function PrintReportContent() {
    const searchParams = useSearchParams();
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({});

    useEffect(() => {
        const type = searchParams.get('type') || 'ALL';
        const search = searchParams.get('search') || '';

        const fetchAllData = async () => {
            try {
                const response = await fetch(`/api/report?type=${type}&search=${search}&forPrint=true`);
                if (!response.ok) throw new Error('Gagal memuat data laporan');
                const data = await response.json();
                setReportData(data.reportData || []);
                
                // Calculate summary
                const totalRevenue = data.reportData.reduce((sum, booking) => sum + Number(booking.total_price), 0);
                const uniqueUsers = new Set(data.reportData.map(booking => booking.user_name)).size;
                const uniqueLocations = new Set(data.reportData.map(booking => booking.location_name)).size;
                
                setSummary({
                    totalBookings: data.reportData.length,
                    totalRevenue,
                    uniqueUsers,
                    uniqueLocations
                });
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
            const timer = setTimeout(() => window.print(), 1000);
            return () => clearTimeout(timer);
        }
    }, [loading, reportData]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <div className="relative mb-4">
                        <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-indigo-200 mx-auto"></div>
                    </div>
                    <p className="text-xl font-semibold text-gray-800 text-center">Mempersiapkan Laporan</p>
                    <p className="text-gray-500 text-center mt-2">Sedang mengumpulkan data...</p>
                </div>
            </div>
        );
    }

    const filterLabel = {
        'ALL': 'Semua Lokasi',
        'MALL': 'Mall',
        'BANDARA': 'Bandara',
        'GEDUNG': 'Gedung'
    };

    return (
        <div className="bg-white text-gray-900" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    body { 
                        margin: 0; 
                        padding: 0;
                        background: white;
                    }
                    .no-print { display: none !important; }
                    .print-break { page-break-after: always; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                }
            `}</style>

            {/* Header Company Info */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <ParkingCircle className="w-12 h-12" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Sistem Parkir Afif</h1>
                            <p className="text-xl opacity-90">Laporan Booking Lengkap</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-white/10 p-4 rounded-xl">
                            <p className="text-sm opacity-80">Tanggal Cetak:</p>
                            <p className="text-lg font-semibold">{new Date().toLocaleDateString('id-ID', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</p>
                            <p className="text-sm opacity-80">{new Date().toLocaleTimeString('id-ID')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Info & Summary */}
            <div className="px-8 mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Report Details */}
                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Detail Laporan
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Filter Lokasi:</span>
                                <span className="font-semibold text-gray-800">
                                    {filterLabel[searchParams.get('type') || 'ALL']}
                                </span>
                            </div>
                            {searchParams.get('search') && (
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">Kata Kunci:</span>
                                    <span className="font-semibold text-gray-800">"{searchParams.get('search')}"</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Total Data:</span>
                                <span className="font-semibold text-gray-800">{reportData.length} booking</span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    <div className="bg-indigo-50 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Statistik</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center bg-white p-4 rounded-xl">
                                <p className="text-2xl font-bold text-indigo-600">{summary.totalBookings}</p>
                                <p className="text-sm text-gray-600">Total Booking</p>
                            </div>
                            <div className="text-center bg-white p-4 rounded-xl">
                                <p className="text-2xl font-bold text-green-600">
                                    Rp {summary.totalRevenue?.toLocaleString('id-ID') || '0'}
                                </p>
                                <p className="text-sm text-gray-600">Total Pendapatan</p>
                            </div>
                            <div className="text-center bg-white p-4 rounded-xl">
                                <p className="text-2xl font-bold text-purple-600">{summary.uniqueUsers}</p>
                                <p className="text-sm text-gray-600">Pengguna Unik</p>
                            </div>
                            <div className="text-center bg-white p-4 rounded-xl">
                                <p className="text-2xl font-bold text-orange-600">{summary.uniqueLocations}</p>
                                <p className="text-sm text-gray-600">Lokasi Aktif</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                    <div className="bg-gray-800 text-white p-4">
                        <h3 className="text-xl font-bold">Data Booking Lengkap</h3>
                        <p className="text-gray-300">Riwayat semua transaksi yang telah selesai</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">No</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID Booking</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nama Pengguna</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lokasi</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Slot</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Waktu Masuk</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Waktu Keluar</th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Total Bayar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportData.map((booking, index) => (
                                    <tr key={booking.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors`}>
                                        <td className="px-4 py-3 text-sm text-gray-600 font-medium">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                #{booking.id}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{booking.user_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-gray-900">{booking.location_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                                {booking.spot_code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                            {new Date(booking.entry_time).toLocaleString('id-ID', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                            {new Date(booking.actual_exit_time).toLocaleString('id-ID', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                                                Rp {Number(booking.total_price).toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-800 text-white">
                                <tr>
                                    <td colSpan="7" className="px-4 py-4 text-right text-lg font-bold">
                                        Total Keseluruhan:
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="text-xl font-bold text-green-400">
                                            Rp {summary.totalRevenue?.toLocaleString('id-ID') || '0'}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 mt-8 p-6 border-t-4 border-indigo-600">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-gray-800 mb-2">Sistem Parkir Afif</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>+6289517644630</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span>admin@parkirafif.com</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        <p>Laporan ini dibuat secara otomatis</p>
                        <p>oleh sistem pada {new Date().toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PrintReportPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <div className="relative mb-4">
                        <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-indigo-200 mx-auto"></div>
                    </div>
                    <p className="text-xl font-semibold text-gray-800 text-center">Mempersiapkan Laporan</p>
                    <p className="text-gray-500 text-center mt-2">Sedang mengumpulkan data...</p>
                </div>
            </div>
        }>
            <PrintReportContent />
        </Suspense>
    );
}