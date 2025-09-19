'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !email || !password) {
      setError('Semua field harus diisi.');
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Password harus minimal 4 karakter.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mendaftarkan pengguna.');
      }

      // Jika berhasil, arahkan ke halaman login
      router.push('/login?message=Registrasi berhasil! Silakan login.');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Password validation helpers
  const passwordValidation = {
    minLength: password.length >= 4,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password)
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4">
      <motion.div 
        className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            Buat Akun Baru
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-gray-400"
          >
            Bergabunglah dan nikmati kemudahan parkir digital
          </motion.p>
        </div>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          {error && (
            <motion.div 
              className="p-4 text-center text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg backdrop-blur-sm flex items-center gap-3" 
              variants={itemVariants}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Name Field */}
          <motion.div className="relative" variants={itemVariants}>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full pl-10 pr-4 py-3 text-gray-200 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200 hover:bg-gray-700/70"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </motion.div>

          {/* Email Field */}
          <motion.div className="relative" variants={itemVariants}>
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Alamat Email"
              className="w-full pl-10 pr-4 py-3 text-gray-200 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200 hover:bg-gray-700/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </motion.div>

          {/* Password Field */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 text-gray-200 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200 hover:bg-gray-700/70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </motion.button>
            </div>
            
            {/* Password Requirements */}
            {password && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
              >
                <p className="text-xs text-gray-400 mb-2">Persyaratan password:</p>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.minLength ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordValidation.minLength ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    Minimal 4 karakter
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasLetter ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordValidation.hasLetter ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    Mengandung huruf
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasNumber ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordValidation.hasNumber ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    Mengandung angka
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
          
          <motion.button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:from-blue-400 disabled:to-purple-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25"
            disabled={isLoading || !name || !email || !isPasswordValid}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Mendaftarkan...
              </div>
            ) : (
              <>
                Daftar Sekarang
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Footer Links */}
        <div className="space-y-3 pt-4 border-t border-gray-700/50">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-center text-gray-400"
          >
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline">
              Masuk di sini
            </Link>
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-center text-gray-400"
          >
            Kembali ke Dashboard{' '}
            <Link href="/" className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200 hover:underline">
              Klik di sini
            </Link>
          </motion.p>
        </div>

        {/* Privacy Notice */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-500 text-center p-3 bg-gray-700/20 rounded-lg border border-gray-600/20"
        >
          Dengan mendaftar, Anda menyetujui{' '}
          <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Syarat & Ketentuan</span>
          {' '}dan{' '}
          <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Kebijakan Privasi</span> kami.
        </motion.div>
      </motion.div>
    </div>
  );
}