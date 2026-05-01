import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { isValidSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rows = await query('SELECT * FROM products ORDER BY created_at DESC');

        // Convert MySQL tinyint to JS booleans
        const products = rows.map(row => ({
            ...row,
            is_video: !!row.is_video,
            is_available: !!row.is_available,
            is_pinned: !!row.is_pinned,
            is_archived: !!row.is_archived,
        }));

        return NextResponse.json(products);
    } catch (err) {
        console.error('API Products GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...inputData } = body;

        const allowedFields = [
            'code', 'category', 'variant', 'gender', 'age', 'size',
            'stock', 'price', 'shopee', 'img', 'img2', 'img3', 'img4', 'is_video',
            'is_available', 'is_pinned', 'is_archived', 'archived_at', 'sold_at'
        ];

        const data = {};
        allowedFields.forEach(field => {
            if (inputData[field] !== undefined) data[field] = inputData[field];
        });

        // Convert booleans to 0/1 for MySQL
        ['is_video', 'is_available', 'is_pinned', 'is_archived'].forEach(field => {
            if (data[field] !== undefined) {
                data[field] = data[field] ? 1 : 0;
            }
        });

        if (id) {
            // UPDATE
            const fields = Object.keys(data);
            if (fields.length === 0) {
                return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
            }
            const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');
            const values = fields.map(f => data[f]);
            values.push(id);
            await execute(`UPDATE products SET ${setClause} WHERE id = ?`, values);
        } else {
            // INSERT
            const fields = Object.keys(data);
            const placeholders = fields.map(() => '?').join(', ');
            const columns = fields.map(f => `\`${f}\``).join(', ');
            const values = fields.map(f => data[f]);
            await execute(`INSERT INTO products (${columns}) VALUES (${placeholders})`, values);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Products POST Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await execute('DELETE FROM products WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Products DELETE Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
