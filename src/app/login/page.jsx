'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Import signIn
import Link from 'next/link';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Menggunakan fungsi signIn dari NextAuth
      const result = await signIn('credentials', {
        redirect: false, // Kita handle redirect manual
        email,
        password,
      });

      if (result.error) {
        // Jika NextAuth mengembalikan error (misal: password salah)
        setError('Email atau password salah. Silakan coba lagi.');
        setIsLoading(false);
      } else {
        // Jika berhasil, arahkan ke halaman dashboard (yang akan kita buat)
        router.push('/dashboard'); 
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };
  
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div 
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Selamat Datang Kembali</h1>
          <p className="mt-2 text-gray-600">Masuk untuk melanjutkan ke dashboard Anda.</p>
        </div>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          {error && (
            <motion.div className="p-3 text-center text-red-800 bg-red-100 border border-red-200 rounded-lg" variants={itemVariants}>
              {error}
            </motion.div>
          )}

          <motion.div className="relative" variants={itemVariants}>
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Alamat Email"
              className="w-full pl-10 pr-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </motion.div>

          <motion.div className="relative" variants={itemVariants}>
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </motion.div>
          
          <motion.button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-all flex items-center justify-center gap-2"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </motion.button>
        </motion.form>

        <p className="text-sm text-center text-gray-500">
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            Daftar sekarang
          </Link>
        </p>
        <p className="text-sm text-center text-gray-500">
          Kembali Ke Dashboard{' '}
          <Link href="/" className="font-medium text-blue-600 hover:underline">
            Klik disini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

