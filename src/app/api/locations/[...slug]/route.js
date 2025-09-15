import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// Handler ini sekarang akan menangani SEMUA request ke /api/locations/...
export async function POST(request, { params }) {
    // params.slug akan berisi array, contoh: ['20', 'availability']
    const [id, action] = params.slug;

    // Kita hanya akan merespons jika action-nya adalah 'availability'
    if (action === 'availability') {
        try {
            const { startTime, endTime } = await request.json();

            if (!startTime || !endTime) {
                return NextResponse.json({ error: 'Waktu masuk dan keluar harus diisi.' }, { status: 400 });
            }

            const start = new Date(startTime);
            const end = new Date(endTime);

            if (start >= end) {
                return NextResponse.json({ error: 'Waktu keluar harus setelah waktu masuk.' }, { status: 400 });
            }

           const result = await query(
                `
                SELECT
                    ps.id,
                    ps.spot_code,
                    CASE
                        WHEN b.id IS NOT NULL THEN 'booked'
                        ELSE 'available'
                    END as status
                FROM parking_slots ps
                LEFT JOIN bookings b ON ps.id = b.spot_id
                    AND b.status IN ('active', 'upcoming')
                    AND b.entry_time < $2 AND b.estimated_exit_time > $1
                WHERE ps.location_id = $3
                ORDER BY CAST(SUBSTRING(ps.spot_code FROM 2) AS INTEGER) ASC;
                `,
                [start, end, id]
            );

            return NextResponse.json({ slots: result.rows });

        } catch (error) {
            console.error("API Availability Error:", error);
            return NextResponse.json({ error: "Gagal memeriksa ketersediaan slot." }, { status: 500 });
        }
    }

    // Jika request-nya bukan untuk 'availability', kembalikan 404
    return NextResponse.json({ error: 'Action tidak ditemukan.' }, { status: 404 });
}
