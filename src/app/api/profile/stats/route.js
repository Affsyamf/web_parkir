// --- FILE BARU ---
// Endpoint ini khusus untuk mengambil data statistik agregat untuk halaman profil.

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const userId = session.user.id;

    // Menjalankan beberapa query agregat secara paralel untuk efisiensi
    const [totalBookingsResult, totalSpentResult] = await Promise.all([
      // 1. Menghitung total semua booking (aktif dan selesai) milik pengguna
      query("SELECT COUNT(*) as total FROM bookings WHERE user_id = $1", [userId]),
      // 2. Menghitung total pengeluaran dari booking yang statusnya 'completed' milik pengguna
      query("SELECT SUM(total_price) as total FROM bookings WHERE user_id = $1 AND status = 'completed'", [userId])
    ]);

    const stats = {
      totalBookings: parseInt(totalBookingsResult.rows[0]?.total || 0, 10),
      totalSpent: parseFloat(totalSpentResult.rows[0]?.total || 0)
    };
    
    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error('API GET user stats error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data statistik.' }, { status: 500 });
  }
}
