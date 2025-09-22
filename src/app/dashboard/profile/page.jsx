'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { 
    Loader2, User, KeyRound, Save, CheckCircle, BarChartHorizontalBig, 
    DollarSign, Shield, Calendar, Eye, EyeOff, AlertTriangle, Activity,
    Clock, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => {
    // PERBAIKAN: Mendefinisikan kelas Tailwind secara penuh untuk menghindari purging saat build
    const colorClasses = {
        blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
        green: "from-green-500 to-green-600 shadow-green-500/25",
        purple: "from-purple-500 to-purple-600 shadow-purple-500/25",
        orange: "from-orange-500 to-orange-600 shadow-orange-500/25"
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-xl shadow-lg text-white relative overflow-hidden group cursor-pointer`}
        >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <p className="text-sm opacity-90 mb-1">{title}</p>
                    <p className="text-3xl font-bold mb-2">{value}</p>
                    {trend && (
                        <div className="flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                    <Icon className="w-8 h-8" />
                </div>
            </div>
        </motion.div>
    );
};

const FormSection = ({ title, icon: Icon, children, className = "" }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 ${className}`}
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {children}
    </motion.div>
);

const InputField = ({ label, type = "text", value, onChange, disabled = false, required = false, icon: Icon, showToggle = false, onToggle, showPassword = false }) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
            <input
                type={showToggle ? (showPassword ? "text" : "password") : type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${showToggle ? 'pr-12' : 'pr-4'} py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${disabled ? 'cursor-not-allowed opacity-75' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            />
            {showToggle && (
                <motion.button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
            )}
        </div>
    </div>
);

const PasswordStrengthIndicator = ({ password }) => {
    const requirements = [
        { label: "Minimal 4 karakter", met: password.length >=  4},
        { label: "Mengandung huruf", met: /[a-zA-Z]/.test(password) },
        { label: "Mengandung angka", met: /\d/.test(password) }
    ];

    const strength = requirements.filter(req => req.met).length;
    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
    const strengthLabels = ["Lemah", "Cukup", "Bagus", "Kuat"];

    if (!password) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
        >
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kekuatan Password: <span className={`${strength >= 2 ? 'text-green-600' : 'text-orange-600'}`}>
                        {strengthLabels[strength]}
                    </span>
                </span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-3 h-2 rounded-full ${i < strength ? strengthColors[strength] : 'bg-gray-300 dark:bg-gray-600'}`} />
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                {requirements.map((req, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm ${req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {req.met ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {req.label}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const [userStats, setUserStats] = useState({ 
        totalBookings: 0, 
        totalSpent: 0,
        activeBookings: 0,
        lastBookingDate: null
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    const isPasswordValid = newPassword.length >= 6 && /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword);

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
        
        const fetchUserStats = async () => {
            setIsLoadingStats(true);
            try {
                const response = await fetch('/api/profile/stats');
                if (!response.ok) {
                    throw new Error("Gagal memuat statistik.");
                }
                const data = await response.json();
                
                setUserStats({
                    totalBookings: data.totalBookings || 0,
                    totalSpent: data.totalSpent || 0,
                    activeBookings: data.activeBookings || 0,
                    lastBookingDate: data.lastBookingDate || null
                });
            } catch (err) {
                console.error("Error fetching user stats:", err);
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
        if (name.trim().length < 2) {
            toast.error('Nama harus minimal 2 karakter.');
            return;
        }

        setIsUpdatingName(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Gagal memperbarui nama.');
            }
            
            await update({ name: name.trim() });
            toast.success('Nama berhasil diperbarui!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (!currentPassword) {
            toast.error('Password saat ini diperlukan.');
            return;
        }
        
        if (!isPasswordValid) {
            toast.error('Password baru tidak memenuhi persyaratan.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Password baru tidak cocok!');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    currentPassword,
                    newPassword 
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Gagal memperbarui password.');
            }
            
            toast.success('Password berhasil diperbarui!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex flex-col justify-center items-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Memuat profil...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Profil Pengguna</h1>
                        <p className="text-blue-100 text-lg">Kelola informasi akun dan lihat aktivitas Anda</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                        <User className="w-12 h-12" />
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{session?.user?.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {session?.user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Bergabung sejak</p>
                        <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'}) : 'Tidak diketahui'}
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Booking" value={isLoadingStats ? '...' : userStats.totalBookings} icon={BarChartHorizontalBig} color="blue" trend={userStats.totalBookings > 0 ? `${userStats.activeBookings} aktif` : null}/>
                <StatCard title="Total Pengeluaran" value={isLoadingStats ? '...' : `Rp ${userStats.totalSpent.toLocaleString('id-ID')}`} icon={DollarSign} color="green" />
                <StatCard title="Booking Aktif" value={isLoadingStats ? '...' : userStats.activeBookings} icon={Activity} color="purple" />
                <StatCard title="Terakhir Booking" value={isLoadingStats ? '...' : (userStats.lastBookingDate ? new Date(userStats.lastBookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Belum ada')} icon={Clock} color="orange" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FormSection title="Informasi Akun" icon={User}>
                    <form onSubmit={handleNameUpdate} className="space-y-6">
                        <InputField label="Alamat Email" type="email" value={session?.user?.email || ''} disabled icon={Shield} />
                        <InputField label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required icon={User} />
                        <motion.button type="submit" disabled={isUpdatingName || name.trim().length < 2} className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {isUpdatingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isUpdatingName ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </motion.button>
                    </form>
                </FormSection>

                <FormSection title="Keamanan Akun" icon={KeyRound}>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        <InputField label="Password Saat Ini" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required icon={KeyRound} showToggle showPassword={showCurrentPassword} onToggle={() => setShowCurrentPassword(!showCurrentPassword)} />
                        <InputField label="Password Baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required icon={KeyRound} showToggle showPassword={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} />
                        <AnimatePresence>
                            {newPassword && <PasswordStrengthIndicator password={newPassword} />}
                        </AnimatePresence>
                        <InputField label="Konfirmasi Password Baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required icon={CheckCircle} showToggle showPassword={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertTriangle className="w-4 h-4" /> Password tidak cocok
                            </motion.div>
                        )}
                        <motion.button type="submit" disabled={isUpdatingPassword || !isPasswordValid || newPassword !== confirmPassword || !currentPassword} className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold rounded-xl" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            {isUpdatingPassword ? 'Mengubah...' : 'Ubah Password'}
                        </motion.button>
                    </form>
                </FormSection>
            </div>
        </div>
    );
}

