'use client';

import { useState, useEffect } from 'react';
import { DollarSign, BarChart2, PieChart, Loader2, ServerCrash, TrendingUp, Calendar, MapPin, Users } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color = "indigo", gradient = false }) => (
    <div className={`relative overflow-hidden ${gradient ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-white dark:bg-gray-800'} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group`}>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className={`${gradient ? 'bg-white/20' : `bg-${color}-100 dark:bg-${color}-900/30`} p-3 rounded-xl transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`w-6 h-6 ${gradient ? 'text-white' : `text-${color}-600 dark:text-${color}-400`}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        <span>{trend > 0 ? '↗' : '↘'}</span>
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <div>
                <p className={`text-sm mb-2 ${gradient ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{title}</p>
                <p className={`text-3xl font-bold ${gradient ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{value}</p>
            </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-gradient-to-br from-white/5 to-white/10 rounded-full"></div>
    </div>
);

// Enhanced Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">{label}</p>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full shadow-sm" 
                                style={{ backgroundColor: entry.color || entry.fill }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Pendapatan
                            </span>
                        </div>
                        <span className="font-bold text-gray-800 dark:text-white">
                            Rp {Number(entry.value || 0).toLocaleString('id-ID')}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Improved PieChart tooltip - separate from active shape
const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm z-50">
                <div className="flex items-center gap-2 mb-2">
                    <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: data.payload.fill }}
                    />
                    <span className="font-semibold text-gray-800 dark:text-white">
                        {data.payload.name}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Booking: {data.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Persentase: {((data.value / data.payload.total) * 100).toFixed(1)}%
                </p>
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/analytics');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Gagal memuat data analytics.");
                }
                const analyticsData = await response.json();
                
                // Calculate total for percentage calculation
                const totalBookings = analyticsData.bookingsByLocation.reduce((sum, item) => sum + item.Jumlah, 0);
                const enhancedLocationData = analyticsData.bookingsByLocation.map(item => ({
                    ...item,
                    total: totalBookings
                }));
                
                setData({
                    ...analyticsData,
                    bookingsByLocation: enhancedLocationData
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyticsData();
    }, []);

    // Enhanced color palette with better contrast
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-800"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-4 font-medium">Memuat data analytics...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-24">
               <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl inline-block mb-6">
                   <ServerCrash className="mx-auto w-16 h-16 text-red-500 mb-4"/>
               </div>
               <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Gagal Memuat Data</h3>
               <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                   {error || "Tidak dapat mengambil data laporan saat ini. Silakan coba lagi dalam beberapa saat."}
               </p>
               <button 
                   onClick={() => window.location.reload()} 
                   className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
               >
                   Coba Lagi
               </button>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">Dashboard Analytics</span>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Laporan & Analytics
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Pantau performa bisnis Anda dengan insight mendalam dan visualisasi data yang komprehensif
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard 
                        title="Total Pendapatan" 
                        value={`Rp ${Number(data.totalRevenue).toLocaleString('id-ID')}`} 
                        icon={DollarSign} 
                        trend={15}
                        color="green"
                        gradient={true}
                    />
                    <StatCard 
                        title="Total Booking" 
                        value={data.totalBookings} 
                        icon={BarChart2} 
                        trend={8}
                        color="blue"
                    />
                    <StatCard 
                        title="Booking Aktif" 
                        value={data.activeBookingsCount || 0} 
                        icon={Calendar} 
                        color="purple"
                    />
                    <StatCard 
                        title="Rata-rata per Booking" 
                        value={`Rp ${Math.round(data.totalRevenue / data.totalBookings).toLocaleString('id-ID')}`} 
                        icon={Users} 
                        color="orange"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                    {/* Revenue Area Chart */}
                    <div className="xl:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Pendapatan Harian</h3>
                                <p className="text-gray-500 dark:text-gray-400">Tren pendapatan 7 hari terakhir</p>
                            </div>
                            <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Pendapatan (Rp)</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={data.bookingsByDay} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                                        <stop offset="50%" stopColor="#6366f1" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#6b7280" 
                                    fontSize={12}
                                    fontWeight={500}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#6b7280" 
                                    fontSize={12}
                                    fontWeight={500}
                                    tickFormatter={(value) => `${value/1000}k`}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="Pendapatan"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fill="url(#colorRevenue)"
                                    fillOpacity={1}
                                    animationDuration={2000}
                                    dot={{ fill: '#6366f1', strokeWidth: 3, stroke: '#ffffff', r: 6 }}
                                    activeDot={{ r: 8, stroke: '#6366f1', strokeWidth: 3, fill: '#ffffff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        
                        {/* Enhanced Statistics Cards Below Chart */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="mb-4">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Ringkasan Performa</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Analisis mendalam data 7 hari terakhir</p>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Highest Day Card */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-2xl border border-green-200 dark:border-green-800/50 hover:shadow-lg transition-all duration-300 group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Peak Day</p>
                                            <p className="text-sm font-bold text-green-800 dark:text-green-300">
                                                {(() => {
                                                    const highest = data.bookingsByDay.reduce((prev, current) => 
                                                        (prev.Pendapatan > current.Pendapatan) ? prev : current
                                                    );
                                                    return highest.date;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-green-700 dark:text-green-300">
                                            Rp {data.bookingsByDay.reduce((prev, current) => 
                                                (prev.Pendapatan > current.Pendapatan) ? prev : current
                                            ).Pendapatan.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400">Pendapatan tertinggi</p>
                                    </div>
                                </div>

                                {/* Lowest Day Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300 group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Low Day</p>
                                            <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
                                                {(() => {
                                                    const lowest = data.bookingsByDay.reduce((prev, current) => 
                                                        (prev.Pendapatan < current.Pendapatan) ? prev : current
                                                    );
                                                    return lowest.date;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                            Rp {data.bookingsByDay.reduce((prev, current) => 
                                                (prev.Pendapatan < current.Pendapatan) ? prev : current
                                            ).Pendapatan.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">Pendapatan terendah</p>
                                    </div>
                                </div>

                                {/* Average Card */}
                                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-5 rounded-2xl border border-purple-200 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300 group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                            <BarChart2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Average</p>
                                            <p className="text-sm font-bold text-purple-800 dark:text-purple-300">Per Hari</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                            Rp {Math.round(data.totalRevenue / data.bookingsByDay.length).toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs text-purple-600 dark:text-purple-400">Rata-rata harian</p>
                                    </div>
                                </div>

                                {/* Trend Card */}
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/50 hover:shadow-lg transition-all duration-300 group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                            <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Trend</p>
                                            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                                                {(() => {
                                                    const firstDay = data.bookingsByDay[0]?.Pendapatan || 0;
                                                    const lastDay = data.bookingsByDay[data.bookingsByDay.length - 1]?.Pendapatan || 0;
                                                    return lastDay > firstDay ? "Naik" : lastDay < firstDay ? "Turun" : "Stabil";
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-bold ${(() => {
                                            const firstDay = data.bookingsByDay[0]?.Pendapatan || 0;
                                            const lastDay = data.bookingsByDay[data.bookingsByDay.length - 1]?.Pendapatan || 0;
                                            if (lastDay > firstDay) return "text-green-600 dark:text-green-400";
                                            if (lastDay < firstDay) return "text-red-600 dark:text-red-400";
                                            return "text-amber-700 dark:text-amber-300";
                                        })()}`}>
                                            {(() => {
                                                const firstDay = data.bookingsByDay[0]?.Pendapatan || 0;
                                                const lastDay = data.bookingsByDay[data.bookingsByDay.length - 1]?.Pendapatan || 0;
                                                const trend = lastDay > firstDay ? '↗' : lastDay < firstDay ? '↘' : '→';
                                                if (firstDay === 0) return `${trend} 0%`;
                                                const change = ((lastDay - firstDay) / firstDay * 100).toFixed(1);
                                                return `${trend} ${Math.abs(change)}%`;
                                            })()}
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400">Perubahan minggu ini</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Pie Chart */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Distribusi Lokasi</h3>
                            <p className="text-gray-500 dark:text-gray-400">Sebaran booking per lokasi</p>
                        </div>
                        
                        <div className="relative mb-6">
                            <ResponsiveContainer width="100%" height={260}>
                                <RechartsPieChart>
                                    <Pie 
                                        data={data.bookingsByLocation} 
                                        dataKey="Jumlah" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={60}
                                        outerRadius={110} 
                                        paddingAngle={3}
                                        animationBegin={500}
                                        animationDuration={1500}
                                    >
                                        {data.bookingsByLocation.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="#ffffff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Enhanced Legend */}
                        <div className="space-y-3">
                            {data.bookingsByLocation.slice(0, 4).map((location, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-4 h-4 rounded-full shadow-sm" 
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[140px]">
                                            {location.name}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-800 dark:text-white">
                                            {location.Jumlah}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {((location.Jumlah / location.total) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {data.bookingsByLocation.length > 4 && (
                                <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                                    +{data.bookingsByLocation.length - 4} lokasi lainnya
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Insights Section */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                            Insights & Rekomendasi
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Analisis mendalam berdasarkan data performa Anda
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white">Performa Terbaik</h4>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">{data.bookingsByLocation[0]?.name}</span> memimpin dengan{' '}
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.bookingsByLocation[0]?.Jumlah} booking</span>
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl">
                                    <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white">Pendapatan Harian</h4>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                Rata-rata <span className="font-bold text-indigo-600 dark:text-indigo-400">Rp {Math.round(data.totalRevenue / 7).toLocaleString('id-ID')}</span> per hari
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl">
                                    <BarChart2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white">Tingkat Okupansi</h4>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.activeBookingsCount}</span> booking sedang aktif saat ini
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}