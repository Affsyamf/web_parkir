'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Search, MapPin, ParkingCircle, CheckCircle, Smartphone, ShieldCheck, Zap, Users, Star, Clock, Car, Building2, Plane, Play, Check } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ThemeToggleButton } from '../components/ThemeToggleButton';

// Enhanced Header with glass morphism
const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div 
          className="text-2xl font-bold text-gray-900 dark:text-white"
          whileHover={{ scale: 1.05 }}
        >
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ParkingCircle className="w-5 h-5 text-white" />
            </div>
            Park <span className="text-blue-600 dark:text-blue-400">Wise</span>
          </a>
        </motion.div>
        
        <div className="flex items-center gap-6">
          <ThemeToggleButton />
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Login
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/register" className="flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
              Register
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

// Enhanced Hero Section with particle background
const HeroSection = () => {
  const [stats] = useState([
    { label: "Happy Users", value: "10K+" },
    { label: "Parking Spots", value: "50K+" },
    { label: "Cities", value: "25+" }
  ]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-400/10 rounded-full blur-2xl animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-6 text-center relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Revolusi Parkir Digital
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Parkir Cerdas,
            </span>
            <br />
            Perjalanan Lancar.
          </motion.h1>
          
          <motion.p 
            className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Temukan dan pesan tempat parkir Anda di mal, gedung, dan bandara terdekat dengan mudah. 
            Ucapkan selamat tinggal pada stres mencari parkir dengan teknologi AI terdepan.
          </motion.p>
          
          <motion.div 
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Mulai Sekarang <ArrowRight className="ml-2 w-6 h-6" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700">
                <Play className="mr-2 w-5 h-5" /> Lihat Demo
              </button>
            </motion.div>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, type: "spring", stiffness: 200 }}
              >
                <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Feature Card with hover animations
const FeatureCard = ({ icon: Icon, title, children, delay, gradient }) => (
  <motion.div 
    className="group relative p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl dark:shadow-none transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -10, scale: 1.02 }}
  >
    {/* Background gradient on hover */}
    <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
    
    <motion.div 
      className={`flex items-center justify-center w-16 h-16 ${gradient} rounded-2xl mb-6 relative z-10`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Icon className="w-8 h-8 text-white" />
    </motion.div>
    
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 relative z-10">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed relative z-10">
      {children}
    </p>
  </motion.div>
);

// Enhanced Features Section
const FeaturesSection = () => (
  <section className="py-24 bg-gray-50 dark:bg-gray-800/30">
    <div className="container mx-auto px-6">
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
            Kenapa Memilih 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 block">
              ParkWise?
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Kami menyediakan solusi parkir modern yang dirancang untuk kenyamanan dan efisiensi maksimal.
          </p>
        </motion.div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard 
          icon={Smartphone} 
          title="Booking Mudah" 
          delay={0.1}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        >
          Pesan slot parkir Anda hanya dengan beberapa ketukan di ponsel, kapan saja dan di mana saja dengan interface yang intuitif.
        </FeatureCard>
        
        <FeatureCard 
          icon={CheckCircle} 
          title="Slot Terjamin" 
          delay={0.2}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
        >
          Tidak perlu lagi berputar-putar. Slot parkir yang Anda pesan dijamin tersedia saat Anda tiba dengan teknologi real-time.
        </FeatureCard>
        
        <FeatureCard 
          icon={ShieldCheck} 
          title="Pembayaran Aman" 
          delay={0.3}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        >
          Sistem pembayaran digital yang aman dan transparan dengan enkripsi tingkat bank, tanpa biaya tersembunyi.
        </FeatureCard>
        
        <FeatureCard 
          icon={Zap} 
          title="Check-in Cepat" 
          delay={0.4}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
        >
          Masuk dan keluar area parkir dengan cepat menggunakan kode QR atau teknologi pengenalan plat nomor otomatis.
        </FeatureCard>
        
        <FeatureCard 
          icon={Users} 
          title="Admin Dashboard" 
          delay={0.5}
          gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
        >
          Panel admin yang powerful dengan AI insights untuk mengelola lokasi, slot, dan memonitor pendapatan secara real-time.
        </FeatureCard>
        
        <FeatureCard 
          icon={Star} 
          title="Smart Analytics" 
          delay={0.6}
          gradient="bg-gradient-to-br from-pink-500 to-red-600"
        >
          Dapatkan wawasan berharga dari data parkir dengan machine learning untuk mengoptimalkan operasi bisnis Anda.
        </FeatureCard>
      </div>
    </div>
  </section>
);

// Enhanced Location Types Section
const LocationTypesSection = () => {
  const locations = [
    { icon: Building2, name: "Mall & Shopping Center", count: "150+ Lokasi", gradient: "from-blue-500 to-indigo-600" },
    { icon: Car, name: "Gedung Perkantoran", count: "200+ Lokasi", gradient: "from-green-500 to-teal-600" },
    { icon: Plane, name: "Bandara", count: "25+ Lokasi", gradient: "from-purple-500 to-pink-600" }
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Tersedia di Berbagai Lokasi
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Dari mall hingga bandara, temukan slot parkir di mana pun Anda berada
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.name}
              className="group relative text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-500 shadow-lg hover:shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${location.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <location.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {location.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-semibold">
                {location.count}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced How It Works with animation
const HowItWorksStep = ({ icon: Icon, step, title, children, isLast = false, gradient }) => (
  <motion.div 
    className="relative flex flex-col items-center text-center max-w-sm mx-auto"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: step * 0.2 }}
  >
    <motion.div 
      className={`relative w-24 h-24 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mb-6 shadow-xl`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Icon className="w-12 h-12 text-white" />
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{step}</span>
      </div>
    </motion.div>
    
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{children}</p>
    
    {!isLast && (
      <motion.div 
        className="hidden lg:block absolute top-12 left-full w-24 h-px bg-gradient-to-r from-blue-300 to-purple-300"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: step * 0.2 + 0.5 }}
      />
    )}
  </motion.div>
);

const HowItWorksSection = () => (
  <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
    <div className="container mx-auto px-6">
      <div className="text-center mb-20">
        <motion.h2 
          className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Hanya 3 Langkah Mudah
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Mulai gunakan ParkWise dengan proses yang cepat dan intuitif
        </motion.p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-16 lg:gap-8">
        <HowItWorksStep 
          icon={Search} 
          step={1} 
          title="Cari & Pilih"
          gradient="from-blue-500 to-indigo-600"
        >
          Masukkan tujuan Anda dan pilih lokasi parkir yang tersedia dari daftar kami dengan filter lokasi dan harga.
        </HowItWorksStep>
        
        <HowItWorksStep 
          icon={MapPin} 
          step={2} 
          title="Pesan & Bayar"
          gradient="from-green-500 to-emerald-600"
        >
          Pilih slot yang Anda inginkan, tentukan durasi, dan selesaikan pembayaran dengan aman melalui berbagai metode.
        </HowItWorksStep>
        
        <HowItWorksStep 
          icon={ParkingCircle} 
          step={3} 
          title="Parkir & Nikmati"
          gradient="from-purple-500 to-pink-600"
          isLast={true}
        >
          Tiba di lokasi, tunjukkan QR code booking Anda, dan nikmati waktu Anda tanpa khawatir dengan notifikasi real-time.
        </HowItWorksStep>
      </div>
    </div>
  </section>
);

// Enhanced Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Business Executive",
      content: "ParkWise mengubah cara saya mencari parkir di Jakarta. Tidak ada lagi stress mencari tempat parkir!",
      avatar: "SC"
    },
    {
      name: "Ahmad Rahman",
      role: "Mall Manager",
      content: "Sebagai pengelola mal, ParkWise membantu kami mengoptimalkan penggunaan area parkir dan meningkatkan revenue.",
      avatar: "AR"
    },
    {
      name: "Lisa Wong",
      role: "Frequent Traveler",
      content: "Booking parkir bandara jadi sangat mudah. Aplikasi yang sangat user-friendly dan terpercaya!",
      avatar: "LW"
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Apa Kata Mereka?
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.content}"</p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced CTA with urgency
const CTASection = () => (
  <section className="relative py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
    </div>
    
    <div className="container mx-auto px-6 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
          Siap Mengubah Cara<br />Anda Parkir?
        </h2>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
          Bergabunglah dengan ribuan pengguna dan mitra yang telah merasakan kemudahan bersama ParkWise. 
          Daftar sekarang dan dapatkan diskon 50% pada booking pertama Anda!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/register" className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-blue-600 bg-white rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl">
              <Check className="mr-2 w-5 h-5" />
              Daftar Gratis Sekarang
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <button className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all">
              <Clock className="mr-2 w-5 h-5" />
              Promo Terbatas!
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

// Enhanced Footer
const Footer = () => (
  <footer className="bg-gray-900 dark:bg-black text-gray-400 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/20"></div>
    <div className="container mx-auto px-6 py-16 relative z-10">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ParkingCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Park<span className="text-blue-400">Wise</span></h3>
          </div>
          <p className="text-lg text-gray-300 mb-6 max-w-md">
            Solusi parkir cerdas untuk kota modern. Menghadirkan kemudahan dan efisiensi dalam setiap perjalanan Anda.
          </p>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
              <span className="text-sm font-bold">IG</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-bold text-white mb-4">Produk</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="hover:text-white transition-colors">Booking Parkir</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Analytics</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Mobile App</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-bold text-white mb-4">Perusahaan</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="hover:text-white transition-colors">Tentang Kami</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Karir</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Kontak</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-gray-800 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Afif Syam Fauzi. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="/keb.pdf" target='_blank' className="text-sm hover:text-white transition-colors">Kebijakan Privasi</Link>
          <Link href="/sk.pdf" target='_blank' className="text-sm hover:text-white transition-colors">Syarat & Ketentuan</Link>
          <Link href="/ck.pdf" target='_blank' className="text-sm hover:text-white transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-gray-900 overflow-x-hidden scrollbar-hidden">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <LocationTypesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}