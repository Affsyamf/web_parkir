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

        const limit = 10;
        const offset = (page - 1) * limit;
        
        let whereClauses = ["b.status IN ('completed', 'cancelled')"];
        let queryParams = [];
        let paramIndex = 1;

        if (type.toUpperCase() !== 'ALL') {
            whereClauses.push(`l.type = $${paramIndex}`);
            queryParams.push(type.toUpperCase());
            paramIndex++;
        }
        
        if (search) {
            whereClauses.push(`(u.name ILIKE $${paramIndex} OR l.name ILIKE $${paramIndex} OR CAST(b.id AS TEXT) ILIKE $${paramIndex})`);
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        const whereCondition = `WHERE ${whereClauses.join(' AND ')}`;
        
        const dataQuery = `
            SELECT 
                b.id, u.name as user_name, l.name as location_name,
                ps.spot_code, b.entry_time, b.actual_exit_time, b.total_price
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN locations l ON b.location_id = l.id
            JOIN parking_slots ps ON b.spot_id = ps.id
            ${whereCondition}
            ORDER BY b.entry_time DESC
            ${forPrint ? '' : `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`};
        `;
        
        const countQuery = `
            SELECT COUNT(*) FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN locations l ON b.location_id = l.id
            JOIN parking_slots ps ON b.spot_id = ps.id
            ${whereCondition};
        `;
        
        const queryExecutionParams = forPrint ? queryParams : [...queryParams, limit, offset];

        const [dataResult, countResult] = await Promise.all([
            query(dataQuery, queryExecutionParams),
            query(countQuery, queryParams)
        ]);
        
        const totalCount = parseInt(countResult.rows[0].count, 10);

        return NextResponse.json({
            reportData: dataResult.rows,
            totalCount: totalCount
        }, { status: 200 });

    } catch (error) {
        console.error('API GET report error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data laporan.' }, { status: 500 });
    }
}

