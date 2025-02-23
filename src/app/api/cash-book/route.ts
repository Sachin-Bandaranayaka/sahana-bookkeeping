import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('memberId');

    try {
        const query = memberId
            ? {
                where: {
                    memberId,
                },
                orderBy: {
                    date: 'desc' as const,
                },
                include: {
                    member: {
                        select: {
                            name: true,
                        },
                    },
                },
            }
            : {
                orderBy: {
                    date: 'desc' as const,
                },
                include: {
                    member: {
                        select: {
                            name: true,
                        },
                    },
                },
            };

        const transactions = await prisma.cashBook.findMany(query);
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { memberId, date, description, amount } = data;

        if (!memberId || !date || !description || amount === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get the current total for the member
        const currentTotal = await prisma.cashBook.aggregate({
            where: {
                memberId,
            },
            _sum: {
                amount: true,
            },
        });

        const newTotal = (currentTotal._sum.amount || 0) + amount;

        const transaction = await prisma.cashBook.create({
            data: {
                memberId,
                date: new Date(date),
                description,
                amount,
                total: newTotal,
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json(
            { error: 'Failed to create transaction' },
            { status: 500 }
        );
    }
}