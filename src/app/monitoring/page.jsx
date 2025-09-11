'use client'; // Menandakan ini adalah Client Component agar bisa menggunakan state dan effect

import { useEffect, useState } from 'react';

// Fungsi untuk menentukan warna berdasarkan status spot parkir
const getStatusColor = (status) => {
  switch (status) {
    case 'available':
      return 'bg-green-200 border-green-400 text-green-800';
    case 'booked':
      return 'bg-red-200 border-red-400 text-red-800';
    case 'maintenance':
      return 'bg-yellow-200 border-yellow-400 text-yellow-800';
    default:
      return 'bg-gray-200 border-gray-400 text-gray-800';
  }
};


export default function MonitoringPage() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect untuk mengambil data dari API saat komponen pertama kali dirender
  useEffect(() => {
    async function fetchParkingSpots() {
      // Menggunakan path absolut untuk fetch API
      try {
        const response = await fetch('/api/parking-spots');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSpots(data.spots);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchParkingSpots();
  }, []); // Array kosong `[]` memastikan ini hanya berjalan sekali

  // Tampilan saat data sedang dimuat
  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">Memuat data lahan parkir...</p>
          <div className="mt-4 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </main>
    );
  }

  // Tampilan jika terjadi error
  if (error) {
    return (
      <main className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Gagal Memuat!</strong>
            <span className="block sm:inline"> Terjadi kesalahan: {error}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-100 min-h-screen">
       <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    Dashboard Parkir
                </h1>
                <a href="/" className="text-blue-600 hover:underline">Kembali ke Beranda</a>
            </div>
       </header>
       <div className="container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {spots.map((spot) => (
                <div
                    key={spot.id}
                    className={`p-3 border rounded-lg text-center font-semibold shadow-sm transition-transform hover:scale-105 cursor-pointer ${getStatusColor(spot.status)}`}
                >
                    <p className="text-lg">{spot.spot_code}</p>
                    <p className="text-xs capitalize">{spot.status}</p>
                </div>
                ))}
            </div>
       </div>
    </main>
  );
}
