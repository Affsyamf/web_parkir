// --- FILE BARU ---
// Endpoint ini hanya untuk admin, untuk mengambil data agregat.

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role?.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    // Menjalankan beberapa query secara paralel untuk efisiensi
    const [
      totalRevenueResult,
      totalBookingsResult,
      bookingsByDayResult,
      bookingsByLocationResult,
      activeBookingsCountResult
    ] = await Promise.all([
      // 1. Menghitung total pendapatan dari booking yang selesai
      query("SELECT SUM(total_price) as total FROM bookings WHERE status = 'completed'"),
      // 2. Menghitung total semua booking
      query("SELECT COUNT(*) as total FROM bookings"),
      // 3. Menghitung jumlah booking & pendapatan per hari (7 hari terakhir)
      query(`
        SELECT 
          DATE(entry_time) as date, 
          COUNT(*) as count, 
          SUM(total_price) as revenue 
        FROM bookings 
        WHERE status = 'completed' AND entry_time >= current_date - interval '7 days'
        GROUP BY DATE(entry_time) 
        ORDER BY date ASC;
      `),
      // 4. Menghitung jumlah booking per lokasi
      query(`
        SELECT l.name, COUNT(b.id) as count 
        FROM bookings b 
        JOIN locations l ON b.location_id = l.id 
        GROUP BY l.name 
        ORDER BY count DESC;
      `),
       query("SELECT COUNT(*) as total FROM bookings WHERE status = 'active'")
    ]);

    // Format hasil query agar mudah digunakan di frontend
    const analyticsData = {
      totalRevenue: totalRevenueResult.rows[0]?.total || 0,
      totalBookings: totalBookingsResult.rows[0]?.total || 0,
      bookingsByDay: bookingsByDayResult.rows.map(row => ({
        // Format tanggal agar lebih mudah dibaca
        date: new Date(row.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        Jumlah: Number(row.count),
        Pendapatan: Number(row.revenue)
      })),
      bookingsByLocation: bookingsByLocationResult.rows.map(row => ({
        name: row.name,
        Jumlah: Number(row.count)
      })),
       activeBookingsCount: activeBookingsCountResult.rows[0]?.total || 0,
    };

    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    console.error('API GET analytics error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data analytics.' }, { status: 500 });
  }
}
