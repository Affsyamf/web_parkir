import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Handler untuk GET (mengambil semua lokasi)
export async function GET() {
  try {
    const result = await query(`
      SELECT
          l.id,
          l.name,
          l.address,
          l.type,
          l.total_slots,
          l.total_slots - COUNT(p.id) AS available_slots
      FROM
          locations l
      LEFT JOIN
          parking_slots p ON l.id = p.location_id AND p.status = 'booked'
      GROUP BY
          l.id
      ORDER BY
          l.name ASC;
    `);
    return NextResponse.json({ locations: result.rows }, { status: 200 });
  } catch (error) {
    console.error('API GET locations error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data lokasi.' }, { status: 500 });
  }
}

// Handler untuk POST (menambahkan lokasi baru)
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role?.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Akses ditolak. Anda bukan admin.' }, { status: 403 });
  }
  
  try {
    const body = await request.json();
    const { name, address, type, totalSlots } = body;

    // === VALIDASI BARU YANG LEBIH BAIK ===
    // Memeriksa keberadaan properti string
    if (!name || !address || !type) {
      return NextResponse.json({ error: 'Nama, alamat, dan tipe lokasi harus diisi.' }, { status: 400 });
    }
    // Memeriksa totalSlots secara spesifik
    if (typeof totalSlots !== 'number' || totalSlots <= 0) {
      return NextResponse.json({ error: 'Total Slot harus berupa angka yang lebih besar dari 0.' }, { status: 400 });
    }
    // === AKHIR VALIDASI BARU ===

    const result = await query(
      'INSERT INTO locations (name, address, type, total_slots) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, address, type, totalSlots]
    );

    const newLocation = result.rows[0];

    for (let i = 1; i <= totalSlots; i++) {
      await query(
        'INSERT INTO parking_slots (location_id, spot_code, floor) VALUES ($1, $2, $3)',
        [newLocation.id, `S${i}`, 1]
      );
    }
    
    const finalLocation = {
        ...newLocation,
        available_slots: newLocation.total_slots
    };

    return NextResponse.json({ location: finalLocation }, { status: 201 });

  } catch (error) {
    console.error('API POST location error:', error);
    if (error.code === '23505') {
        return NextResponse.json({ error: 'Nama lokasi sudah ada.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal menambahkan lokasi baru.' }, { status: 500 });
  }
}

