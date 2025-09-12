import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Handler untuk PUT (Update/Edit lokasi)
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role?.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const { id } = params;
    const { name, address, type } = await request.json();

    if (!name || !address || !type) {
      return NextResponse.json({ error: 'Nama, alamat, dan tipe harus diisi.' }, { status: 400 });
    }

    const result = await query(
      'UPDATE locations SET name = $1, address = $2, type = $3 WHERE id = $4 RETURNING *',
      [name, address, type, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Lokasi tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ location: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('API PUT location error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui lokasi.' }, { status: 500 });
  }
}

// Handler untuk DELETE (Hapus lokasi)
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }
  
    try {
      const { id } = params;
  
      const result = await query('DELETE FROM locations WHERE id = $1 RETURNING *', [id]);
  
      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Lokasi tidak ditemukan.' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Lokasi berhasil dihapus.' }, { status: 200 });
    } catch (error) {
      console.error('API DELETE location error:', error);
      return NextResponse.json({ error: 'Gagal menghapus lokasi.' }, { status: 500 });
    }
}

