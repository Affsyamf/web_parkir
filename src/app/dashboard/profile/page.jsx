'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Loader2, User, KeyRound, Save, CheckCircle, BarChartHorizontalBig, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-blue-500">
        <Icon className="w-8 h-8 text-blue-500" />
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    
    const [name, setName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // State untuk statistik pengguna
    const [userStats, setUserStats] = useState({ totalBookings: 0, totalSpent: 0 });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
        
        // Ambil statistik booking pengguna
        const fetchUserStats = async () => {
            setIsLoadingStats(true);
            try {
                const response = await fetch('/api/bookings');
                if (!response.ok) return;
                const data = await response.json();
                const completedBookings = data.bookings?.filter(b => b.status === 'completed') || [];
                const totalSpent = completedBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
                setUserStats({
                    totalBookings: data.bookings?.length || 0,
                    totalSpent: totalSpent
                });
            } catch (err) {
                // Tidak perlu menampilkan error jika gagal memuat statistik
                console.error("Failed to fetch user stats:", err);
            } finally {
                setIsLoadingStats(false);
            }
        };

        if (status === 'authenticated') {
            fetchUserStats();
        }

    }, [session, status]);

    const handleNameUpdate = async (e) => {
        e.preventDefault();
        setIsUpdatingName(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal memperbarui nama.');
            }
            await update({ name }); // Update sesi di sisi klien
            toast.success('Nama berhasil diperbarui!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Password baru tidak cocok!');
            return;
        }
        if (newPassword.length < 1) {
            toast.error('Password minimal harus 6 karakter.');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal memperbarui password.');
            }
            toast.success('Password berhasil diperbarui!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (status === 'loading') {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Profil Pengguna</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola informasi akun dan preferensi Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <StatCard 
                    title="Total Booking" 
                    value={isLoadingStats ? '...' : userStats.totalBookings} 
                    icon={BarChartHorizontalBig} 
                />
                 <StatCard 
                    title="Total Pengeluaran" 
                    value={isLoadingStats ? '...' : `Rp ${userStats.totalSpent.toLocaleString('id-ID')}`} 
                    icon={DollarSign} 
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Informasi Akun */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><User size={20} /> Informasi Akun</h3>
                    <form onSubmit={handleNameUpdate} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" id="email" value={session?.user?.email || ''} className="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md cursor-not-allowed" disabled />
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
                        </div>
                        <button type="submit" disabled={isUpdatingName} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                            {isUpdatingName ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                            {isUpdatingName ? 'Menyimpan...' : 'Simpan Nama'}
                        </button>
                    </form>
                </div>

                {/* Form Ubah Password */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><KeyRound size={20} /> Ubah Password</h3>
                     <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password Baru</label>
                            <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
                        </div>
                         <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Konfirmasi Password Baru</label>
                            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
                        </div>
                         <button type="submit" disabled={isUpdatingPassword} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-400">
                            {isUpdatingPassword ? <Loader2 className="animate-spin" /> : <CheckCircle size={16} />}
                            {isUpdatingPassword ? 'Menyimpan...' : 'Ubah Password'}
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
