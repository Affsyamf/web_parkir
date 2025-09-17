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
        const {searchParams} = new URL(request.url);
        const type = searchParams.get('type') || 'ALL';
        
        let whereClauses = ["b.status IN ('completed', 'cancelled')"];
        const queryParams = [];
        let paramIndex = 1;

        if (type.toUpperCase() !== 'ALL') {
            whereClauses.push(`l.type = $${paramIndex}`);
            queryParams.push(type.toUpperCase());
            paramIndex++;
        }

        //semua kondisi filter dalam 1 string

        const whereCondition = `WHERE ${whereClauses.join(' AND ')}`;

        const fullQuery = `
            SELECT 
                b.id,
                u.name as user_name,
                l.name as location_name,
                ps.spot_code,
                b.entry_time,
                b.actual_exit_time,
                b.total_price
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN locations l ON b.location_id = l.id
            JOIN parking_slots ps ON b.spot_id = ps.id
            ${whereCondition}
            ORDER BY b.entry_time DESC;
        `;

        const result = await query(fullQuery, queryParams);
        return NextResponse.json({ reportData: result.rows }, { status: 200 });

    } catch (error) {
        console.error('API GET report error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data laporan.' }, { status: 500 });

    }
}