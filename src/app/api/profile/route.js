import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from '@/lib/rate-limit';

// Rate limiting untuk profile updates (5 requests per menit)
const profileLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// Validation schemas
const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Nama harus minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .regex(/^[a-zA-Z\s]+$/, 'Nama hanya boleh mengandung huruf dan spasi')
    .optional(),
  
  currentPassword: z.string()
    .min(1, 'Password saat ini diperlukan untuk mengubah password')
    .optional(),
    
  newPassword: z.string()
    .min(6, 'Password baru harus minimal 6 karakter')
    .max(128, 'Password terlalu panjang')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus mengandung huruf dan angka')
    .optional(),
});

// Input sanitization
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

// Logging function for security events
function logSecurityEvent(event, userId, details = {}) {
  console.log(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    userId,
    ...details
  });
}

// Handler untuk GET (Ambil data profil)
export async function GET(request) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
    await profileLimiter.check(identifier);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logSecurityEvent('UNAUTHORIZED_PROFILE_ACCESS', null);
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const userId = session.user.id;

    // Validasi format user ID
    if (!/^\d+$/.test(userId.toString())) {
      logSecurityEvent('INVALID_USER_ID_FORMAT', userId);
      return NextResponse.json({ error: 'ID pengguna tidak valid.' }, { status: 400 });
    }

    const result = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      logSecurityEvent('USER_NOT_FOUND_IN_PROFILE', userId);
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    logSecurityEvent('PROFILE_ACCESSED', userId);
    return NextResponse.json({ user: result.rows[0] }, { status: 200 });

  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 });
    }

    console.error('API GET profile error:', error);
    logSecurityEvent('PROFILE_GET_ERROR', null, { error: error.message });
    return NextResponse.json({ error: 'Gagal mengambil data profil.' }, { status: 500 });
  }
}

// Handler untuk PUT (Update profil)
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Validasi input
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.errors },
      { status: 400 }
    );
  }

  const { name, currentPassword, newPassword } = parsed.data;

  try {
    // Ambil user
    const userResult = await query(
      'SELECT * FROM users WHERE email=$1',
      [session.user.email]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Kalau mau ganti password, cek dulu currentPassword
    let hashedPassword = null;
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Password saat ini diperlukan' },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Password saat ini salah' },
          { status: 400 }
        );
      }

      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Update hanya name dan password
    const updateResult = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           password = COALESCE($2, password)
       WHERE email = $3
       RETURNING id, name, email, role, created_at`,
      [name || null, hashedPassword || null, session.user.email]
    );

    return NextResponse.json(
      { user: updateResult.rows[0] },
      { status: 200 }
    );

  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// Handler untuk DELETE (Hapus akun - opsional untuk keamanan)
export async function DELETE(request) {
  try {
    // Rate limiting lebih ketat untuk delete
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
    await profileLimiter.check(identifier, 2); // Hanya 2 attempts per menit

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logSecurityEvent('UNAUTHORIZED_ACCOUNT_DELETE', null);
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse body untuk confirmation password
    const { confirmPassword } = await request.json();

    if (!confirmPassword) {
      logSecurityEvent('DELETE_WITHOUT_PASSWORD_CONFIRMATION', userId);
      return NextResponse.json({ 
        error: 'Password diperlukan untuk menghapus akun.' 
      }, { status: 400 });
    }

    // Verifikasi password
    const userResult = await query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(
      confirmPassword, 
      userResult.rows[0].password
    );

    if (!isPasswordValid) {
      logSecurityEvent('INVALID_PASSWORD_DELETE_ATTEMPT', userId);
      return NextResponse.json({ 
        error: 'Password tidak benar.' 
      }, { status: 400 });
    }

    // Soft delete atau hard delete (tergantung kebijakan)
    await query('BEGIN');
    try {
      // Soft delete - tandai sebagai deleted
      await query(
        'UPDATE users SET deleted_at = NOW(), email = CONCAT(email, \'-deleted-\', extract(epoch from now())) WHERE id = $1',
        [userId]
      );

      await query('COMMIT');

      logSecurityEvent('ACCOUNT_DELETED', userId);
      
      return NextResponse.json({ 
        message: 'Akun berhasil dihapus.' 
      }, { status: 200 });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('API DELETE profile error:', error);
    logSecurityEvent('ACCOUNT_DELETE_ERROR', session?.user?.id || null, { 
      error: error.message 
    });
    
    return NextResponse.json({ 
      error: 'Gagal menghapus akun.' 
    }, { status: 500 });
  }
}