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
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'ALL';
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const forPrint = searchParams.get('forPrint') === 'true';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const limit = 10;
        const offset = (page - 1) * limit;
        
        let whereClauses = ["b.status IN ('completed', 'cancelled')"];
        let queryParams = [];
        let paramIndex = 1;

        // Filter tipe lokasi
        if (type.toUpperCase() !== 'ALL') {
            whereClauses.push(`l.type = $${paramIndex}`);
            queryParams.push(type.toUpperCase());
            paramIndex++;
        }
        
        // Filter pencarian
        if (search) {
            whereClauses.push(`(
                u.name ILIKE $${paramIndex} 
                OR l.name ILIKE $${paramIndex} 
                OR CAST(b.id AS TEXT) ILIKE $${paramIndex}
            )`);
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // ✅ Filter tanggal (basis harian, overlap)
        if (startDate && endDate) {
            whereClauses.push(`
                b.entry_time <= $${paramIndex + 1}::date + interval '23 hours 59 minutes 59 seconds'
                AND b.actual_exit_time >= $${paramIndex}::date
            `);

            queryParams.push(startDate, endDate);
            paramIndex += 2;
        }

        const whereCondition = `WHERE ${whereClauses.join(' AND ')}`;
        
        let fullDataQuery = `
            SELECT 
                b.id, u.name as user_name, l.name as location_name,
                ps.spot_code, b.entry_time, b.actual_exit_time, b.total_price
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN locations l ON b.location_id = l.id
            JOIN parking_slots ps ON b.spot_id = ps.id
            ${whereCondition}
            ORDER BY b.entry_time DESC
        `;
        
        const countQuery = `
            SELECT COUNT(*) 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN locations l ON b.location_id = l.id
            JOIN parking_slots ps ON b.spot_id = ps.id
            ${whereCondition};
        `;
        
        let dataQueryParams = [...queryParams];

        // Pagination
        if (!forPrint) {
            fullDataQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            dataQueryParams.push(limit, offset);
        }

        const [dataResult, countResult] = await Promise.all([
            query(fullDataQuery, dataQueryParams),
            query(countQuery, queryParams)
        ]);
        
        const totalCount = parseInt(countResult.rows[0].count, 10);

        return NextResponse.json({
            reportData: dataResult.rows,
            totalCount
        }, { status: 200 });

    } catch (error) {
        console.error('API GET report error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data laporan.' }, { status: 500 });
    }
}
