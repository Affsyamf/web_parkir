import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Handler untuk GET (Mengambil semua slot parkir untuk lokasi tertentu)
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }
  
    try {
      const { id: location_id } = params;
      // PERBAIKAN: Menambahkan logika pengurutan numerik pada spot_code
      // 'S' dihapus, string diubah jadi angka, lalu diurutkan.
      const result = await query(
        `SELECT * FROM parking_slots 
         WHERE location_id = $1 
         ORDER BY CAST(SUBSTRING(spot_code FROM 2) AS INTEGER) ASC`,
        [location_id]
      );
  
      return NextResponse.json({ slots: result.rows }, { status: 200 });
    } catch (error) {
      console.error('API GET slots by location ID error:', error);
      return NextResponse.json({ error: 'Gagal mengambil data slot parkir.' }, { status: 500 });
    }
}



