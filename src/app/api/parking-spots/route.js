import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// Handler untuk request GET ke /api/parking-spots
export async function GET(request) {
  try {
    const result = await query('SELECT * FROM parking_spots ORDER BY floor, spot_code ASC');
    return NextResponse.json({ spots: result.rows }, { status: 200 });
  } catch (error) {
    // Mengembalikan pesan error jika terjadi masalah
    return NextResponse.json({ error: 'Gagal mengambil data dari database.', details: error.message }, { status: 500 });
  }
}
