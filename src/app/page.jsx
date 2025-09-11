'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Search, MapPin, Car, ParkingCircle, CheckCircle, Smartphone, ShieldCheck, Zap, Users, Star } from 'lucide-react';
import Link from 'next/link';

// Komponen Header
const Header = () => (
  <motion.header 
    className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200"
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-gray-900">
        Park<span className="text-blue-600">Wise</span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          Login
        </Link>
        <Link href="/register" className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">
          Register
        </Link>
      </div>
    </div>
  </motion.header>
);

// Komponen Hero Section
const HeroSection = () => (
  <section className="relative py-20 md:py-32 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-70"></div>
    <div className="container mx-auto px-6 text-center relative z-10">
      <motion.h1 
        className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Parkir Cerdas,
        </span>
        <br />
        Perjalanan Lancar.
      </motion.h1>
      <motion.p 
        className="mt-6 max-w-2xl mx-auto text-lg text-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Temukan dan pesan tempat parkir Anda di mal, gedung, dan bandara terdekat dengan mudah. Ucapkan selamat tinggal pada stres mencari parkir.
      </motion.p>
      <motion.div 
        className="mt-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          Mulai Sekarang <ArrowRight className="ml-2 w-6 h-6" />
        </Link>
      </motion.div>
    </div>
  </section>
);

// Komponen Kartu Fitur
const FeatureCard = ({ icon: Icon, title, children, delay }) => (
  <motion.div 
    className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </motion.div>
);

// Komponen Seksi Fitur
const FeaturesSection = () => (
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Kenapa Memilih ParkWise?</h2>
        <p className="mt-4 max-w-2xl mx-auto text-gray-600">
          Kami menyediakan solusi parkir modern yang dirancang untuk kenyamanan Anda.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard icon={Smartphone} title="Booking Mudah" delay={0.1}>
          Pesan slot parkir Anda hanya dengan beberapa ketukan di ponsel, kapan saja dan di mana saja.
        </FeatureCard>
        <FeatureCard icon={CheckCircle} title="Slot Terjamin" delay={0.2}>
          Tidak perlu lagi berputar-putar. Slot parkir yang Anda pesan dijamin tersedia saat Anda tiba.
        </FeatureCard>
        <FeatureCard icon={ShieldCheck} title="Pembayaran Aman" delay={0.3}>
          Sistem pembayaran digital yang aman dan transparan, tanpa biaya tersembunyi.
        </FeatureCard>
        <FeatureCard icon={Zap} title="Check-in Cepat" delay={0.4}>
          Masuk dan keluar area parkir dengan cepat menggunakan kode QR atau plat nomor Anda.
        </FeatureCard>
        <FeatureCard icon={Users} title="Admin Dashboard" delay={0.5}>
          Panel admin yang kuat untuk mengelola lokasi, slot, dan memonitor pendapatan secara real-time.
        </FeatureCard>
        <FeatureCard icon={Star} title="Laporan & Analitik" delay={0.6}>
          Dapatkan wawasan berharga dari data parkir untuk mengoptimalkan operasi bisnis Anda.
        </FeatureCard>
      </div>
    </div>
  </section>
);


// Komponen Langkah Cara Kerja
const HowItWorksStep = ({ icon: Icon, step, title, children, isLast = false }) => (
  <div className="relative flex items-start">
    <div className="flex flex-col items-center mr-6">
      <div className="flex items-center justify-center w-16 h-16 bg-white text-blue-600 rounded-full border-2 border-blue-200 shadow-md">
        <Icon className="w-8 h-8" />
      </div>
      {!isLast && <div className="w-px h-24 bg-blue-200 mt-4"></div>}
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-1">Langkah {step}: {title}</h3>
      <p className="text-gray-600">{children}</p>
    </div>
  </div>
);

// Komponen Seksi Cara Kerja
const HowItWorksSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Hanya 3 Langkah Mudah</h2>
        <p className="mt-4 max-w-2xl mx-auto text-gray-600">
          Mulai gunakan ParkWise dengan proses yang cepat dan intuitif.
        </p>
      </div>
      <motion.div 
        className="flex flex-col md:flex-row justify-center items-start md:space-x-12 space-y-12 md:space-y-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.2, duration: 0.5 }}
      >
        <HowItWorksStep icon={Search} step={1} title="Cari & Pilih">
          Masukkan tujuan Anda dan pilih lokasi parkir yang tersedia dari daftar kami.
        </HowItWorksStep>
        <HowItWorksStep icon={MapPin} step={2} title="Pesan & Bayar">
          Pilih slot yang Anda inginkan, tentukan durasi, dan selesaikan pembayaran dengan aman.
        </HowItWorksStep>
        <HowItWorksStep icon={ParkingCircle} step={3} title="Parkir & Nikmati" isLast={true}>
          Tiba di lokasi, tunjukkan bukti booking Anda, dan nikmati waktu Anda tanpa khawatir.
        </HowItWorksStep>
      </motion.div>
    </div>
  </section>
);

// Komponen Call to Action
const CTASection = () => (
  <section className="bg-blue-600">
    <div className="container mx-auto px-6 py-16 text-center">
      <h2 className="text-3xl font-bold text-white">Siap Mengubah Cara Anda Parkir?</h2>
      <p className="mt-4 text-blue-100 max-w-xl mx-auto">
        Bergabunglah dengan ribuan pengguna dan mitra yang telah merasakan kemudahan bersama ParkWise. Daftar sekarang dan dapatkan diskon pada booking pertama Anda!
      </p>
      <motion.div 
        className="mt-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="/register" className="inline-block px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-full hover:bg-gray-100 transition-colors">
          Daftar Gratis
        </Link>
      </motion.div>
    </div>
  </section>
);

// Komponen Footer
const Footer = () => (
  <footer className="bg-gray-900 text-gray-400">
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h3 className="text-xl font-bold text-white">Park<span className="text-blue-500">Wise</span></h3>
          <p className="mt-1">Solusi parkir cerdas untuk kota modern.</p>
        </div>
        <div className="flex space-x-6">
          <Link href="#" className="hover:text-white transition-colors">Tentang Kami</Link>
          <Link href="#" className="hover:text-white transition-colors">Kontak</Link>
          <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} ParkWise. All rights reserved.</p>
      </div>
    </div>
  </footer>
);


export default function HomePage() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

