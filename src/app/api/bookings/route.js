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
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = 5;
        const offset = (page - 1) * limit;

        const [
            upcomingBookingsResult,
            activeBookingsResult,
            pastBookingsResult,
            totalPastBookingsResult
        ] = await Promise.all([
            // --- PERBAIKAN: Menambahkan 'estimated_exit_time' ke SELECT ---
            query(
                `SELECT b.*, l.name as location_name, ps.spot_code
                 FROM bookings b
                 LEFT JOIN locations l ON b.location_id = l.id
                 LEFT JOIN parking_slots ps ON b.spot_id = ps.id
                 WHERE b.user_id = $1 AND b.status = 'upcoming'
                 ORDER BY b.entry_time ASC`,
                [userId]
            ),
            query(
                `SELECT b.*, l.name as location_name, ps.spot_code
                 FROM bookings b
                 LEFT JOIN locations l ON b.location_id = l.id
                 LEFT JOIN parking_slots ps ON b.spot_id = ps.id
                 WHERE b.user_id = $1 AND b.status = 'active'
                 ORDER BY b.entry_time DESC`,
                [userId]
            ),
            query(
                `SELECT b.*, l.name as location_name, ps.spot_code
                 FROM bookings b
                 LEFT JOIN locations l ON b.location_id = l.id
                 LEFT JOIN parking_slots ps ON b.spot_id = ps.id
                 WHERE b.user_id = $1 AND (b.status = 'completed' OR b.status = 'cancelled')
                 ORDER BY b.entry_time DESC
                 LIMIT $2 OFFSET $3`,
                [userId, limit, offset]
            ),
            query(
                "SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND (status = 'completed' OR status = 'cancelled')",
                [userId]
            )
        ]);

        return NextResponse.json({ 
            upcomingBookings: upcomingBookingsResult.rows,
            activeBookings: activeBookingsResult.rows,
            pastBookings: pastBookingsResult.rows,
            totalPastBookings: parseInt(totalPastBookingsResult.rows[0].count, 10)
        }, { status: 200 });
    } catch (error) {
        console.error('API GET bookings error:', error);
        return NextResponse.json({ error: 'Gagal mengambil riwayat booking.' }, { status: 500 });
    }
}


export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Akses ditolak. Anda harus login.' }, { status: 403 });
    }

    try {
        const { slotId, entryTime, estimatedExitTime } = await request.json();
        const userId = session.user.id;

        if (!slotId || !estimatedExitTime) {
            return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
        }

        const now = new Date();
        const startTime = entryTime ? new Date(entryTime) : now;
        const estimatedEndTime = new Date(estimatedExitTime);
        
        const status = (startTime > now) ? 'upcoming' : 'active';
        
        if (estimatedEndTime <= startTime) {
            return NextResponse.json({ error: 'Waktu perkiraan keluar harus setelah waktu masuk.' }, { status: 400 });
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

        // --- PERBAIKAN: Mengganti 'actual_exit_time' menjadi 'estimated_exit_time' ---
        const bookingResult = await query(
            `INSERT INTO bookings (user_id, spot_id, location_id, entry_time, estimated_exit_time, total_price, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userId, slotId, slot.location_id, startTime, estimatedEndTime, totalPrice, status]
        );

        await query('COMMIT');
        
        return NextResponse.json({ booking: bookingResult.rows[0] }, { status: 201 });

    } catch (error) {
        await query('ROLLBACK');
        console.error('API POST booking error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan di server saat membuat booking.' }, { status: 500 });
    }
}

