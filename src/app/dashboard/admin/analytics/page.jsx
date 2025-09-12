'use client';

import { useState, useEffect } from 'react';
import { DollarSign, BarChart2, PieChart as PieIcon, Loader2, ServerCrash, TrendingUp } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, Sector 
} from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4">
        <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
            <Icon className="w-6 h-6 text-green-500" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

// --- Komponen Grafik yang Ditingkatkan ---

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-700 p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <p className="text-xs text-gray-500">{label}</p>
              {payload.map((entry, index) => (
                  <p key={`item-${index}`} className="font-bold text-sm" style={{ color: entry.color || entry.fill }}>
                    {entry.name}: {entry.dataKey === 'Pendapatan' ? `Rp ${entry.value.toLocaleString('id-ID')}` : entry.value}
                  </p>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
};

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  
    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
          {payload.name}
        </text>
         <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#999" className="text-sm">
          ({payload.Jumlah} booking)
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5} // Efek "keluar" saat aktif
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
};

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

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
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyticsData();
    }, []);
    
    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
    }

    if (!data) {
        return (
            <div className="text-center py-24">
               <ServerCrash className="mx-auto w-16 h-16 text-gray-400 mb-4"/>
               <h3 className="text-2xl font-semibold">Gagal Memuat Data</h3>
               <p className="text-gray-500 mt-2">Tidak dapat mengambil data laporan saat ini.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Laporan & Analytics</h1>
                <p className="text-gray-500 dark:text-gray-400">Ringkasan performa dan pendapatan aplikasi Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Pendapatan" value={`Rp ${Number(data.totalRevenue).toLocaleString('id-ID')}`} icon={DollarSign} />
                <StatCard title="Total Booking" value={data.totalBookings} icon={BarChart2} />
                <StatCard title="Lokasi Terpopuler" value={data.bookingsByLocation[0]?.name || '-'} icon={TrendingUp} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Pendapatan 7 Hari Terakhir</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.bookingsByDay} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                           <defs>
                             <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                               <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                             </linearGradient>
                           </defs>
                            {/* --- PERBAIKAN DI SINI: Menghapus properti 'dark:stroke' --- */}
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `Rp${value/1000}k`} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(206, 212, 218, 0.2)' }}/>
                            <Bar dataKey="Pendapatan" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Distribusi Booking per Lokasi</h3>
                    <ResponsiveContainer width="100%" height={300}>
                       <PieChart>
                           <Pie 
                                data={data.bookingsByLocation} 
                                dataKey="Jumlah" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60}
                                outerRadius={80} 
                                fill="#8884d8"
                                paddingAngle={5}
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                onMouseEnter={onPieEnter}
                                animationBegin={500}
                                animationDuration={1000}
                           >
                               {data.bookingsByLocation.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042'][index % 4]} />
                               ))}
                           </Pie>
                           <Tooltip content={<CustomTooltip />}/>
                       </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

