import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Handler untuk GET (mendukung pencarian dan pagination)
export async function GET(request) {
  // Keamanan: Kita tetap izinkan user biasa melihat daftar lokasi
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    // --- KOMENTAR: Mengambil parameter search dan page dari URL ---
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 5; // Menampilkan 5 lokasi per halaman
    const offset = (page - 1) * limit;

    // --- KOMENTAR: Query utama dengan pencarian (ILIKE) dan pagination (LIMIT, OFFSET) ---
    const searchQuery = `
      SELECT
          l.id, l.name, l.address, l.type, l.total_slots,
          l.total_slots - COUNT(p.id) AS available_slots
      FROM locations l
      LEFT JOIN parking_slots p ON l.id = p.location_id AND p.status = 'booked'
      WHERE l.name ILIKE $1 OR l.type ILIKE $1
      GROUP BY l.id
      ORDER BY l.name ASC
      LIMIT $2 OFFSET $3;
    `;
    
    // --- KOMENTAR: Query kedua untuk menghitung total hasil pencarian (untuk info pagination) ---
    const countQuery = `
      SELECT COUNT(*) 
      FROM locations 
      WHERE name ILIKE $1 OR type ILIKE $1;
    `;

    const searchTermPattern = `%${searchTerm}%`;

    // Jalankan kedua query secara paralel untuk efisiensi
    const [locationsResult, totalResult] = await Promise.all([
        query(searchQuery, [searchTermPattern, limit, offset]),
        query(countQuery, [searchTermPattern])
    ]);

    // Mengirim kembali data lokasi dan totalnya
    return NextResponse.json({ 
        locations: locationsResult.rows,
        totalLocations: parseInt(totalResult.rows[0].count, 10) 
    }, { status: 200 });

  } catch (error) {
    console.error('API GET locations error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data lokasi.' }, { status: 500 });
  }
}


// Handler untuk POST (menambahkan lokasi baru) - Tidak ada perubahan di sini
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role?.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Akses ditolak. Anda bukan admin.' }, { status: 403 });
  }

  try {
    const { name, address, type, totalSlots } = await request.json();

    if (!name || !address || !type || (typeof totalSlots !== 'number' || totalSlots <= 0)) {
        return NextResponse.json({ error: 'Data tidak valid. Pastikan semua kolom terisi dan Total Slot lebih besar dari 0.' }, { status: 400 });
    }

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

