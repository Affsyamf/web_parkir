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
    // --- PERBAIKAN DI SINI ---
    // Mengganti 'parking_spots p' menjadi 'parking_slots ps'
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');

    let filterClause = "WHERE b.status = 'active'";
    const queryParams = [];

    if (typeFilter && typeFilter.toUpperCase() !== 'ALL') {
      filterClause += ` AND l.type = $1`;
      queryParams.push(typeFilter.toUpperCase());
    }

    const fullQuery = `
      SELECT 
        b.id, b.status, b.entry_time, b.estimated_exit_time,
        u.name as user_name,
        l.name as location_name,
        l.type as location_type,
        p.spot_code
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN locations l ON b.location_id = l.id
       JOIN parking_slots p ON b.spot_id = p.id
       ${filterClause}
       ORDER BY b.estimated_exit_time ASC
    `;

    const result = await query(fullQuery, queryParams);

    return NextResponse.json({ activeBookings: result.rows }, { status: 200 });
  } catch (error) {
    console.error('API GET monitoring error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data monitoring.' }, { status: 500 });
  }
}

