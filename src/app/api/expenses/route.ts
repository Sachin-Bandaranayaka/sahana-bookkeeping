import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    try {
        // Build the where clause based on query parameters
        let whereClause: any = {};

        if (startDate && endDate) {
            whereClause.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        } else if (startDate) {
            whereClause.date = {
                gte: new Date(startDate),
            };
        } else if (endDate) {
            whereClause.date = {
                lte: new Date(endDate),
            };
        }

        if (category) {
            whereClause.category = category;
        }

        const expenses = await prisma.expense.findMany({
            where: whereClause,
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expenses' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { date, category, description, amount } = data;

        if (!date || !category || !description || amount === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const expense = await prisma.expense.create({
            data: {
                date: new Date(date),
                category,
                description,
                amount,
            },
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json(
            { error: 'Failed to create expense' },
            { status: 500 }
        );
    }
} 