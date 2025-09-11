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


export default function HomePage() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect untuk mengambil data dari API saat komponen pertama kali dirender
  useEffect(() => {
    async function fetchParkingSpots() {
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
      <main className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Memuat data lahan parkir...</p>
      </main>
    );
  }

  // Tampilan jika terjadi error
  if (error) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-500">Error: {error}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Monitoring Lahan Parkir
      </h1>
      
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
    </main>
  );
}
