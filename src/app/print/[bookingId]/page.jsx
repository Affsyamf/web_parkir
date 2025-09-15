import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import PrintClientComponent from './PrintClientComponent';

// --- BAGIAN SERVER ---
// Fungsi ini berjalan di server untuk mengambil data sebelum halaman dimuat
async function getBookingData(bookingId, userId) {
    try {
        const cleanedBookingId = bookingId.split(':')[0];
        const result = await query(
            `SELECT b.*, l.name as location_name, l.address as location_address
             FROM bookings b
             JOIN locations l ON b.location_id = l.id
             WHERE b.id = $1 AND b.user_id = $2`,
            [cleanedBookingId, userId]
        );

        if (result.rows.length === 0) {
            return null; // Mengembalikan null jika tidak ditemukan
        }
        return result.rows[0];
    } catch (error) {
        console.error("Failed to fetch booking:", error);
        return null;
    }
}

// Komponen ini HARUS bernama page.jsx atau page.js
export default async function PrintBookingPage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        // Jika tidak ada sesi, redirect atau tampilkan error
        return notFound();
    }
    
    // params akan otomatis diisi oleh Next.js jika nama file-nya benar
    const bookingData = await getBookingData(params.bookingId, session.user.id);

    if (!bookingData) {
        // Jika data booking tidak ditemukan untuk user ini, tampilkan halaman 404
        return notFound();
    }

    // Meneruskan data yang sudah diambil ke komponen client
    return <PrintClientComponent booking={bookingData} />;
}

