import { Pool } from 'pg';

// Membuat connection pool yang akan digunakan di seluruh aplikasi.
// Konfigurasi koneksi diambil secara otomatis dari environment variable POSTGRES_URL.
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Fungsi helper untuk menjalankan query
export const query = (text, params) => pool.query(text, params);