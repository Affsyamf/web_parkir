import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Handler untuk GET (Mengambil data booking milik pengguna)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const userId = session.user.id;
    
     // --- PERUBAHAN UNTUK PAGINATION ---
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 5; // Kita akan menampilkan 5 riwayat booking per halaman
    const offset = (page - 1) * limit;

    // 1. Ambil SEMUA booking yang aktif (biasanya tidak banyak)
    const activeBookingsResult = await query(
      `SELECT b.id, b.status, b.entry_time, b.actual_exit_time, b.total_price, l.name as location_name, ps.spot_code
       FROM bookings b
       LEFT JOIN locations l ON b.location_id = l.id
       LEFT JOIN parking_slots ps ON b.spot_id = ps.id
       WHERE b.user_id = $1 AND b.status = 'active'
       ORDER BY b.entry_time DESC`,
      [userId]
    );

     // 2. Ambil RIWAYAT booking (yang sudah tidak aktif) secara bertahap (paginated)
    const pastBookingsResult = await query(
      `SELECT b.id, b.status, b.entry_time, b.actual_exit_time, b.total_price, l.name as location_name, ps.spot_code
       FROM bookings b
       LEFT JOIN locations l ON b.location_id = l.id
       LEFT JOIN parking_slots ps ON b.spot_id = ps.id
       WHERE b.user_id = $1 AND b.status != 'active'
       ORDER BY b.entry_time DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
     // 3. Hitung TOTAL riwayat booking untuk tahu kapan harus berhenti menampilkan tombol "Load More"
    const totalPastBookingsResult = await query(
      "SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND status != 'active'",
      [userId]
    );


    return NextResponse.json({ 
      activeBookings: activeBookingsResult.rows,
      pastBookings: pastBookingsResult.rows,
      totalPastBookings: parseInt(totalPastBookingsResult.rows[0].count, 10)
    }, { status: 200 });
  } catch (error) {
    console.error('API GET bookings error:', error);
    return NextResponse.json({ error: 'Gagal mengambil riwayat booking.' }, { status: 500 });
  }
}

// Handler untuk POST (Membuat booking baru)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Akses ditolak. Anda harus login.' }, { status: 403 });
  }

  try {
    const { slotId, estimatedExitTime } = await request.json();
    const userId = session.user.id;

    if (!slotId || !estimatedExitTime) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    const startTime = new Date();
    const estimatedEndTime = new Date(estimatedExitTime);

    if (estimatedEndTime <= startTime) {
      return NextResponse.json({ error: 'Waktu perkiraan keluar harus setelah waktu saat ini.' }, { status: 400 });
    }
    
    const durationInMillis = estimatedEndTime - startTime;
    const durationInHours = Math.ceil(durationInMillis / (1000 * 60 * 60));
    const pricePerHour = 10000;
    const totalPrice = durationInHours * pricePerHour;

    await query('BEGIN');

    const slotResult = await query(
      "SELECT * FROM parking_slots WHERE id = $1 AND status = 'available' FOR UPDATE", 
      [slotId]
    );

    if (slotResult.rowCount === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Slot tidak tersedia atau sudah dibooking orang lain.' }, { status: 409 });
    }

    const slot = slotResult.rows[0];

    await query("UPDATE parking_slots SET status = 'booked' WHERE id = $1", [slotId]);

    const bookingResult = await query(
      `INSERT INTO bookings (user_id, spot_id, location_id, entry_time, actual_exit_time, total_price, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, slotId, slot.location_id, startTime, estimatedEndTime, totalPrice, 'active']
    );

    await query('COMMIT');
    
    return NextResponse.json({ booking: bookingResult.rows[0] }, { status: 201 });

  } catch (error) {
    await query('ROLLBACK');
    console.error('API POST booking error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan di server saat membuat booking.' }, { status: 500 });
  }
}

