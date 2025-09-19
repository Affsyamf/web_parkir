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

        // --- PERBAIKAN UTAMA DI SINI ---
        // Menjalankan semua query agregat yang dibutuhkan dalam satu panggilan Promise.all
        const [
            totalBookingsResult,
            totalSpentResult,
            activeBookingsResult,
            lastBookingResult
        ] = await Promise.all([
            // 1. Menghitung total semua booking (aktif, selesai, dll.)
            query("SELECT COUNT(*) as total FROM bookings WHERE user_id = $1", [userId]),
            // 2. Menghitung total pengeluaran dari booking yang 'completed'
            query("SELECT SUM(total_price) as total FROM bookings WHERE user_id = $1 AND status = 'completed'", [userId]),
            // 3. (BARU) Menghitung jumlah booking yang statusnya 'active'
            query("SELECT COUNT(*) as total FROM bookings WHERE user_id = $1 AND status = 'active'", [userId]),
            // 4. (BARU) Mengambil tanggal booking terakhir (entry_time terbaru)
            query("SELECT entry_time FROM bookings WHERE user_id = $1 ORDER BY entry_time DESC LIMIT 1", [userId])
        ]);

        const stats = {
            totalBookings: parseInt(totalBookingsResult.rows[0]?.total || 0, 10),
            totalSpent: parseFloat(totalSpentResult.rows[0]?.total || 0),
            activeBookings: parseInt(activeBookingsResult.rows[0]?.total || 0, 10),
            lastBookingDate: lastBookingResult.rows[0]?.entry_time || null
        };
        
        return NextResponse.json(stats, { status: 200 });

    } catch (error) {
        console.error('API GET user stats error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data statistik.' }, { status: 500 });
    }
}
