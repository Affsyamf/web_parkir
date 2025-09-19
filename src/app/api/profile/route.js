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
export async function PUT(request) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
    await profileLimiter.check(identifier);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logSecurityEvent('UNAUTHORIZED_PROFILE_UPDATE', null);
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const userId = session.user.id;

    // Validasi format user ID
    if (!/^\d+$/.test(userId.toString())) {
      logSecurityEvent('INVALID_USER_ID_FORMAT', userId);
      return NextResponse.json({ error: 'ID pengguna tidak valid.' }, { status: 400 });
    }

    // Parse dan sanitize input
    let body;
    try {
      body = await request.json();
    } catch (error) {
      logSecurityEvent('INVALID_JSON_PROFILE_UPDATE', userId);
      return NextResponse.json({ error: 'Format data tidak valid.' }, { status: 400 });
    }

    // Sanitize inputs
    if (body.name) body.name = sanitizeInput(body.name);
    if (body.currentPassword) body.currentPassword = sanitizeInput(body.currentPassword);
    if (body.newPassword) body.newPassword = sanitizeInput(body.newPassword);

    // Validate input dengan Zod
    let validatedData;
    try {
      validatedData = profileUpdateSchema.parse(body);
    } catch (error) {
      logSecurityEvent('VALIDATION_FAILED_PROFILE_UPDATE', userId, { 
        errors: error.errors.map(e => e.message) 
      });
      return NextResponse.json({ 
        error: 'Data tidak valid.', 
        details: error.errors.map(e => e.message) 
      }, { status: 400 });
    }

    const { name, currentPassword, newPassword } = validatedData;

    // Jika mengubah password, validasi password lama
    if (newPassword) {
      if (!currentPassword) {
        logSecurityEvent('PASSWORD_CHANGE_WITHOUT_CURRENT', userId);
        return NextResponse.json({ 
          error: 'Password saat ini diperlukan untuk mengubah password.' 
        }, { status: 400 });
      }

      // Ambil password hash dari database
      const currentUserResult = await query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );

      if (currentUserResult.rowCount === 0) {
        logSecurityEvent('USER_NOT_FOUND_PASSWORD_CHANGE', userId);
        return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
      }

      // Verifikasi password lama
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword, 
        currentUserResult.rows[0].password
      );

      if (!isCurrentPasswordValid) {
        logSecurityEvent('INVALID_CURRENT_PASSWORD', userId);
        return NextResponse.json({ 
          error: 'Password saat ini tidak benar.' 
        }, { status: 400 });
      }

      // Cek apakah password baru sama dengan password lama
      const isSamePassword = await bcrypt.compare(
        newPassword, 
        currentUserResult.rows[0].password
      );

      if (isSamePassword) {
        logSecurityEvent('SAME_PASSWORD_UPDATE_ATTEMPT', userId);
        return NextResponse.json({ 
          error: 'Password baru harus berbeda dari password saat ini.' 
        }, { status: 400 });
      }
    }

    // Membangun query secara dinamis
    let updateQuery = 'UPDATE users SET updated_at = NOW()';
    const queryParams = [];
    let paramIndex = 1;

    if (name && name !== session.user.name) {
      // Cek apakah nama sudah digunakan oleh user lain
      const nameCheckResult = await query(
        'SELECT id FROM users WHERE LOWER(name) = LOWER($1) AND id != $2',
        [name, userId]
      );

      if (nameCheckResult.rowCount > 0) {
        logSecurityEvent('DUPLICATE_NAME_UPDATE_ATTEMPT', userId, { attemptedName: name });
        return NextResponse.json({ 
          error: 'Nama tersebut sudah digunakan.' 
        }, { status: 409 });
      }

      updateQuery += `, name = $${paramIndex}`;
      queryParams.push(name);
      paramIndex++;
    }

    if (newPassword) {
      // Hash password baru dengan salt yang kuat
      const saltRounds = 12; // Meningkatkan dari default 10
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      updateQuery += `, password = $${paramIndex}`;
      queryParams.push(hashedPassword);
      paramIndex++;
    }

    // Jika tidak ada data yang diubah
    if (queryParams.length === 0) {
      logSecurityEvent('NO_DATA_TO_UPDATE', userId);
      return NextResponse.json({ 
        error: 'Tidak ada data untuk diperbarui.' 
      }, { status: 400 });
    }

    updateQuery += ` WHERE id = $${paramIndex} RETURNING id, name, email, role, updated_at`;
    queryParams.push(userId);
    
    // Eksekusi update dengan transaction untuk atomicity
    const result = await query('BEGIN');
    try {
      const updateResult = await query(updateQuery, queryParams);

      if (updateResult.rowCount === 0) {
        await query('ROLLBACK');
        logSecurityEvent('USER_NOT_FOUND_UPDATE', userId);
        return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
      }

      await query('COMMIT');

      logSecurityEvent('PROFILE_UPDATED_SUCCESSFULLY', userId, {
        updatedFields: {
          name: !!name,
          password: !!newPassword
        }
      });

      return NextResponse.json({ 
        user: updateResult.rows[0],
        message: 'Profil berhasil diperbarui.'
      }, { status: 200 });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      return NextResponse.json({ 
        error: 'Terlalu banyak permintaan. Coba lagi nanti.' 
      }, { status: 429 });
    }

    console.error('API PUT profile error:', error);
    logSecurityEvent('PROFILE_UPDATE_ERROR', session?.user?.id || null, { 
      error: error.message 
    });
    
    return NextResponse.json({ 
      error: 'Gagal memperbarui profil.' 
    }, { status: 500 });
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