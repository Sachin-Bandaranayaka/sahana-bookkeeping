import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('memberId');

    try {
        const query = memberId
            ? {
                where: {
                    memberId,
                },
                include: {
                    member: true,
                    payments: {
                        orderBy: {
                            date: 'desc',
                        },
                    },
                },
                orderBy: [
                    {
                        status: 'asc',
                    },
                    {
                        startDate: 'desc',
                    },
                ],
            }
            : {
                include: {
                    member: true,
                    payments: {
                        orderBy: {
                            date: 'desc',
                        },
                    },
                },
                orderBy: [
                    {
                        status: 'asc',
                    },
                    {
                        startDate: 'desc',
                    },
                ],
            };

        const loans = await prisma.loan.findMany(query);
        return NextResponse.json(loans);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch loans';
        console.error('Failed to fetch loans:', errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { memberId, type, principal, startDate, interestRate } = data;

        if (!memberId || !type || !principal || !startDate || interestRate === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const loan = await prisma.loan.create({
            data: {
                memberId,
                type,
                principal,
                startDate: new Date(startDate),
                interestRate,
                balance: principal,
                status: 'ACTIVE',
            },
        });

        return NextResponse.json(loan, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create loan';
        console.error('Failed to create loan:', errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}