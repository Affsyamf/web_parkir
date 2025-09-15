import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


// --- FUNGSI BARU: GET untuk mengambil detail satu booking ---
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    try {
        const { bookingId } = params;
        const result = await query(
            `SELECT b.*, l.name as location_name, l.address as location_address
             FROM bookings b
             JOIN locations l ON b.location_id = l.id
             WHERE b.id = $1 AND b.user_id = $2`,
            [bookingId, session.user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Booking tidak ditemukan.' }, { status: 404 });
        }

        return NextResponse.json({ booking: result.rows[0] }, { status: 200 });
    } catch (error) {
        console.error('API GET booking by ID error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data booking.' }, { status: 500 });
    }
}


// Handler untuk PUT (digunakan untuk checkout/menyelesaikan booking)
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const { id: bookingId } = params;
    const userId = session.user.id;
    const actualExitTime = new Date();

    await query('BEGIN');

    // 1. Ambil data booking, pastikan milik user yang benar dan statusnya 'active'
    const bookingResult = await query(
      "SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND status = 'active' FOR UPDATE",
      [bookingId, userId]
    );

    if (bookingResult.rowCount === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Booking tidak ditemukan atau sudah selesai.' }, { status: 404 });
    }

    const booking = bookingResult.rows[0];
    const entryTime = new Date(booking.entry_time);

    // 2. Hitung ulang total biaya berdasarkan durasi parkir aktual
    const durationInMillis = actualExitTime - entryTime;
    let durationInHours = Math.ceil(durationInMillis / (1000 * 60 * 60));
    // Minimal durasi adalah 1 jam
    if (durationInHours < 1) {
        durationInHours = 1;
    }

    const pricePerHour = 10000;
    const finalPrice = durationInHours * pricePerHour;

    // 3. Update data booking dengan waktu keluar aktual dan harga final
    const updatedBooking = await query(
      `UPDATE bookings 
       SET status = 'completed', actual_exit_time = $1, total_price = $2 
       WHERE id = $3 RETURNING *`,
      [actualExitTime, finalPrice, bookingId]
    );

    // 4. Kembalikan status slot parkir menjadi 'available'
    await query(
      "UPDATE parking_slots SET status = 'available' WHERE id = $1",
      [booking.spot_id]
    );

    await query('COMMIT');

    return NextResponse.json({ booking: updatedBooking.rows[0] }, { status: 200 });

  } catch (error) {
    await query('ROLLBACK');
    console.error('API PUT booking (checkout) error:', error);
    return NextResponse.json({ error: 'Gagal menyelesaikan booking.' }, { status: 500 });
  }
}

