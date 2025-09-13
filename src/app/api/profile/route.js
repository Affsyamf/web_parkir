// --- FILE BARU ---
// Endpoint ini digunakan untuk mengelola data profil pengguna yang sedang login.

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

// Handler untuk PUT (Update profil)
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const userId = session.user.id;
    const { name, newPassword } = await request.json();

    // Membangun query secara dinamis
    let updateQuery = 'UPDATE users SET';
    const queryParams = [];
    let paramIndex = 1;

    if (name) {
      updateQuery += ` name = $${paramIndex}`;
      queryParams.push(name);
      paramIndex++;
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      if (queryParams.length > 0) updateQuery += ',';
      updateQuery += ` password = $${paramIndex}`;
      queryParams.push(hashedPassword);
      paramIndex++;
    }

    // Jika tidak ada data yang dikirim, kembalikan error
    if (queryParams.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data untuk diperbarui.' }, { status: 400 });
    }

    updateQuery += ` WHERE id = $${paramIndex} RETURNING id, name, email, role`;
    queryParams.push(userId);
    
    const result = await query(updateQuery, queryParams);

    if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] }, { status: 200 });

  } catch (error) {
    console.error('API PUT profile error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui profil.' }, { status: 500 });
  }
}
