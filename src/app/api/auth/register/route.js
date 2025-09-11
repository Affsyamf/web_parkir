import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // 1. Validasi input
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Nama, email, dan password harus diisi.' }, { status: 400 });
    }

    // 2. Cek apakah email sudah terdaftar
    const checkUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 409 }); // 409 Conflict
    }

    // 3. Hash password
    const hashedPassword = await hash(password, 10);

    // 4. Masukkan pengguna baru ke database
    const newUser = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'USER']
    );

    return NextResponse.json(
      { user: newUser.rows[0], message: 'Pengguna berhasil dibuat.' },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
