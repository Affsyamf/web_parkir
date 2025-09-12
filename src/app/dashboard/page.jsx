"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Car,
  Search,
  History,
  Clock,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Komponen Kartu Shortcut
const ShortcutCard = ({ title, description, icon: Icon, href, color }) => {
  const router = useRouter();
  const cardVariants = {
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 300 },
    },
  };
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`p-6 rounded-lg shadow-lg cursor-pointer flex flex-col justify-between h-full ${color}`}
      onClick={() => router.push(href)}
    >
      <div>
        <Icon className="w-10 h-10 mb-4 text-white" />
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-white/80 mt-1">{description}</p>
      </div>
    </motion.div>
  );
};

// Komponen Kartu Booking Aktif
const ActiveBookingCard = ({ booking }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!booking || !booking.estimated_exit_time) return;
    const interval = setInterval(() => {
      const now = new Date();
      const endTime = new Date(booking.estimated_exit_time);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("Waktu habis!");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours} jam ${minutes} menit`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Booking Aktif Anda
      </p>
      <h3 className="text-2xl font-bold mt-1">
        {booking.location_name} - Slot {booking.spot_code}
      </h3>
      <div className="flex items-center gap-2 mt-4 text-orange-500 dark:text-orange-400">
        <Clock size={18} />
        <p className="font-semibold">Sisa Waktu: {timeLeft}</p>
      </div>
    </div>
  );
};

// Komponen Stat Admin
const AdminStatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-3">
    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
      <Icon className="w-6 h-6 text-gray-500 dark:text-gray-300" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-lg font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeBooking, setActiveBooking] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchData = async () => {
        try {
          const bookingPromise = fetch("/api/bookings").then((res) => {
            if (!res.ok) return Promise.resolve(null); // Jangan error jika gagal
            return res.json();
          });

          // Hanya ambil data admin jika rolenya admin
          const adminPromise =
            session.user?.role?.toLowerCase() === "admin"
              ? fetch("/api/analytics").then((res) => {
                  if (!res.ok) return Promise.resolve(null);
                  return res.json();
                })
              : Promise.resolve(null);

          // Jalankan keduanya secara bersamaan
          const [bookingData, adminData] = await Promise.all([
            bookingPromise,
            adminPromise,
          ]);

          if (bookingData) {
            setActiveBooking(bookingData.activeBookings?.[0] || null);
          }

          if (adminData) {
            setAdminStats(adminData);
          }
        } catch (err) {
          toast.error("Gagal memuat data dashboard.");
        } finally {
          // Hentikan loading setelah semua selesai
          setIsLoading(false);
        }
      };
      fetchData();
    } else if (status === "unauthenticated") {
      setIsLoading(false); // Jika tidak login, hentikan loading
    }
  }, [status, session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) {
    return <p>Akses ditolak.</p>;
  }

  const isAdmin = session.user?.role?.toLowerCase() === "admin";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Selamat Datang, {session.user.name}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isAdmin
            ? "Berikut adalah ringkasan aktivitas di sistem Anda."
            : "Siap untuk parkir tanpa ribet? Mulai dari sini."}
        </p>
      </div>

      {isAdmin && adminStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Ringkasan Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatCard
              title="Total Pendapatan"
              value={`Rp ${Number(adminStats.totalRevenue).toLocaleString(
                "id-ID"
              )}`}
              icon={DollarSign}
            />
            <AdminStatCard
              title="Total Booking"
              value={adminStats.totalBookings}
              icon={History}
            />
            <AdminStatCard
              title="Lokasi Terpopuler"
              value={adminStats.bookingsByLocation[0]?.name || "-"}
              icon={TrendingUp}
            />
            <AdminStatCard
              title="Parkir Aktif"
              value={adminStats.activeBookingsCount || "0"}
              icon={Car}
            />
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeBooking ? (
            <ActiveBookingCard booking={activeBooking} />
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center h-full flex flex-col justify-center">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Tidak Ada Booking Aktif</h3>
              <p className="text-gray-500 text-sm">
                Anda sedang tidak memarkir kendaraan.
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-1 grid grid-rows-2 gap-6">
          <ShortcutCard
            title="Cari Parkir"
            description="Temukan dan pesan slot di lokasi favorit Anda."
            icon={Search}
            href="/dashboard/locations"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <ShortcutCard
            title="Riwayat Booking"
            description="Lihat semua transaksi parkir Anda yang lalu."
            icon={History}
            href="/dashboard/bookings"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>
      </div>
    </motion.div>
  );
}
