'use client';

import { useState, useEffect } from 'react';
import { DollarSign, BarChart2, PieChart, Loader2, ServerCrash, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart as RechartsPieChart, Pie, Cell, Sector, LineChart, Line, Area, AreaChart
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color = "green" }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`bg-${color}-100 dark:bg-${color}-900/30 p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% dari minggu lalu
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// Enhanced Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-2 mb-1">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color || entry.fill }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.name}:
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                            {entry.dataKey === 'Pendapatan' 
                                ? `Rp ${entry.value.toLocaleString('id-ID')}` 
                                : entry.value
                            }
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Enhanced Active Shape for Pie Chart
const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <g>
            <text x={cx} y={cy - 15} dy={8} textAnchor="middle" className="fill-gray-800 dark:fill-white font-bold text-lg">
                {payload.name}
            </text>
            <text x={cx} y={cy + 5} dy={8} textAnchor="middle" className="fill-gray-600 dark:fill-gray-300 text-sm">
                {value} booking ({(percent * 100).toFixed(1)}%)
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                className="drop-shadow-lg"
            />
        </g>
    );
};

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
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
                setData(analyticsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyticsData();
    }, []);
    
    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    // Enhanced color palette
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Memuat data analytics...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-24">
               <ServerCrash className="mx-auto w-16 h-16 text-gray-400 mb-4"/>
               <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Gagal Memuat Data</h3>
               <p className="text-gray-500 dark:text-gray-400">
                   {error || "Tidak dapat mengambil data laporan saat ini."}
               </p>
               <button 
                   onClick={() => window.location.reload()} 
                   className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
               >
                   Coba Lagi
               </button>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 p-6">
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Laporan & Analytics
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Ringkasan performa dan pendapatan aplikasi Anda
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Pendapatan" 
                    value={`Rp ${Number(data.totalRevenue).toLocaleString('id-ID')}`} 
                    icon={DollarSign} 
                    trend={15}
                    color="green"
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
                    title="Lokasi Terpopuler" 
                    value={data.bookingsByLocation[0]?.name?.split(' ')[0] + '...' || '-'} 
                    icon={MapPin} 
                    color="orange"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Revenue Area Chart */}
                <div className="xl:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-indigo-600" />
                            Pendapatan 7 Hari Terakhir
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                            <span>Pendapatan (Rp)</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={data.bookingsByDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#6b7280" 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#6b7280" 
                                fontSize={12}
                                tickFormatter={(value) => `${value/1000}k`}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="Pendapatan"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fill="url(#colorRevenue)"
                                fillOpacity={1}
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Location Pie Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-emerald-600" />
                            Distribusi per Lokasi
                        </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                       <RechartsPieChart>
                           <Pie 
                                data={data.bookingsByLocation} 
                                dataKey="Jumlah" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={70}
                                outerRadius={120} 
                                paddingAngle={2}
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                onMouseEnter={onPieEnter}
                                animationBegin={0}
                                animationDuration={1500}
                           >
                               {data.bookingsByLocation.map((entry, index) => (
                                   <Cell 
                                       key={`cell-${index}`} 
                                       fill={COLORS[index % COLORS.length]}
                                       className="hover:brightness-110 transition-all duration-200"
                                   />
                               ))}
                           </Pie>
                           <Tooltip content={<CustomTooltip />}/>
                       </RechartsPieChart>
                    </ResponsiveContainer>
                    
                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                        {data.bookingsByLocation.slice(0, 3).map((location, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
                                        {location.name}
                                    </span>
                                </div>
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {location.Jumlah}
                                </span>
                            </div>
                        ))}
                        {data.bookingsByLocation.length > 3 && (
                            <div className="text-xs text-gray-500 text-center pt-2">
                                +{data.bookingsByLocation.length - 3} lokasi lainnya
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Insights */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Insights & Rekomendasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">📈 Performa Terbaik</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {data.bookingsByLocation[0]?.name} memimpin dengan {data.bookingsByLocation[0]?.Jumlah} booking
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">💰 Rata-rata per Booking</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Rp {Math.round(data.totalRevenue / data.totalBookings).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}