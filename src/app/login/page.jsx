'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
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
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        setError('Email atau password salah. Silakan coba lagi.');
        setIsLoading(false);
      } else {
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <motion.div 
        className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Selamat Datang Kembali
          </h1>
          <p className="mt-2 text-gray-400">Masuk untuk melanjutkan ke dashboard Anda.</p>
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
              className="p-3 text-center text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg backdrop-blur-sm" 
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}

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

          <motion.div className="relative" variants={itemVariants}>
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 text-gray-200 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200 hover:bg-gray-700/70"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </motion.div>
          
          <motion.button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:from-blue-400 disabled:to-purple-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </motion.button>
        </motion.form>

        <div className="space-y-2">
          <p className="text-sm text-center text-gray-400">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline">
              Daftar sekarang
            </Link>
          </p>
          <p className="text-sm text-center text-gray-400">
            Kembali Ke Dashboard{' '}
            <Link href="/" className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200 hover:underline">
              Klik disini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}